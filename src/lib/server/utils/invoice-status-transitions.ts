import type { InvoiceStatus } from "$lib/server/db/types";
import { BadRequestError } from "$lib/server/utils/errors";

/** Allowed when changing status; same-value updates are no-ops. */
export function assertAllowedInvoiceStatusTransition(
  current: InvoiceStatus,
  next: InvoiceStatus
): void {
  if (current === next) {
    return;
  }
  if (current === "draft" && next === "sent") {
    return;
  }
  if (current === "sent" && next === "paid") {
    return;
  }
  throw new BadRequestError(
    `Invalid invoice status transition: ${current} → ${next}`
  );
}
