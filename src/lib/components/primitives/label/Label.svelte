<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import type { HTMLLabelAttributes } from "svelte/elements";

  //  font-sansserif text-textMuted block text-base font-bold
  const labelClass = css({
    color: "textMuted",
    display: "block",
    fontFamily: "sansserif",
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
