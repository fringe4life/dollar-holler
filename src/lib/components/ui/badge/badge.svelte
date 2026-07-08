<script lang="ts" module>
  import { cva, cx, type RecipeVariant } from "styled-system/css";
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
          borderColor: "pastelPurple",
          color: "pastelPurple",
        },
        late: {
          backgroundColor: "scarlet",
          borderColor: "scarlet",
          color: "goldenFizz",
        },
        paid: {
          backgroundColor: "pastelPurple",
          borderColor: "pastelPurple",
          color: "white",
        },
        sent: {
          backgroundColor: "robinEggBlue",
          borderColor: "robinEggBlue",
          color: "blueGem",
        },
      },
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
