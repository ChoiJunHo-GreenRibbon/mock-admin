import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, hasSession, requestLogin, resendSms, verifySms } from '../services/auth';
import { LoginFormState, Provider, PROVIDERS } from '../types';
import { getEnvironmentLabel } from '../utils/env';

const INITIAL_FORM: LoginFormState = {
  phoneNumber: '',
  authenticationNumber: '',
  provider: 'kakao',
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginFormState>(INITIAL_FORM);
  const [smsRequestedCode, setSmsRequestedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (hasSession()) {
      navigate('/dashboard', { replace: true });
      return;
    }

    clearSession();
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    setIsSubmitting(true);

    try {
      if (!smsRequestedCode) {
        const response = await requestLogin(form.phoneNumber, form.provider);
        setSmsRequestedCode(response.phoneNumber);
        setFeedback(
          `SMS 인증번호를 발송했습니다. 현재 mock 인증번호는 ${response.debugCode} 입니다.`,
        );
      } else {
        await verifySms(smsRequestedCode, form.authenticationNumber, form.provider);
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    setFeedback('');

    try {
      const response = await resendSms(smsRequestedCode || form.phoneNumber);
      setFeedback(`인증번호를 다시 발송했습니다. 현재 mock 인증번호는 ${response.debugCode} 입니다.`);
    } catch {
      setFeedback('인증번호 재전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="shell shell--center">
      <section className="panel panel--narrow">
        <span className="eyebrow">{getEnvironmentLabel()}</span>
        <h1>테스트 데이터 조작 어드민</h1>
        <p className="muted">
          개발계 테스트 데이터 확인 및 조작을 위한 전용 관리자 화면입니다.
        </p>

        <form className="stack-lg" onSubmit={handleSubmit}>
          <label className="field">
            <span>Provider</span>
            <select
              value={form.provider}
              disabled={Boolean(smsRequestedCode)}
              onChange={(event) =>
                setForm((current) => ({ ...current, provider: event.target.value as Provider }))
              }
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>휴대폰번호</span>
            <input
              value={form.phoneNumber}
              disabled={Boolean(smsRequestedCode)}
              placeholder="휴대폰번호를 입력해 주세요"
              onChange={(event) =>
                setForm((current) => ({ ...current, phoneNumber: event.target.value }))
              }
            />
          </label>

          {smsRequestedCode ? (
            <>
              <label className="field">
                <span>SMS 인증번호</span>
                <input
                  value={form.authenticationNumber}
                  placeholder="인증번호를 입력해 주세요"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      authenticationNumber: event.target.value,
                    }))
                  }
                />
              </label>

              <button
                className="button button--ghost button--inline"
                type="button"
                disabled={isSubmitting}
                onClick={handleResend}
              >
                인증번호 재전송
              </button>
            </>
          ) : null}

          {feedback ? <p className="notice">{feedback}</p> : null}

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : smsRequestedCode ? '인증 완료' : '로그인'}
          </button>
        </form>
      </section>
    </main>
  );
};
