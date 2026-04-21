<script lang="ts">
  import Search, {
    type Props as SearchProps,
  } from "$lib/components/Search.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import type { Snippet } from "svelte";

  /** Same signature as `new Toggle().toggle`. */
  export type ItemsHeaderToggle = InstanceType<typeof Toggle>["toggle"];

  export type ItemsHeaderProps = {
    store: SearchProps["store"];
    toggle: ItemsHeaderToggle;
    button: Snippet;
  };

  let { store, toggle, button }: ItemsHeaderProps = $props();
</script>

<div
  class="mbe-7 flex flex-col-reverse items-start justify-between gap-y-6 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mbe-16 lg:py-3 lg:text-lg"
>
  <Search {store} />
  <div class="z-1">
    <Button onclick={toggle} size="lg">
      {@render button()}
    </Button>
  </div>
</div>
