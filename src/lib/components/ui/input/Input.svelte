<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLInputAttributes } from "svelte/elements";

  const inputClass = css({
    borderColor: "silver",
    backgroundColor: "whisper",
    fontFamily: "sansserif",
    borderRadius: "lg",
    borderWidth: 2,
    paddingInline: 4,
    blockSize: { base: "10", lg: "14" },
    inlineSize: "full",
  });

  let {
    class: className = "",
    value = $bindable(),
    ...rest
  }: Omit<HTMLInputAttributes, "class"> & { class?: string } = $props();
</script>

<input class={cx(inputClass, className)} {...rest} bind:value>
