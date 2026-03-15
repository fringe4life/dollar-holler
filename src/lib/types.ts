import type { MouseEventHandler } from "svelte/elements";

export type Maybe<T> = T | null | undefined;
export type List<T> = Maybe<T[]>;
export type BitsButton = MouseEventHandler<HTMLButtonElement> &
  MouseEventHandler<HTMLAnchorElement>;

declare const __brand: unique symbol;
type Brand<T, U extends string> = T & { [__brand]: U };

export type SanitizedHTML = Brand<string, "SanitizedHTML">;
