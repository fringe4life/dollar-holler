import type { Component } from "svelte";
import type { IconProps } from "#lib/components/primitives/Icon.svelte";

/**
 * The contract every glyph in this folder satisfies. Maps of glyphs (theme
 * options, page sizes) type against this instead of a package's component type.
 */
export type IconComponent = Component<IconProps>;

export type { IconProps };
