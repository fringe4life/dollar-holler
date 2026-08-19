<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { flex } from "#styled-system/patterns/index.js";
  import type { Snippet } from "svelte";
  import Search from "#features/pagination/components/Search.svelte";
  import Button from "#lib/components/ui/button/button.svelte";

  interface ItemsHeaderProps {
    button: Snippet;
    open: () => void;
  }

  let { open, button }: ItemsHeaderProps = $props();
</script>

<div
  class={flex({
    direction: { base: "column-reverse", md: "row" },
    align: { base: "start", md: "center" },
    justify: "space-between",
    rowGap: { base: 6, md: 4 },
    marginBlockEnd: 6,
    paddingBlock: { base: 2, lg: 3 },
    fontSize: "lg",
  })}
>
  <Search />
  <div
    class={css({
      position: "relative",
      zIndex: 1,
    })}
  >
    <Button class="group" onclick={open} size="lg">{@render button()}</Button>
  </div>
</div>
