/** Drops entries whose values are `null` or `undefined`. */
export const stripNullishEntries = <T extends Record<string, unknown>>(
  object: T
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value != null)
  ) as Partial<T>;
};
