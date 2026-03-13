import type { MouseEventHandler } from "svelte/elements";

export type Maybe<T> = T | null | undefined;
export type List<T> = Maybe<T[]>;
export type BitsButton = MouseEventHandler<HTMLButtonElement> &
  MouseEventHandler<HTMLAnchorElement>;
