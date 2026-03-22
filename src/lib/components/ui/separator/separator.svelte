<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { Separator as SeparatorPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: SeparatorPrimitive.RootProps = $props();
</script>

<SeparatorPrimitive.Root
  bind:ref
  data-slot="separator-root"
  class={cn(
    "shrink-0 bg-border data-[orientation=horizontal]:block-px data-[orientation=horizontal]:inline-full data-[orientation=vertical]:block-full data-[orientation=vertical]:inline-px",
    className
  )}
  {...restProps}
/>
