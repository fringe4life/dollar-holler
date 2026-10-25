/**
 * RQB `where` hardening (drizzle-orm ≥ rc.5):
 * - `undefined` filter values throw — omit the key (or early-return the clause).
 * - Empty `AND` / `OR` arrays throw — never emit them.
 * - Use `EmptyFilter` from `drizzle-orm` only when a single where object must keep an
 *   optional key present; prefer omit-key / early-return otherwise.
 */

type RqbWhere = Record<string, unknown>;

/**
 * Compose conjunctive RQB filters. Skips `undefined` parts; never builds `AND: []`.
 * Zero parts → `{}` (no filter). One part → that object. Two+ → `{ AND: [...] }`.
 */
export function andFilters(...parts: Array<RqbWhere | undefined>): RqbWhere {
  const defined = parts.filter((part): part is RqbWhere => part !== undefined);
  if (defined.length === 0) {
    return {};
  }
  const [first, ...rest] = defined;
  if (rest.length === 0) {
    return first;
  }
  return { AND: defined };
}

export function withUserAndSearch<T extends RqbWhere>(
  userId: string,
  sw: T | undefined
): { userId: { eq: string } } | { AND: [{ userId: { eq: string } }, T] } {
  const base = { userId: { eq: userId } };
  // Omit search (no EmptyFilter): empty/missing `q` must not become `AND`/`OR: []`.
  if (sw === undefined) {
    return base;
  }
  return { AND: [base, sw] };
}
