<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  export type ButtonVariant =
    | "auth"
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary"
    | "textOnly"
    | "textOnlyDestructive";
  export type ButtonSize = "default" | "icon" | "lg" | "short" | "sm";

  /**
   * Workaround: top-level `css()` maps instead of `cva` so hashed class names do
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
  const buttonBase = css({
    // Press deflates the hover inflate: 8 → 12 on hover, back to 8 on press.
    _active: { borderRadius: "lg" },
    _disabled: { _hover: { borderRadius: "lg" } },
    _focusVisible: {
      outlineColor: "ring",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    _hover: { borderRadius: "xl" },
    _motionReduce: { transitionDuration: "0.01ms" },
    _print: { borderRadius: "sm", cornerShape: "round" },
    alignItems: "center",
    cornerShape: CORNER_SHAPE,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: "sansserif",
    gap: 2,
    justifyContent: "center",
    rounded: "lg",
    whiteSpace: "nowrap",
  });

  const buttonBySize = {
    default: css({
      paddingBlock: 2,
      paddingInline: 5,
    }),
    icon: css({
      inlineSize: 5,
    }),
    lg: css({
      paddingBlock: 3,
      paddingInline: 10,
    }),
    short: css({
      paddingBlock: 1,
      paddingInline: 4,
    }),
    sm: css({
      blockSize: 9,
      gap: 1.5,
      paddingInline: 3,
      rounded: "md",
    }),
  } as const satisfies Record<ButtonSize, string>;

  const buttonByVariant = {
    auth: css({
      _after: {
        content: "''",
        inset: 0,
        opacity: "0",
        position: "absolute",
        rounded: "inherit",
        shadow: "lg",
        transitionDuration: "normal",
        transitionProperty: "opacity",
      },
      _hover: {
        _after: {
          opacity: "1",
        },
        translate: "0 -4px",
      },
      _supportsLinear: {
        transitionTimingFunction: "glide",
      },
      backgroundColor: "authButton",
      color: "authButtonForeground",
      fontSize: "xl",
      fontWeight: "bold",
      inlineSize: "full",
      minBlockSize: 14,
      paddingBlock: 3,
      paddingInline: 4,
      position: "relative",
      rounded: "lg",
      transitionDuration: "normal",
      transitionProperty: "border-radius, corner-shape, translate",
    }),
    default: css({
      _after: {
        content: "''",
        inset: 0,
        opacity: "0",
        position: "absolute",
        rounded: "inherit",
        shadow: "lg",
        transitionDuration: "normal",
        transitionProperty: "opacity",
      },
      _hover: {
        _after: {
          opacity: "1",
        },
        translate: "-2px -2px",
      },
      backgroundColor: "primary",
      color: "primaryForeground",
      fontWeight: "black",
      position: "relative",
      transitionDuration: "normal",
      transitionProperty: "border-radius, corner-shape, translate",
      transitionTimingFunction: "anticipate",
    }),
    destructive: css({
      backgroundColor: { _hover: "destructive/90", base: "destructive" },
      color: "destructiveForeground",
      shadow: "xs",
      transitionDuration: "normal",
      transitionProperty: "border-radius, colors, corner-shape",
    }),
    ghost: css({
      color: { _hover: "foreground", base: "mutedAction" },
      shadow: "xs",
      transitionDuration: "normal",
      transitionProperty: "border-radius, colors, corner-shape",
    }),
    link: css({
      _hover: {
        textDecoration: "none",
      },
      color: "link",
      textDecoration: "underline",
      textUnderlineOffset: 4,
    }),
    outline: css({
      _disabled: {
        _hover: {
          backgroundColor: "transparent",
          borderColor: "destructive",
          color: "destructive",
        },
        backgroundColor: "transparent",
        borderColor: "destructive",
        color: "destructive",
        cursor: "not-allowed",
      },
      backgroundColor: { _hover: "inverse/90", base: "transparent" },
      borderColor: "outline",
      borderStyle: "solid",
      borderWidth: 2,
      color: { _hover: "foregroundInverse", base: "outline" },
      transitionDuration: "normal",
      transitionProperty: "border-radius, colors, corner-shape",
    }),
    secondary: css({
      _hover: {
        backgroundColor: "secondary",
        color: "secondaryForeground",
      },
      backgroundColor: "secondary/80",
      color: "secondaryForeground/90",
      fontWeight: "bold",
      shadow: "colored",
      transitionDuration: "normal",
      transitionProperty: "border-radius, colors, corner-shape",
    }),
    textOnly: css({
      _hover: {
        textDecoration: "underline",
      },
      backgroundColor: "transparent",
      color: "link",
      textDecoration: "none",
    }),
    textOnlyDestructive: css({
      _hover: {
        textDecoration: "none",
      },
      backgroundColor: "transparent",
      color: "destructive",
      paddingInline: 0,
      textDecoration: "underline",
    }),
  } as const satisfies Record<ButtonVariant, string>;

  export function buttonVariants({
    size = "default",
    variant = "default",
  }: {
    size?: ButtonSize;
    variant?: ButtonVariant;
  } = {}) {
    return cx(buttonBase, buttonBySize[size], buttonByVariant[variant]);
  }

  export type ButtonProps = HTMLButtonAttributes &
    HTMLAnchorAttributes & {
      variant?: ButtonVariant;
      size?: ButtonSize;
      class?: string;
    };
</script>

<script lang="ts">
  let {
    class: className,
    variant = "default",
    size = "default",
    disabled,
    children,
    href,
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <!-- Callers pass resolve()'d hrefs; this primitive cannot call resolve itself. -->
  <!-- eslint-disable svelte/no-navigation-without-resolve -->
  <a
    class={cx(buttonVariants({ variant, size }), className)}
    {href}
    {...restProps}
  >
    {@render children?.()}
  </a>
  <!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
  <button
    class={cx(buttonVariants({ variant, size }), className)}
    data-slot="button"
    {disabled}
    type="button"
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
