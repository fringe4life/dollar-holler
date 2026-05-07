<script lang="ts">
  import { css } from "styled-system/css";
  import { grid, gridItem } from "styled-system/patterns";
  import { asset } from "$app/paths";

  let { children } = $props();
</script>
<!-- "bg-daisyBush bg-none bg-cover bg-center bg-no-repeat inline-full min-block-dvh md:bg-[url('/images/bg-auth.svg')]" -->
<div
  style:--bg-image={`url(${asset('/images/bg-auth.svg')})`}
  class={css({
    backgroundColor: "daisyBush",
    backgroundRepeat: "no-repeat",
    // backgroundSize: "cover",
    backgroundPosition: "center",
    inlineSize: "full",
    minBlockSize: "100dvh",
    backgroundImage: { base: "none", md: "var(--bg-image)" },
  })}
>
  <!-- "grid auto-rows-min grid-cols-12 place-content-center px-4 min-block-dvh md:auto-rows-fr md:gap-5 xl:px-0" -->
  <div
    class={grid({
      columns: 12,
      placeContent: "center",
      paddingInline: { base: 4, xl: 0 },
      minBlockSize: "100dvh",
      gap: { base: 0, md: 5 },
      gridAutoRows: { base: "min", md: "fr" },
    })}
  >
    <!-- "col-span-full pbs-8 md:col-span-6 md:my-auto lg:col-span-4 lg:col-start-3 xl:col-span-3 xl:col-start-4" -->
    <div
      class={gridItem({
        colSpan: { base: 12, md: 6, lg: 4, xl: 3 },
        gridColumnStart: { lg: 3, xl: 4 },
        paddingBlockStart: 8,
        marginBlock: { md: "auto" }
      })}
    >
      <img
        src={asset('/images/logo.svg')}
        alt="The Doller Holla"
        class={css({ marginInline: "auto" })}
      >
    </div>
    <!-- "col-span-full md:col-span-6 md:my-auto lg:col-span-4 xl:col-span-3" -->
    <div
      class={gridItem({
        colSpan: { base: 12, md: 6, lg: 4, xl: 3 },
        marginBlock: { md: "auto" }
      })}
    >
      {@render children()}
    </div>
  </div>
</div>
