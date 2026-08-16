<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { grid, gridItem } from "#styled-system/patterns/index.js";
  import { asset } from "$app/paths";

  let { children } = $props();
</script>

<div
  class={css({
    backgroundColor: "daisyBush",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    inlineSize: "full",
    minBlockSize: "100dvh",
    backgroundImage: { base: "none", md: "var(--bg-image)" },
  })}
  style:--bg-image={`url(${asset("images/bg-auth.svg")})`}
>
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
    <div
      class={gridItem({
        colSpan: { base: 12, md: 6, lg: 4, xl: 3 },
        gridColumnStart: { lg: 3, xl: 4 },
        paddingBlockStart: 8,
        marginBlock: { md: "auto" },
      })}
    >
      <img
        alt="The Doller Holla"
        class={css({ marginInline: "auto" })}
        src={asset("images/logo.svg")}
      />
    </div>
    <div
      class={gridItem({
        colSpan: { base: 12, md: 6, lg: 4, xl: 3 },
        marginBlock: { md: "auto" },
      })}
    >
      {@render children()}
    </div>
  </div>
</div>
