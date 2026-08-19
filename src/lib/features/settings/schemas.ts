import { email, minLength, object, pipe, string } from "valibot";
import { zipSchema } from "#lib/utils/zip.ts";

/** HTML `form()` payload for settings Invoice Details. */
export const settingsFormSchema = object({
  city: string(),
  email: pipe(string(), email()),
  myName: pipe(string(), minLength(1)),
  state: string(),
  street: string(),
  zip: zipSchema,
});
