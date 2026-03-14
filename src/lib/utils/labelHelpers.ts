import type { BadgeVariant } from "$lib/components/ui/badge/badge.svelte";
import type { Maybe } from "$lib/types";
import { isLate } from "./dateHelpers";

// Pure: only returns the label, no mutations
export const getLabel = (
  label: BadgeVariant,
  dueDate: Maybe<string>
): BadgeVariant => {
  if (label === "draft") return "draft";
  if (label === "sent" && isLate?.(dueDate)) return "late";
  if (label === "sent" && !isLate?.(dueDate)) return "sent";
  if (label === "paid") return "paid";
  return "draft"; // fallback
};
