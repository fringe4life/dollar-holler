<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import type { HTMLButtonAttributes } from "svelte/elements";

  export type NavbarMenuButtonState = "close" | "open";
  export type NavbarMenuButtonProps = Omit<
    HTMLButtonAttributes,
    "class" | "style" | "type"
  > & {
    "aria-label": string;
    class?: string;
    state: NavbarMenuButtonState;
  };

  /**
   * Workaround: top-level `css()` maps instead of `sva` so hashed class names do
   * not force the full recipe runtime into the client bundle.
   *
   * @remarks
   * Still required on `@pandacss/vite@2.5.0` / `@pandacss/dev@2.5.0` with
   * `hash: true`. Drop when Panda folds hashed local `cva`/`sva` to string
   * lookups; re-verify no client chunk with `compoundVariants` / `__cva__`
   * after clean build.
   *
   * @see https://github.com/chakra-ui/panda/issues/3853 — related transform diagnostics
   * @see https://github.com/fringe4life/van-life/issues/471 — established pattern
   * @see https://github.com/fringe4life/dollar-holler/issues/109 — tracking
   */
  const navbarButtonBase = css({
    blockSize: 12,
    cursor: "pointer",
    display: { md: "none" },
    insetBlockStart: 6,
    insetInlineEnd: 6,
    padding: 2,
    transitionDuration: "normal",
    transitionProperty: "colors",
    zIndex: 10_000,
  });

  const navbarIconBase = css({
    "&::after,&::before,&": {
      backgroundColor: "currentColor",
      blockSize: "5px",
      borderRadius: "3px",
      content: "''",
      display: "block",
      inlineSize: "32px",
      transitionDuration: "normal",
      transitionProperty: ["rotate", "translate", "opacity"],
    },
  });

  const navbarButtonByState = {
    close: css({
      color: "navigationForeground",
      position: "absolute",
    }),
    open: css({
      color: "foreground",
      position: "fixed",
    }),
  } as const satisfies Record<NavbarMenuButtonState, string>;

  const navbarIconByState = {
    close: css({
      rotate: "45deg",
      _after: { rotate: "-90deg", translate: "0 -3px" },
      _before: { opacity: 0, translate: "0 -10px" },
      _starting: {
        _after: { rotate: "0deg", translate: "0 5px" },
        _before: { opacity: 1 },
        rotate: "0deg",
      },
    }),
    open: css({
      _after: { translate: "0 5px" },
      _before: { translate: "0 -10px" },
    }),
  } as const satisfies Record<NavbarMenuButtonState, string>;

  function navbarMenuButton({ state }: { state: NavbarMenuButtonState }) {
    return {
      button: cx(navbarButtonBase, navbarButtonByState[state]),
      icon: cx(navbarIconBase, navbarIconByState[state]),
    };
  }
</script>

<script lang="ts">
  let {
    class: className,
    state,
    ...restProps
  }: NavbarMenuButtonProps = $props();
  const controls = $derived(navbarMenuButton({ state }));
</script>

<button class={cx(controls.button, className)} type="button" {...restProps}>
  <span class={controls.icon}></span>
</button>
