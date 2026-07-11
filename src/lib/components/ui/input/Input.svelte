<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLInputAttributes } from "svelte/elements";

  const inputClass = css({
    backgroundColor: "whisper",
    blockSize: { base: "10", lg: "14" },
    borderColor: "silver",
    borderRadius: "lg",
    borderWidth: 2,
    fontFamily: "sansserif",
    inlineSize: "full",
    paddingInline: 4,
  });

  let {
    class: className = "",
    value = $bindable(),
    ...rest
  }: Omit<HTMLInputAttributes, "class"> & { class?: string } = $props();
</script>

<!--
  Prefer spreading caller attrs after class. When used with remote form
  `.as()`, `value`/`name`/`type` come from props (including $bindable value).
  Avoid binding when parent only spreads read-only field attrs: value still
  flows through $bindable from the `value` prop.
-->
<input class={cx(inputClass, className)} {...rest} bind:value />
