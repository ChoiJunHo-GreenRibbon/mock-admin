export interface LoginFormState {
  phoneNumber: string;
  authenticationNumber: string;
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
