<script lang="ts">
  import { css } from "styled-system/css";
  import { flex } from "styled-system/patterns";
  import type { Snippet } from "svelte";
  import Search, {
    type SearchProps,
  } from "$features/pagination/components/Search.svelte";
  import type { Toggle } from "$lib/client/runes/Toggle.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  /** Same signature as `new Toggle().toggle`. */
  export type ItemsHeaderToggle = InstanceType<typeof Toggle>["toggle"];

  interface ItemsHeaderProps {
    button: Snippet;
    open: () => void;
    store: SearchProps["store"];
  }

  let { store, open, button }: ItemsHeaderProps = $props();
</script>

<div
  class={flex({ 
      direction: { base: "column-reverse", md: "row" }, 
      align: { base: "start", md: "center" }, 
      justify: "space-between", 
      rowGap: { base: 6, md: 4 } ,
      marginBlockEnd: 6,
      paddingBlock: { base: 2, lg: 3 },
      fontSize: "lg",
    })}
>
  <Search {store} />
  <div
    class={css({
      position: "relative",
      zIndex: 1,
    })}
  >
    <Button onclick={open} size="lg">{@render button()}</Button>
  </div>
</div>
