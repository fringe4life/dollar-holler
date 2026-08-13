import type { ClientInsert } from "../types";

export const newClient = (): ClientInsert => ({
  city: "",
  clientStatus: "active",
  email: "",
  name: "",
  state: "",
  street: "",
  zip: "",
});
