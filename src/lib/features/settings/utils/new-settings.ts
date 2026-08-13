import type { SettingsSelect } from "../types";

export const newSettings = (): SettingsSelect => ({
  city: "",
  email: "",
  myName: "",
  state: "",
  street: "",
  zip: "",
});
