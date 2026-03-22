<script lang="ts" module>
  import { tv, type VariantProps } from "tailwind-variants";

  export const badgeVariants = tv({
    base: "text-md rounded-full border text-center font-bold whitespace-nowrap capitalize inline-20 focus-visible:border-ring focus-visible:ring-ring/50",
    variants: {
      variant: {
        sent: "border-robinEggBlue bg-robinEggBlue text-blueGem",
        draft: "border-pastelPurple text-pastelPurple",
        late: "border-scarlet border-transparent bg-scarlet text-goldenFizz text-white focus-visible:ring-destructive/20 dark:bg-destructive/70 dark:focus-visible:ring-destructive/40",
        paid: "border-pastelPurple bg-pastelPurple text-white",
      },
      size: {
        default: "px-3 py-1",
        small: "px-2",
      },
    },
    defaultVariants: {
      variant: "draft",

      size: "small",
    },
  });

  export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  export type BadgeSize = VariantProps<typeof badgeVariants>["size"];

  export type BadgeProps = WithElementRef<HTMLAnchorAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      variant?: BadgeVariant;
      size?: BadgeSize;
    };
</script>

<script lang="ts">
  import { cn, type WithElementRef } from "$lib/utils.js";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
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
  bind:this={ref}
  data-slot="badge"
  {href}
  class={cn(badgeVariants({ variant }), className)}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
