<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  const textareaClass = css({
    _ariaInvalid: {
      borderColor: "destructive",
    },
    _focusVisible: {
      borderColor: "ring",
      outlineColor: "ring",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    _userInvalid: {
      borderColor: "destructive",
    },
    blockSize: 32,
    borderColor: "input",
    borderWidth: 2,
    fontFamily: "sansserif",
    inlineSize: "full",
    p: 4,
    resize: "none",
    scrollbarGutter: "stable",
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
