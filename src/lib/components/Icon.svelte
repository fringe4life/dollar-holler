<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SVGAttributes } from "svelte/elements";

  export type IconProps = SVGAttributes<SVGSVGElement>;

  type Props = {
    children: Snippet;
  } & IconProps;
  let { width = 24, height = 24, children, ...rest }: Props = $props();
</script>

<svg
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  {...rest}
>
  {@render children()}
</svg>
