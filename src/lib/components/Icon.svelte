<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SVGAttributes } from "svelte/elements";

  export type IconProps = SVGAttributes<SVGSVGElement>;

  interface Props extends IconProps {
    children: Snippet;
  }
  let { width = 24, height = 24, children, ...rest }: Props = $props();
</script>

<svg
  aria-hidden="true"
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  {...rest}
>
  {@render children()}
</svg>
