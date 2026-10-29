<script lang="ts" module>
  import { cva, cx } from "#styled-system/css/index.js";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  const badgeVariants = cva({
    base: {
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
    },
    defaultVariants: {
      size: "small",
      variant: "draft",
    },
    variants: {
      size: {
        default: { paddingBlock: 1, paddingInline: 3 },
        small: { paddingBlock: 0.5, paddingInline: 2 },
      },
      variant: {
        active: {
          backgroundColor: "success/15",
          borderColor: "success/40",
          color: "success",
        },
        archive: {
          backgroundColor: "surfaceMuted",
          borderColor: "borderMuted",
          color: "textMuted",
        },
        draft: {
          borderColor: "statusDraft",
          color: "statusDraft",
        },
        late: {
          backgroundColor: "statusLate",
          borderColor: "statusLate",
          color: "statusLateForeground",
        },
        paid: {
          backgroundColor: "statusPaid",
          borderColor: "statusPaid",
          color: "statusPaidForeground",
        },
        sent: {
          backgroundColor: "statusSent",
          borderColor: "statusSent",
          color: "statusSentForeground",
        },
      },
    },
  });
</script>

<script lang="ts">
  import type { BadgeSize, BadgeVariant } from "./badge.types";

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
