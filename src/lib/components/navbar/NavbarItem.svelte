<script lang="ts">
  import { css } from "styled-system/css";

  interface Props {
    href: string;
    isActive: boolean;
    title: string;
  }

  let { href, title, isActive }: Props = $props();
</script>

<li
  class={css({
    "&:not(:last-child)": { marginBlockEnd: "6" },
  })}
>
  <a
    aria-current={isActive}
    {href}
    class={css({
      position: "relative",
      display: "inline-block",
      paddingInline: 8,
      color: { base: "white", _hover: "goldenFizz", _current: "robinEggBlue" },
      transitionProperty: "colors",
      transitionDuration: "normal",
      "&::before,&::after": {
        content: "''",
        display: "block",
        position: "absolute",
        insetBlockStart: 0,
        opacity: "0",
        transitionProperty: ["opacity", "translate"],
        transitionDuration: "normal",
        transitionTimingFunction: {
          base: "ease-out",
          _supportsLinear: "dramatic",
        },
        blockSize: 30,
        inlineSize: 20,
        backgroundPositionY: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      },
      _before: {
        insetInlineStart: 0,
        backgroundImage: "var(--active-nav-left)",
        backgroundPositionX: "left",
      },
      _after: {
        insetInlineEnd: 0,
        backgroundImage: "var(--active-nav-right)",
        backgroundPositionX: "right",
      },
      _current: {
        _before: { opacity: "1" },
        _after: { opacity: "1" },
        _hover: {
          color: "robinEggBlue",
          _before: { translate: "-1px 0" },
          _after: { translate: "1px 0" },
        },
      },
    })}
  >
    {title}
  </a>
</li>
