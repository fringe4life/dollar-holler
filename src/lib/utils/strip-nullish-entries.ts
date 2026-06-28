/** Drops entries whose values are `null` or `undefined`. */
export const stripNullishEntries = <T extends Record<string, unknown>>(
  object: T
): Partial<T> =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value != null)
  ) as Partial<T>;

/** Drops entries whose values are `undefined`. */
export const pickDefined = <T extends object>(object: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
