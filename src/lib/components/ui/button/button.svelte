<script lang="ts" module>
  import { cn, type WithElementRef } from "$lib/utils.js";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";
  import { tv, type VariantProps } from "tailwind-variants";

  export const buttonVariants = tv({
    base: "inline-flex cursor-pointer items-center justify-center gap-x-2 rounded-lg font-sansserif whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    variants: {
      variant: {
        default:
          "relative translate-y-0 bg-lavenderIndigo text-xl font-black whitespace-nowrap text-white shadow-colored transition-transform duration-200 ease-glide after:absolute after:inset-0 after:rounded-lg after:opacity-0 after:shadow-coloredHover after:transition-opacity after:duration-200 after:ease-glide hover:-translate-1 hover:after:opacity-100",
        destructive:
          "bg-scarlet text-goldenFizz shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        ghost:
          "text-pastelPurple shadow-xs transition-colors duration-200 hover:text-blueGem",
        outline:
          "border-2 border-daisyBush text-daisyBush transition-colors duration-200 hover:bg-daisyBush hover:text-white",
        textOnlyDestructive:
          "bg-transparent px-0 text-scarlet underline hover:no-underline",
        textOnly:
          "bg-transparent text-lavenderIndigo no-underline hover:underline",
        secondary:
          "bg-gallery/80 font-bold text-blueGem/90 shadow-colored hover:bg-gallery hover:text-blueGem",
        link: "text-primary underline-offset-4 hover:underline",
        auth: "mbs-6 min-h-14 rounded-lg bg-robinEggBlue px-4 py-3 text-xl font-bold text-daisyBush transition-all duration-200 inline-full hover:-translate-y-1 hover:shadow-lg",
      },
      size: {
        default: "px-5 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5 lg:h-14",
        lg: "px-10 py-3 has-[>svg]:px-4",
        icon: "size-5",
        short: "px-4 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  });

  export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
  export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

  export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      variant?: ButtonVariant;
      size?: ButtonSize;
    };
</script>

<script lang="ts">
  let {
    class: className,
    variant = "default",
    size = "default",
    ref = $bindable(null),
    href = undefined,
    type = "button",
    disabled,
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <a
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    href={disabled ? undefined : href}
    aria-disabled={disabled}
    role={disabled ? "link" : undefined}
    tabindex={disabled ? -1 : undefined}
    data-sveltekit-preload-data="hover"
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
