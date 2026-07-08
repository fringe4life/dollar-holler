<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLSelectAttributes } from "svelte/elements";

  const selectClass = css({
    _disabled: {
      _hover: {
        backgroundColor: "inherit",
        borderColor: "inherit",
        color: "inherit",
      },
      backgroundColor: "transparent",
      borderColor: "red.500",
      color: "red.500",
      cursor: "not-allowed",
    },

    _focusVisible: {
      borderColor: "lavenderIndigo",
      outlineColor: "lavenderIndigo",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    appearance: "none",
    backgroundImage: "url('/images/chevron-down.svg')",
    backgroundPosition: "97% center",
    backgroundRepeat: "no-repeat",
    blockSize: 10,
    borderColor: "silver",
    borderRadius: "lg",
    borderWidth: 2,
    inlineSize: "full",
    paddingInline: 4,
    transitionDuration: "normal",
    transitionProperty: "colors",
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
