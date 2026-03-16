import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../services/auth';
import { ToggleSection } from '../types';

const INITIAL_SECTIONS: ToggleSection[] = [
  {
    key: 'user-state',
    title: '유저 상태 설정',
    description: '보험청구 테스트 흐름에서 사용자 상태를 빠르게 전환합니다.',
    fields: [
      {
        key: 'isIntegratedUser',
        label: '라이프캐치 통합 유저 여부',
        description: '통합 유저로 간주할지 여부를 설정합니다.',
        value: true,
      },
    ],
  },
  {
    key: 'data-state',
    title: '데이터 설정',
    description: '유저의 테스트 데이터 존재 여부를 예시로 제공합니다.',
    fields: [
      {
        key: 'hasQuickClaimData',
        label: '바로청구보험 데이터 유무',
        description: '바로청구 가능한 보험 데이터가 존재하는지 설정합니다.',
        value: true,
      },
    ],
  },
];

const formatPhoneNumber = (value: string) => {
  const onlyDigits = value.replace(/\D/g, '').slice(0, 11);

  if (onlyDigits.length < 4) {
    return onlyDigits;
  }

  if (onlyDigits.length < 8) {
    return `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3)}`;
  }

  return `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3, 7)}-${onlyDigits.slice(7)}`;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [lastAppliedAt, setLastAppliedAt] = useState('');

  const isDirty = useMemo(() => phoneNumber.replace(/\D/g, '').length === 11, [phoneNumber]);

  const handleToggle = (sectionKey: string, fieldKey: string) => {
    setSections((current) =>
      current.map((section) =>
        section.key !== sectionKey
          ? section
          : {
              ...section,
              fields: section.fields.map((field) =>
                field.key !== fieldKey ? field : { ...field, value: !field.value },
              ),
            },
      ),
    );
  };

  const handleReset = () => {
    setSections(INITIAL_SECTIONS);
    setLastAppliedAt('유저 상태를 기본 예시값으로 초기화했습니다.');
  };

  const handleApply = () => {
    setLastAppliedAt(
      `${phoneNumber} 번호 기준으로 예시 설정을 적용했습니다. 실제 API 연결 시 이 지점에 저장 요청을 연결하면 됩니다.`,
    );
  };

  const handleLogout = () => {
    clearSession();
    navigate('/', { replace: true });
  };

  return (
    <main className="shell">
      <section className="panel">
        <div className="toolbar">
          <div>
            <span className="eyebrow">Development only</span>
            <h1>보험청구 개발자 설정</h1>
            <p className="muted">
              개발계 테스트 데이터만 조작하는 전용 화면입니다. 로그인 흐름은 `admin-front-v2`
              와 동일하게 아이디/비밀번호 뒤 SMS 인증 단계를 거칩니다.
            </p>
          </div>

          <div className="toolbar__actions">
            <span className="chip">{session?.adminId ?? '관리자'}</span>
            <button className="button button--ghost" type="button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>

        <div className="hero-grid">
          <label className="field">
            <span>휴대폰번호</span>
            <input
              value={phoneNumber}
              placeholder="010-0000-0000"
              onChange={(event) => setPhoneNumber(formatPhoneNumber(event.target.value))}
            />
          </label>

          <div className="callout">
            <strong>사용 가이드</strong>
            <p>조작 대상의 휴대폰번호를 입력한 뒤 아래 ON/OFF를 변경하고 적용합니다.</p>
          </div>
        </div>

        <div className="action-row">
          <button className="button button--danger" type="button" onClick={handleReset}>
            유저 상태 초기화
          </button>
          <button className="button" type="button" disabled={!isDirty} onClick={handleApply}>
            변경 적용
          </button>
        </div>

        <div className="section-list">
          {sections.map((section) => (
            <section className="settings-section" key={section.key}>
              <div className="settings-section__header">
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </div>

              <div className="toggle-list">
                {section.fields.map((field) => (
                  <article className="toggle-card" key={field.key}>
                    <div>
                      <h3>{field.label}</h3>
                      <p>{field.description}</p>
                    </div>

                    <button
                      aria-pressed={field.value}
                      className={`switch ${field.value ? 'switch--on' : ''}`}
                      type="button"
                      onClick={() => handleToggle(section.key, field.key)}
                    >
                      <span className="switch__thumb" />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {lastAppliedAt ? <p className="notice">{lastAppliedAt}</p> : null}
      </section>
    </main>
  );
};
