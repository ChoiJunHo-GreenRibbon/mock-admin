import {
  LostBenefitPresetCatalogResponse,
  LostBenefitPresetSelectionResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083';

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || '요청 처리에 실패했습니다.');
  }

  return (await response.json()) as T;
};

export const getLostBenefitPresets = async (): Promise<LostBenefitPresetCatalogResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/mock/user-settings/lost-benefit/presets`);
  return parseResponse<LostBenefitPresetCatalogResponse>(response);
};

export const getLostBenefitSelection = async (
  phoneNumber: string,
): Promise<LostBenefitPresetSelectionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/mock/user-settings/lost-benefit/${phoneNumber.replace(/\D/g, '')}`,
  );
  return parseResponse<LostBenefitPresetSelectionResponse>(response);
};

export const applyLostBenefitPreset = async (
  phoneNumber: string,
  presetKey: string,
): Promise<LostBenefitPresetSelectionResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/mock/user-settings/lost-benefit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber: phoneNumber.replace(/\D/g, ''),
      presetKey,
    }),
  });

  return parseResponse<LostBenefitPresetSelectionResponse>(response);
};

export const revertLostBenefit = async (phoneNumber: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/mock/banksalad/lost-benefit/revert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber: phoneNumber.replace(/\D/g, ''),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || '변경 해제에 실패했습니다.');
  }
};
