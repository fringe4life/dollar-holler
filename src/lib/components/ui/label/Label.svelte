<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLLabelAttributes } from "svelte/elements";

  //  font-sansserif text-monsoon block text-base font-bold
  const labelClass = css({
    display: "block",
    fontFamily: "sansserif",
    color: "monsoon",
    fontWeight: "bold",
  });

  let {
    class: className = "",
    children,
    ...rest
  }: Omit<HTMLLabelAttributes, "class"> & { class?: string } = $props();
</script>

<label class={cx(labelClass, className)} {...rest}>
  {@render children?.()}
</label>
