<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { grid, gridItem } from "#styled-system/patterns/index.js";
  import Navbar from "#lib/components/patterns/navbar/Navbar.svelte";

  let { children } = $props();
</script>

<div
  class={grid({
    backgroundColor: "background",
    columns: { base: 1, md: 12 },
    overflowX: "clip",
    minBlockSize: "100dvh",
    columnGap: { base: 0, md: 16 },
    position: "relative",
    gridTemplateAreas: {
      base: '"nav" "main"',
      md: '"nav nav nav main main main main main main main main ."',
    },
  })}
>
  <!-- contents: the header inside Navbar stays the grid item for area "nav" -->
  <div class={css({ display: "contents" })}>
    <Navbar />
  </div>
  <main
    class={gridItem({
      display: "flex",
      flexDirection: "column",
      paddingInline: 4,
      minBlockSize: "100dvh",
      gridArea: "main",
      paddingBlockStart: { base: 4, md: 10 },
    })}
  >
    <svelte:boundary>
      {@render children()}
    </svelte:boundary>
  </main>
</div>
