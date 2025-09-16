<script lang="ts" module>
  import { type VariantProps, tv } from 'tailwind-variants'

  export const badgeVariants = tv({
    base: 'text-md focus-visible:border-ring focus-visible:ring-ring/50 w-20 rounded-full border text-center font-bold whitespace-nowrap capitalize',
    variants: {
      variant: {
        sent: 'text-blueGem bg-robinEggBlue border-robinEggBlue',
        draft: 'text-pastelPurple border-pastelPurple',
        late: 'border-scarlet bg-scarlet text-goldenFizz focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white',
        paid: 'border-pastelPurple bg-pastelPurple text-white',
      },
      size: {
        default: 'px-3 py-1',
        small: 'px-2',
      },
    },
    defaultVariants: {
      variant: 'draft',

      size: 'small',
    },
  })

  export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
  export type BadgeSize = VariantProps<typeof badgeVariants>['size']

  export type BadgeProps = WithElementRef<HTMLAnchorAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      variant?: BadgeVariant
      size?: BadgeSize
    }
</script>

<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import { cn, type WithElementRef } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = 'draft',
    size = 'small',

    children,
    ...restProps
  }: BadgeProps = $props()
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  bind:this={ref}
  data-slot="badge"
  {href}
  class={cn(badgeVariants({ variant }), className)}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
