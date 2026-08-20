import type { BadgeVariant } from "#lib/components/primitives/badge/badge.svelte";
import type { Maybe } from "#lib/types.ts";
import { isLate } from "#lib/utils/dateHelpers.ts";

// Pure: only returns the label, no mutations
export const getLabel = (
  label: Maybe<BadgeVariant>,
  dueDate: Maybe<string>
): Exclude<BadgeVariant, undefined> => {
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
