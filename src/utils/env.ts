const API_URL = import.meta.env.VITE_API_URL || '';

export const getEnvironmentLabel = (): string => {
  if (!API_URL || API_URL.includes('localhost')) {
    return '로컬';
  }
  if (API_URL.includes('dev')) {
    return '개발계';
  }
  return '운영계';
};
