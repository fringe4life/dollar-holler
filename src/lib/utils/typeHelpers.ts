/**
 * Utility types and functions to handle Drizzle's exactOptionalPropertyTypes issues
 *
 * With exactOptionalPropertyTypes: true, Drizzle infers optional fields as:
 * - T | undefined (when field can be missing)
 * - T | null (when field is explicitly nullable in DB)
 *
 * This creates issues when we want consistent null handling.
 */

// Utility function to convert undefined to null for consistent null handling
export function normalizeToNull<T>(value: T | undefined | null): T | null {
  return value ?? null;
}

// Type helper to transform null to undefined in object types
// Converts properties like `string | null` to `string | undefined`
type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

// Transform null values to undefined for Drizzle insert operations
// This handles the exactOptionalPropertyTypes issue where Drizzle expects
// undefined for optional fields, not null
export function transformNullToUndefined<T extends object>(
  data: T
): NullToUndefined<T> {
  const entries = Object.entries(data).map(([key, value]) => {
    if (value === null) {
      return [key, undefined];
    } else {
      return [key, value];
    }
  });
  return Object.fromEntries(entries) as NullToUndefined<T>;
}

export function normalizeObjToNull<T extends object>(data: T): T {
  const entries = Object.entries(data).map(([key, value]) => {
    if (value === undefined) {
      return [key, null];
    } else {
      return [key, value];
    }
  });
  return Object.fromEntries(entries) as T;
}

// For upsert operations, we want optional fields to be null instead of undefined
// This is a simpler approach than complex type manipulation
export type UpsertType<T> = T;

// Example usage:
// const cleanValue = normalizeToNull(invoiceData.subject);
// const insertData = transformNullToUndefined(formData);
// This ensures consistent null handling without complex type gymnastics
