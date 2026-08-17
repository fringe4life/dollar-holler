/**
 * RFC 9562 UUIDv7 in canonical 8-4-4-4-12 hex form (syntax only).
 * Does not enforce timestamp/rand semantics from §5.7.
 */
const UUIDV7_STRING_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/** Kit 3 matcher: return param on match, `undefined` to reject. */
export const uuid = (param: string) => {
  if (!UUIDV7_STRING_RE.test(param)) {
    return;
  }
  return param;
};
