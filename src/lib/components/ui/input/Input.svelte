<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { HTMLInputAttributes } from "svelte/elements";

  const inputClass = css({
    backgroundColor: "whisper",
    blockSize: { base: "10", lg: "14" },
    borderColor: "silver",
    borderRadius: "lg",
    borderWidth: 2,
    fontFamily: "sansserif",
    inlineSize: "full",
    minInlineSize: 0,
    paddingInline: 4,
  });

  const dateInputClass = css({
    "&[type='date']": {
      backgroundColor: "transparent",
      blockSize: "full",
      borderWidth: 0,
      minInlineSize: 0,
      paddingInline: 0,
    },
  });

  const dateInputShell = css({
    alignItems: "center",
    backgroundColor: "whisper",
    blockSize: { base: "10", lg: "14" },
    borderColor: "silver",
    borderRadius: "lg",
    borderWidth: 2,
    display: "flex",
    inlineSize: "full",
    minInlineSize: 0,
    paddingInline: 4,
  });

  let {
    class: className = "",
    type,
    value = $bindable(),
    ...rest
  }: Omit<HTMLInputAttributes, "class"> & { class?: string } = $props();
</script>

<!--
  Prefer spreading caller attrs after class. When used with remote form
  `.as()`, `value`/`name`/`type` come from props (including $bindable value).
  Avoid binding when parent only spreads read-only field attrs: value still
  flows through $bindable from the `value` prop.

  Date inputs use a wrapper so iOS Safari does not calculate width:100% from
  the native control's padded box. The input keeps its native calendar UI.
-->
{#if type === "date"}
  <div class={cx(dateInputShell, className)}>
    <input class={cx(inputClass, dateInputClass)} {...rest} {type} bind:value />
  </div>
{:else}
  <input class={cx(inputClass, className)} {...rest} {type} bind:value />
{/if}
