/**
 * Utility types and functions to handle Drizzle's exactOptionalPropertyTypes issues
 *
 * With exactOptionalPropertyTypes: true, Drizzle infers optional fields as:
 * - Maybe<T> (when field can be missing)
 * - T | null (when field is explicitly nullable in DB)
 *
 * This creates issues when we want consistent null handling.
 */

import type { Maybe } from "$lib/types";

// Utility function to convert undefined to null for consistent null handling
export const normalizeToNull = <T>(value: Maybe<T>): T | null => {
  return value ?? null;
};

// Type helper to transform null to undefined in object types
// Converts properties like `string | null` to `string | undefined`
type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

// Transform null values to undefined for Drizzle insert operations
// This handles the exactOptionalPropertyTypes issue where Drizzle expects
// undefined for optional fields, not null
export const transformNullToUndefined = <T extends object>(
  data: T
): NullToUndefined<T> => {
  const entries = Object.entries(data).map(([key, value]) => {
    const normalizedValue = normalizeToNull(value);
    return [key, normalizedValue];
  });
  return Object.fromEntries(entries) as NullToUndefined<T>;
};
