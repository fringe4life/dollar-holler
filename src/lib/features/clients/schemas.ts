import {
  email,
  minLength,
  object,
  optional,
  picklist,
  pipe,
  string,
} from "valibot";
import { cursorSchema } from "#features/pagination/schemas.ts";
import { zipSchema } from "#lib/utils/zip.ts";

/** HTML `form()` payload for the client panel (strings only). */
export const clientFormSchema = object({
  city: string(),
  email: pipe(string(), email()),
  id: optional(cursorSchema),
  name: pipe(string(), minLength(1)),
  state: string(),
  street: string(),
  zip: zipSchema,
});

export const clientStatusSchema = object({
  clientStatus: picklist(["active", "archive"]),
});
