<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { CORNER_SHAPE } from "#lib/styles.ts";

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
    borderRadius: "lg",
    borderWidth: 2,
    cornerShape: CORNER_SHAPE,
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
