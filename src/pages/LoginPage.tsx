import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, hasSession, requestLogin, resendSms, verifySms } from '../services/auth';
import { LoginFormState } from '../types';

const INITIAL_FORM: LoginFormState = {
  adminId: '',
  password: '',
  authenticationNumber: '',
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
        const response = await requestLogin(form.adminId, form.password);
        setSmsRequestedCode(response.code);
        setFeedback('SMS 인증번호를 발송했습니다. 관리자 휴대폰에서 인증을 완료해 주세요.');
      } else {
        await verifySms(smsRequestedCode, form.authenticationNumber);
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
      await resendSms();
      setFeedback('인증번호를 다시 발송했습니다.');
    } catch {
      setFeedback('인증번호 재전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="shell shell--center">
      <section className="panel panel--narrow">
        <span className="eyebrow">Development only</span>
        <h1>테스트 데이터 조작 어드민</h1>
        <p className="muted">
          개발계 테스트 데이터 확인 및 조작을 위한 전용 관리자 화면입니다.
        </p>

        <form className="stack-lg" onSubmit={handleSubmit}>
          <label className="field">
            <span>아이디</span>
            <input
              value={form.adminId}
              disabled={Boolean(smsRequestedCode)}
              placeholder="아이디를 입력해 주세요"
              onChange={(event) =>
                setForm((current) => ({ ...current, adminId: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>비밀번호</span>
            <input
              type="password"
              value={form.password}
              disabled={Boolean(smsRequestedCode)}
              placeholder="비밀번호를 입력해 주세요"
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
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
