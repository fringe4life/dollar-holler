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

<input class={cx(inputClass, className)} {...rest} bind:value />
