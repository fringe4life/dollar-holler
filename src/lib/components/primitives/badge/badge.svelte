<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import { CORNER_SHAPE } from "#lib/styles.ts";
  import type { BadgeSize, BadgeVariant } from "./badge.types";

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
  const badgeBase = css({
    _print: { borderRadius: "sm", cornerShape: "round" },
    alignItems: "center",
    borderRadius: "md",
    borderWidth: "1px",
    cornerShape: CORNER_SHAPE,
    display: "inline-flex",
    fontSize: "sm",
    fontWeight: "bold",
    inlineSize: "fit-content",
    justifyContent: "center",
    lineHeight: "tight",
    minBlockSize: 5,
    paddingBlock: 0.5,
    textAlign: "center",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  });

  const badgeBySize = {
    default: css({ paddingBlock: 1, paddingInline: 3 }),
    small: css({ paddingBlock: 0.5, paddingInline: 2 }),
  } as const satisfies Record<BadgeSize, string>;

  const badgeByVariant = {
    active: css({
      backgroundColor: "success/15",
      borderColor: "success/40",
      color: "success",
    }),
    archive: css({
      backgroundColor: "surfaceMuted",
      borderColor: "borderMuted",
      color: "textMuted",
    }),
    draft: css({
      borderColor: "statusDraft",
      color: "statusDraft",
    }),
    late: css({
      backgroundColor: "statusLate",
      borderColor: "statusLate",
      color: "statusLateForeground",
    }),
    paid: css({
      backgroundColor: "statusPaid",
      borderColor: "statusPaid",
      color: "statusPaidForeground",
    }),
    sent: css({
      backgroundColor: "statusSent",
      borderColor: "statusSent",
      color: "statusSentForeground",
    }),
  } as const satisfies Record<BadgeVariant, string>;

  function badgeVariants({
    size = "small",
    variant = "draft",
  }: {
    size?: BadgeSize;
    variant?: BadgeVariant;
  } = {}) {
    return cx(badgeBase, badgeBySize[size], badgeByVariant[variant]);
  }
</script>

<script lang="ts">
  type BadgeProps = HTMLAnchorAttributes & {
    variant?: BadgeVariant;
    size?: BadgeSize;
    class?: string;
  };
  let {
    href,
    class: className,
    variant = "draft",
    size = "small",

    children,
    ...restProps
  }: BadgeProps = $props();
</script>

<svelte:element
  this={href ? "a" : "span"}
  class={cx(badgeVariants({ size, variant }), className)}
  data-slot="badge"
  {href}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
