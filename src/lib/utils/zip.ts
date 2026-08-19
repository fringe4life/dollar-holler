import { optional, pipe, regex, string } from "valibot";

/** US ZIP: `12345` or ZIP+4 `12345-6789`. Text, not number — leading zeros matter. */
const US_ZIP = /^\d{5}(?:-\d{4})?$/;
const US_ZIP_OR_EMPTY = /^(?:\d{5}(?:-\d{4})?)?$/;

export const ZIP_INVALID_MESSAGE = "Enter a 5-digit ZIP or ZIP+4";

export const zipSchema = pipe(string(), regex(US_ZIP, ZIP_INVALID_MESSAGE));

/** Empty string or omitted; otherwise same as `zipSchema`. */
export const optionalZipSchema = optional(
  pipe(string(), regex(US_ZIP_OR_EMPTY, ZIP_INVALID_MESSAGE))
);

export const zipInputAttrs = {
  autocomplete: "postal-code",
  maxlength: 10,
  pattern: String.raw`\d{5}(-\d{4})?`,
} as const;
