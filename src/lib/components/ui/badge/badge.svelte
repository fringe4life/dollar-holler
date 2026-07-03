<script lang="ts" module>
  import { cva, cx, type RecipeVariant } from "styled-system/css";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  const badgeVariants = cva({
    base: {
      inlineSize: 20,
      blockSize: 20,
      borderRadius: "full",
      borderWidth: "1px",
      fontWeight: "bold",
      fontSize: "md",
      textAlign: "center",
      textTransform: "capitalize",
    },
    variants: {
      variant: {
        sent: {
          borderColor: "robinEggBlue",
          backgroundColor: "robinEggBlue",
          color: "blueGem",
        },
        draft: {
          borderColor: "pastelPurple",
          color: "pastelPurple",
        },
        late: {
          borderColor: "scarlet",
          backgroundColor: "scarlet",
          color: "goldenFizz",
        },
        paid: {
          borderColor: "pastelPurple",
          backgroundColor: "pastelPurple",
          color: "white",
        },
      },
      size: {
        default: { paddingInline: 3, paddingBlock: 1 },
        small: { paddingInline: 2 },
      },
    },
    defaultVariants: {
      variant: "draft",
      size: "small",
    },
  });
</script>
<script lang="ts">
  export type BadgeVariant = RecipeVariant<typeof badgeVariants>["variant"];
  export type BadgeSize = RecipeVariant<typeof badgeVariants>["size"];
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
  class={cx(badgeVariants({ variant }), className)}
  data-slot="badge"
  {href}
  this={href ? "a" : "span"}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
