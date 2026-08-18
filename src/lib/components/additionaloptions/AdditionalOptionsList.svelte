<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import type { Option } from "./AdditionalOptionsItem.svelte";
  import AdditionalOptionsItem from "./AdditionalOptionsItem.svelte";

  interface Props {
    anchorName: string;
    options: Option[];
    id: string;
  }

  let { anchorName, options, id }: Props = $props();
</script>

<ul
  aria-label="Additional options"
  class={css({
    bgColor: "white",
    inset: "auto",
    insetBlockStart: "anchor(bottom)",
    insetInlineEnd: "anchor(right)",
    margin: 1,
    opacity: 0,
    position: "fixed",
    rounded: "lg",
    shadow: "lg",
    scale: 0.98,
    transformOrigin: "top right",
    translate: "0 -0.25rem",
    transitionBehavior: "allow-discrete",
    transitionDuration: "normal",
    transitionProperty: "opacity, translate, scale, display",
    transitionTimingFunction: "ease-in",
    positionTryFallbacks: "flip-block flip-inline",

    _open: {
      opacity: 1,
      scale: 1,
      translate: "0 0",
      transitionDuration: "fast",
      transitionTimingFunction: "anticipate",

      _starting: {
        opacity: 0,
        scale: 0.98,
        translate: "0 -0.25rem",
      },
    },
  })}
  {id}
  popover="auto"
  style:position-anchor={anchorName}
>
  {#each options as option (option.label)}
    <AdditionalOptionsItem {option} />
  {/each}
</ul>
