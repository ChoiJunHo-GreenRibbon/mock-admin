import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../services/auth";
import {
  applyLostBenefitPreset,
  getLostBenefitPresets,
  getLostBenefitSelection,
  revertLostBenefit,
} from "../services/lostBenefitPreset";
import { LostBenefitPreset } from "../types";
import { getEnvironmentLabel } from "../utils/env";

const PRESET_GROUPS = [
  {
    key: "default",
    title: "기본 케이스",
    description:
      "대표 흐름과 빈 결과, 청구불가 같은 기본 동작을 확인하는 케이스입니다.",
  },
  {
    key: "amount",
    title: "금액 기준",
    description:
      "병원 45,000원, 약국 60,000원 기준과 경계값을 검증하는 케이스입니다.",
  },
  {
    key: "filter",
    title: "필터 제외",
    description:
      "기지급, 시효, 진단코드, 병원 상태, 계약 조건으로 제외되는 케이스입니다.",
  },
  {
    key: "combination",
    title: "상태 조합",
    description: "병원비와 실손보험 유무 조합별 동작을 검증하는 케이스입니다.",
  },
] as const;

const getPresetGroupKey = (preset: LostBenefitPreset) => {
  if (preset.presetKey.includes("THRESHOLD")) {
    return "amount";
  }

  if (
    preset.presetKey.includes("EXCLUDED") ||
    preset.presetKey.includes("BLACK_HOSPITAL") ||
    preset.presetKey.includes("CLOSED_HOSPITAL")
  ) {
    return "filter";
  }

  if (
    preset.presetKey.includes("HAS_HOSPITAL_BILL") ||
    preset.presetKey.includes("HAS_ACTUAL_LOSS") ||
    preset.presetKey.includes("NO_ACTUAL_LOSS_NO_HOSPITAL")
  ) {
    return "combination";
  }

  return "default";
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getSession());
  const phoneNumber = session?.phoneNumber ?? "";
  const [presets, setPresets] = useState<LostBenefitPreset[]>([]);
  const [selectedPresetKey, setSelectedPresetKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAppliedAt, setLastAppliedAt] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const groupedPresets = PRESET_GROUPS.map((group) => ({
    ...group,
    presets: presets.filter(
      (preset) => getPresetGroupKey(preset) === group.key,
    ),
  })).filter((group) => group.presets.length > 0);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    if (!session) {
      navigate("/", { replace: true });
      return;
    }

    void getLostBenefitPresets()
      .then((response) => {
        setPresets(response.presets);
        setSelectedPresetKey(response.presets[0]?.presetKey ?? "");
      })
      .catch(() => {
        setLastAppliedAt(
          "preset 목록을 불러오지 못했습니다. mock API 상태를 확인해 주세요.",
        );
      });
  }, [navigate, phoneNumber, session]);

  useEffect(() => {
    if (!phoneNumber || presets.length === 0) {
      return;
    }

    void getLostBenefitSelection(phoneNumber)
      .then((response) => {
        const matchedPreset = presets.find(
          (preset) => preset.presetKey === response.selectedPresetKey,
        );
        setSelectedPresetKey(
          matchedPreset?.presetKey ?? presets[0]?.presetKey ?? "",
        );
      })
      .catch(() => {
        setSelectedPresetKey(
          (currentPresetKey) => currentPresetKey || presets[0]?.presetKey || "",
        );
        setLastAppliedAt(
          "현재 적용된 놓친보험금 preset을 불러오지 못해 기본 케이스를 선택했습니다.",
        );
      });
  }, [phoneNumber, presets]);

  const handleApply = async () => {
    if (!phoneNumber || !selectedPresetKey) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await applyLostBenefitPreset(
        phoneNumber,
        selectedPresetKey,
      );
      const selectedPreset = presets.find(
        (preset) => preset.presetKey === response.selectedPresetKey,
      );
      setSelectedPresetKey(response.selectedPresetKey);
      const message = `${phoneNumber} 번호 기준으로 놓친보험금 mock 케이스 "${
        selectedPreset?.title ?? response.selectedPresetKey
      }"를 적용했습니다.`;
      setLastAppliedAt(message);
      setToast({ message, tone: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "변경 적용에 실패했습니다.";
      setLastAppliedAt(message);
      setToast({ message, tone: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!phoneNumber) {
      return;
    }

    setIsLoading(true);

    try {
      await revertLostBenefit(phoneNumber);
      const defaultPresetKey = presets[0]?.presetKey ?? "";
      setSelectedPresetKey(defaultPresetKey);
      const message = `${phoneNumber} 번호 기준으로 놓친보험금 mock 설정을 초기화했습니다.`;
      setLastAppliedAt(message);
      setToast({ message, tone: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "변경 해제에 실패했습니다.";
      setLastAppliedAt(message);
      setToast({ message, tone: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  };

  return (
    <main className="shell">
      {toast ? (
        <div
          className={`toast toast--${toast.tone}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <section className="panel">
        <div className="toolbar">
          <div>
            <span className="eyebrow">{getEnvironmentLabel()}</span>
            <h1>놓친보험금 Mock 설정</h1>
          </div>

          <div className="toolbar__actions">
            <span className="chip">{session?.phoneNumber ?? "관리자"}</span>
            <button
              className="button button--ghost"
              type="button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="action-bar">
          <button
            className="button button--danger"
            type="button"
            disabled={!phoneNumber || isLoading}
            onClick={() =>
              showToast("대행 취소 기능은 준비 중입니다.", "error")
            }
          >
            대행 취소
          </button>
        </div>

        <div className="hero-grid">
          <div className="callout">
            <strong>사용 가이드</strong>
            <ul>
              <li>
                로그인한 본인 휴대폰번호 {phoneNumber} 에만 mock 케이스를
                적용합니다.
              </li>
              <li>
                아래 놓친보험금 케이스를 선택한 뒤 변경 적용을 누르면 로그인한
                번호에 바로 반영됩니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="section-list">
          <section className="settings-section">
            <div className="settings-section__header">
              <div>
                <h2>놓친보험금 Mock 케이스</h2>
                <p>
                  문서 기준으로 자주 검증할 케이스를 preset으로 묶었습니다.
                  지금은 구현된 케이스만 노출됩니다.
                </p>
              </div>
            </div>

            <div className="preset-list">
              {groupedPresets.map((group) => (
                <section className="preset-group" key={group.key}>
                  <button
                    type="button"
                    className="preset-group__header"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={!collapsedGroups[group.key]}
                  >
                    <div>
                      <h3>{group.title}</h3>
                      <p>{group.description}</p>
                    </div>
                    <div className="preset-group__header-side">
                      <span className="preset-group__count">
                        {group.presets.length}개
                      </span>
                      <span className="preset-group__toggle">
                        {collapsedGroups[group.key] ? "펼치기" : "접기"}
                      </span>
                    </div>
                  </button>

                  <div
                    className={`preset-group__list-wrapper ${
                      collapsedGroups[group.key]
                        ? "preset-group__list-wrapper--collapsed"
                        : ""
                    }`}
                  >
                    <div className="preset-group__list">
                      {group.presets.map((preset) => {
                        const isSelected =
                          preset.presetKey === selectedPresetKey;

                        return (
                          <button
                            key={preset.presetKey}
                            type="button"
                            className={`preset-card ${
                              isSelected ? "preset-card--selected" : ""
                            }`}
                            onClick={() =>
                              setSelectedPresetKey(preset.presetKey)
                            }
                          >
                            <div className="preset-card__top">
                              <h3>{preset.title}</h3>
                            </div>
                            <p>{preset.description}</p>
                            <ul className="preset-highlights">
                              {preset.highlights.map((highlight) => (
                                <li key={highlight}>{highlight}</li>
                              ))}
                            </ul>
                            <div className="preset-card__meta">
                              <span className="preset-card__key">
                                {preset.presetKey}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>

        {lastAppliedAt ? <p className="notice">{lastAppliedAt}</p> : null}

        <div className="floating-action">
          <button
            className="button"
            type="button"
            disabled={!phoneNumber || !selectedPresetKey || isLoading}
            onClick={handleApply}
          >
            {isLoading ? "처리 중..." : "변경 적용"}
          </button>
          <button
            className="button button--ghost"
            type="button"
            disabled={!phoneNumber || isLoading}
            onClick={handleReset}
          >
            변경 해제
          </button>
        </div>
      </section>
    </main>
  );
};
