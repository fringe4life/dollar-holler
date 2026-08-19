import { brand, nullable, pipe, string, type InferOutput } from "valibot";

/**
 * Read path: trust that DB HTML was sanitized on write (see `markdown.server.ts`,
 * `invoice-notes-terms-html.server.ts`). Brand only; no re-sanitize while that
 * contract holds. If writes stop sanitizing, add validation against
 * MARKDOWN_SANITIZE_OPTIONS before this brand runs.
 */
export const sanitizedHtmlSchema = pipe(string(), brand("SanitizedHTML"));

export const nullableSanitizedHtmlSchema = nullable(sanitizedHtmlSchema);

export type SanitizedHTML = InferOutput<typeof sanitizedHtmlSchema>;
