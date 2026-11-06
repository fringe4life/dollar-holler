<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SVGAttributes } from "svelte/elements";

  export type IconProps = SVGAttributes<SVGSVGElement> & {
    /** Shorthand for width and height when the glyph is square. */
    size?: number;
    /** Accessible name. Omit on decorative glyphs, where the owner names the action. */
    title?: string;
    /** Glyphs are 24-square by default; chrome drawings can bring their own box. */
    viewBox?: string;
  };

  interface Props extends IconProps {
    children: Snippet;
  }

  let {
    width,
    height,
    size = 24,
    title,
    viewBox = "0 0 24 24",
    children,
    "aria-hidden": ariaHidden,
    ...rest
  }: Props = $props();

  const inlineSize = $derived(width ?? size);
  const blockSize = $derived(height ?? size);
</script>

<!--
  Fill comes from the global `svg { fill: currentColor }` rule, not from this
  element: the house set is filled, unlike the stroke pack it replaced.
-->
<svg
  aria-hidden={title ? undefined : (ariaHidden ?? "true")}
  height={blockSize}
  role={title ? "img" : undefined}
  {viewBox}
  width={inlineSize}
  xmlns="http://www.w3.org/2000/svg"
  {...rest}
>
  {#if title}
    <title>{title}</title>
  {/if}
  {@render children()}
</svg>
