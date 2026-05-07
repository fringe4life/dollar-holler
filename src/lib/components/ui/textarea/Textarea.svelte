<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  const textareaClass = css({
    borderColor: "silver",
    fontFamily: "sansserif",
    resize: "none",
    borderWidth: 2,
    p: 4,
    transitionProperty: "colors",
    transitionDuration: "normal",
    blockSize: 32,
    inlineSize: "full",
    _focusVisible: {
      borderColor: "lavenderIndigo",
      outlineColor: "lavenderIndigo",
      outlineWidth: "2px",
      outlineStyle: "solid",
    },
  });

  let {
    class: className = "",
    value = $bindable(),
    ...rest
  }: Omit<HTMLTextareaAttributes, "class"> & { class?: string } = $props();
</script>

<textarea class={cx(textareaClass, className)} {...rest} bind:value></textarea>
