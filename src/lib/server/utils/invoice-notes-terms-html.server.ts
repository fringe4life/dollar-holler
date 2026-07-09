/**
 * Server-only: derive sanitized HTML for invoice notes/terms from markdown.
 * Call only after auth and (for PATCH) ownership checks succeed.
 */

import type { InvoiceInsert } from "$features/invoices/types";
import { markdownToHtml } from "$lib/utils/markdown.server";

type InvoiceNotesTermsMarkdown = Pick<InvoiceInsert, "notes" | "terms">;

type InvoiceNotesSanitizedHTML = {
  [K in keyof InvoiceNotesTermsMarkdown as `${K}Html`]: ReturnType<
    typeof markdownToHtml
  >;
};

export const appendInvoiceNotesTermsHtmlForInsert = (
  body: InvoiceNotesTermsMarkdown
): InvoiceNotesSanitizedHTML => ({
  notesHtml: markdownToHtml(body.notes ?? null),
  termsHtml: markdownToHtml(body.terms ?? null),
});

export const appendInvoiceNotesTermsHtmlForPatch = <
  T extends InvoiceNotesTermsMarkdown,
>(
  body: T
): Partial<InvoiceNotesSanitizedHTML> => {
  const out: Partial<InvoiceNotesSanitizedHTML> = {};
  if (Object.hasOwn(body, "notes")) {
    out.notesHtml = markdownToHtml(body?.notes);
  }
  if (Object.hasOwn(body, "terms")) {
    out.termsHtml = markdownToHtml(body?.terms);
  }
  return out;
};
