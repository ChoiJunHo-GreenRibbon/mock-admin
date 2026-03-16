const SESSION_KEY = 'banksalad-mock-admin-session';

interface SessionValue {
  adminId: string;
  authenticatedAt: string;
}

const buildMockToken = (adminId: string) => `mock-token:${adminId}:${Date.now()}`;

export const requestLogin = async (adminId: string, password: string) => {
  await new Promise((resolve) => window.setTimeout(resolve, 400));

  if (!adminId.trim() || !password.trim()) {
    throw new Error('아이디와 비밀번호를 입력해 주세요.');
  }

  return {
    code: adminId.trim(),
    requiresSms: true,
  };
};

export const verifySms = async (adminId: string, code: string) => {
  await new Promise((resolve) => window.setTimeout(resolve, 400));

  if (!adminId.trim() || !code.trim()) {
    throw new Error('인증번호를 입력해 주세요.');
  }

  const sessionValue: SessionValue = {
    adminId: adminId.trim(),
    authenticatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionValue));
  window.localStorage.setItem('accessToken', buildMockToken(adminId));

  return sessionValue;
};

export const resendSms = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 250));
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
