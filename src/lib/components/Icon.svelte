<script lang="ts">
  import type { Snippet } from "svelte";

  export type IconProps = {
    width?: number;
    height?: number;
  };

  type Props = {
    children: Snippet;
  } & IconProps;
  let { width = 24, height = 24, children }: Props = $props();
</script>

<svg
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {@render children()}
</svg>
