const SESSION_KEY = 'banksalad-mock-admin-session';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083';

interface SessionValue {
  phoneNumber: string;
  authenticatedAt: string;
}

interface LoginResponse {
  phoneNumber: string;
  smsSent: boolean;
  debugCode: string;
}

interface VerifySmsResponse {
  accessToken: string;
  phoneNumber: string;
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || '요청 처리에 실패했습니다.');
  }

  return (await response.json()) as T;
};

export const requestLogin = async (phoneNumber: string) => {
  if (!phoneNumber.trim()) {
    throw new Error('휴대폰번호를 입력해 주세요.');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/mock/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber: phoneNumber.replace(/\D/g, ''),
    }),
  });

  return parseResponse<LoginResponse>(response);
};

export const verifySms = async (phoneNumber: string, code: string) => {
  if (!phoneNumber.trim() || !code.trim()) {
    throw new Error('인증번호를 입력해 주세요.');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/mock/auth/login/sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber: phoneNumber.replace(/\D/g, ''),
      code,
    }),
  });

  const result = await parseResponse<VerifySmsResponse>(response);

  const sessionValue: SessionValue = {
    phoneNumber: result.phoneNumber,
    authenticatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionValue));
  window.localStorage.setItem('accessToken', result.accessToken);

  return sessionValue;
};

export const resendSms = async (phoneNumber: string) => {
  if (!phoneNumber.trim()) {
    throw new Error('휴대폰번호를 먼저 입력해 주세요.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/mock/auth/login/${phoneNumber.replace(/\D/g, '')}/sms/resend`,
    {
      method: 'POST',
    },
  );

  return parseResponse<LoginResponse>(response);
};

export const hasSession = () => {
  return Boolean(window.localStorage.getItem(SESSION_KEY));
};

export const getSession = (): SessionValue | null => {
  const stored = window.localStorage.getItem(SESSION_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as SessionValue;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem('accessToken');
};
