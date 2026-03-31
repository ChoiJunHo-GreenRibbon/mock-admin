export type Provider = 'kakao' | 'apple' | 'banksalad' | 'kyobodaitji' | 'toss';

export const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'kakao', label: '카카오' },
  { value: 'apple', label: '애플' },
  { value: 'banksalad', label: '뱅크샐러드' },
  { value: 'kyobodaitji', label: '교보다잇지' },
  { value: 'toss', label: '토스' },
];

export interface LoginFormState {
  phoneNumber: string;
  authenticationNumber: string;
  provider: Provider;
}

export interface LostBenefitPreset {
  presetKey: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface LostBenefitPresetCatalogResponse {
  presets: LostBenefitPreset[];
}

export interface LostBenefitPresetSelectionResponse {
  phoneNumber: string;
  selectedPresetKey: string;
}
