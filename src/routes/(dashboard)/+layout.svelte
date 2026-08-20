<script lang="ts">
  import { grid, gridItem } from "#styled-system/patterns/index.js";
  import Navbar from "#lib/components/patterns/navbar/Navbar.svelte";

  let { children } = $props();
</script>

<div
  class={grid({
    backgroundColor: "whisper",
    columns: 12,
    overflowX: "clip",
    minBlockSize: "100dvh",
    columnGap: { base: 0, md: 16 },
    position: "relative",
  })}
>
  <Navbar />
  <main
    class={gridItem({
      display: "flex",
      flexDirection: "column",
      paddingInline: 4,
      minBlockSize: "100dvh",
      colSpan: { base: 12, md: 8 },
      paddingBlockStart: { base: 4, md: 10 },
    })}
  >
    <svelte:boundary>
      {@render children()}
    </svelte:boundary>
  </main>
</div>
