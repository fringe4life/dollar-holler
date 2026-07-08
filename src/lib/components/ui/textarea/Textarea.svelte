<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  const textareaClass = css({
    _focusVisible: {
      borderColor: "lavenderIndigo",
      outlineColor: "lavenderIndigo",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    blockSize: 32,
    borderColor: "silver",
    borderWidth: 2,
    fontFamily: "sansserif",
    inlineSize: "full",
    p: 4,
    resize: "none",
    transitionDuration: "normal",
    transitionProperty: "colors",
  });

  let {
    class: className = "",
    value = $bindable(),
    ...rest
  }: Omit<HTMLTextareaAttributes, "class"> & { class?: string } = $props();
</script>

<textarea class={cx(textareaClass, className)} {...rest} bind:value></textarea>
