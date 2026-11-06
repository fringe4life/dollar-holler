<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";

  /**
   * The mark around a nav label: three bars, not one image. At rest they are
   * hidden; on a hovered (not current) item they fan out, washed out; on the
   * current item they pull back together against the label.
   *
   * Selectors use a direct child of the anchor so the surrounding `ul.group`
   * cannot stand in for the item being pointed at.
   */
  const accentClass = css({
    blockSize: 30,
    display: "grid",
    insetBlockStart: "50%",
    opacity: 0,
    placeItems: "center",
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "normal",
    transitionProperty: "opacity, translate",
    transitionTimingFunction: { base: "ease-out", _supportsLinear: "dramatic" },
    translate: "0 -50%",
    "[aria-current] > &": { opacity: 1 },
    ".group:not([aria-current]):is(:hover, :focus-visible) > &": {
      opacity: 0.4,
    },
  });

  const startClass = css({
    insetInlineStart: 0,
    "[aria-current] > &": { translate: "1.5px -50%" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const endClass = css({
    insetInlineEnd: 0,
    "[aria-current] > &": { translate: "-1.5px -50%" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const markClass = css({ fill: "success" });

  const barClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "slow",
    transitionProperty: "rotate, translate, scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "dramatic",
    },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  /* Top and bottom peel away from the label; the middle bar holds the line. */
  const topBarClass = css({
    ".group:not([aria-current]):is(:hover, :focus-visible) > &": {
      rotate: "-16deg",
      translate: "0 -3.4px",
    },
  });

  const bottomBarClass = css({
    ".group:not([aria-current]):is(:hover, :focus-visible) > &": {
      rotate: "16deg",
      translate: "0 3.4px",
    },
  });

  const middleBarClass = css({
    ".group:not([aria-current]):is(:hover, :focus-visible) > &": {
      scale: "0.82 1",
    },
  });
</script>

<script lang="ts">
  import Icon from "#lib/components/primitives/Icon.svelte";

  interface Props {
    side: "start" | "end";
  }

  let { side }: Props = $props();

  const isStart = $derived(side === "start");
</script>

<div
  aria-hidden="true"
  class={cx(accentClass, isStart ? startClass : endClass)}
>
  <Icon
    height={30}
    viewBox={isStart ? "0 0 20 30" : "0 0 22 30"}
    width={isStart ? 20 : 22}
  >
    <g class={markClass}>
      {#if isStart}
        <path
          class={cx(barClass, topBarClass)}
          d="M20 9l-1-2-8-4-7-2H3v1q1 4 5 4z"
        />
        <path
          class={cx(barClass, middleBarClass)}
          d="M6 17l3-1 8-1 1-1q1-3-2-3L5 13H3l-1 1z"
        />
        <path
          class={cx(barClass, bottomBarClass)}
          d="M6 30l11-6 2-2v-1l-3-2-13 6-1 1v2l3 2z"
        />
      {:else}
        <path
          class={cx(barClass, topBarClass)}
          d="M3 11h1l2-1 9-6V2h-4L2 9q-2 1 0 2z"
        />
        <path
          class={cx(barClass, middleBarClass)}
          d="M5 13l1 1 2 1 10 1 4 1v-1l-4-3z"
        />
        <path
          class={cx(barClass, bottomBarClass)}
          d="M15 27l-9-6H3v1l4 4 4 3h1z"
        />
      {/if}
    </g>
  </Icon>
</div>
