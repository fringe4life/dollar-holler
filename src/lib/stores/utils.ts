/**
 * Combines an internal store abort signal with an optional external one.
 * Uses `AbortSignal.any` when available; otherwise falls back to the internal signal.
 */
export function mergeAbortSignals(
  internal: AbortSignal,
  external?: AbortSignal
): AbortSignal {
  if (external && typeof AbortSignal.any === "function") {
    return AbortSignal.any([internal, external]);
  }
  return internal;
}
