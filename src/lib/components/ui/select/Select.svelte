<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLSelectAttributes } from "svelte/elements";

  const selectClass = css({
    borderColor: "silver",
    appearance: "none",
    borderRadius: "lg",
    borderWidth: 2,
    backgroundImage: "url('/images/chevron-down.svg')",
    backgroundPosition: "97% center",
    backgroundRepeat: "no-repeat",
    paddingInline: 4,
    transitionProperty: "colors",
    transitionDuration: "normal",
    blockSize: 10,
    inlineSize: "full",

    _focusVisible: {
      borderColor: "lavenderIndigo",
      outlineColor: "lavenderIndigo",
      outlineWidth: "2px",
      outlineStyle: "solid",
    },
    _disabled: {
      borderColor: "red.500",
      color: "red.500",
      backgroundColor: "transparent",
      cursor: "not-allowed",
      _hover: {
        borderColor: "inherit",
        color: "inherit",
        backgroundColor: "inherit",
      },
    },
  });

  let {
    class: className = "",
    children,
    value = $bindable(),
    ...rest
  }: Omit<HTMLSelectAttributes, "class"> & { class?: string } = $props();
</script>

<select class={cx(selectClass, className)} {...rest} bind:value>
  {@render children?.()}
</select>
