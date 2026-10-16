import type { BadgeVariant } from "#lib/components/primitives/badge/badge.types.ts";
import type { Maybe } from "#lib/types.ts";
import { isLate } from "#lib/utils/dateHelpers.ts";

type InvoiceLabel = Extract<BadgeVariant, "draft" | "late" | "paid" | "sent">;

// Pure: only returns the label, no mutations
export const getLabel = (
  label: Maybe<InvoiceLabel>,
  dueDate: Maybe<string>
): InvoiceLabel => {
  if (label === "sent" && isLate?.(dueDate)) {
    return "late";
  }
  if (label === "sent" && !isLate?.(dueDate)) {
    return "sent";
  }
  if (label === "paid") {
    return "paid";
  }
  return "draft"; // fallback
};
