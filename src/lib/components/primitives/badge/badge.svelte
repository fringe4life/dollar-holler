<script lang="ts" module>
  import { cva, cx } from "#styled-system/css/index.js";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  const badgeVariants = cva({
    base: {
      blockSize: 20,
      borderRadius: "full",
      borderWidth: "1px",
      fontSize: "md",
      fontWeight: "bold",
      inlineSize: 20,
      textAlign: "center",
      textTransform: "capitalize",
    },
    defaultVariants: {
      size: "small",
      variant: "draft",
    },
    variants: {
      size: {
        default: { paddingBlock: 1, paddingInline: 3 },
        small: { paddingInline: 2 },
      },
      variant: {
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

  type BadgeProps = HTMLAnchorAttributes &
    HTMLAnchorAttributes & {
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
