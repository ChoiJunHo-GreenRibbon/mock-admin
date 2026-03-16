export interface LoginFormState {
  adminId: string;
  password: string;
  authenticationNumber: string;
}

export interface ToggleField {
  key: string;
  label: string;
  description: string;
  value: boolean;
}

export interface ToggleSection {
  key: string;
  title: string;
  description: string;
  fields: ToggleField[];
}
