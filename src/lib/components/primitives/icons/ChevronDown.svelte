<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * The select indicator: two barbs, no enclosed shape, rounded caps. It was a
   * `background-image` with a hard-coded grey — the last glyph in the app that
   * could not take `currentColor` and could not be split.
   *
   * Drawn as two capsules rather than the house's solid chevron band because
   * the select needs a *quiet* mark: at 16px against a 2px border, the filled
   * band that pagination uses reads as a second border. Two lines are the mark
   * van-life settled on for the same control.
   *
   * The base 45° stance is an attribute on each capsule; the wrapper `<g>` is
   * what CSS rotates, because a CSS transform would override the attribute.
   * Bailing out at the tip is what makes the two parts answer separately.
   */
  const BARB = { height: 9.4, width: 2.3, x: 10.85, y: 7 } as const;
  const TIP = { x: 12, y: 16.4 } as const;

  const barbBase = {
    transformBox: "view-box",
    transformOrigin: `${TIP.x}px ${TIP.y}px`,
    transitionDuration: "180ms",
    transitionProperty: "rotate",
    transitionTimingFunction: "glide",
    _motionReduce: { transitionDuration: "0.01ms" },
  } as const;

  /*
   * A select is not a `.group`, so the glyph reads its own owner: the sibling
   * `<select>` it sits inside. Hover spreads the point a touch (the control
   * settling under the pointer), press closes it (commitment).
   */
  const leftBarb = css({
    ...barbBase,
    ":where(select):active ~ svg &": { rotate: "-6deg" },
    ":where(select):hover ~ svg &": { rotate: "5deg" },
  });

  const rightBarb = css({
    ...barbBase,
    ":where(select):active ~ svg &": { rotate: "6deg" },
    ":where(select):hover ~ svg &": { rotate: "-5deg" },
  });

  const inkClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <g class={inkClass}>
    <g class={leftBarb}>
      <rect
        height={BARB.height}
        rx={BARB.width / 2}
        transform="rotate(-45 12 16.4)"
        width={BARB.width}
        x={BARB.x}
        y={BARB.y}
      />
    </g>
    <g class={rightBarb}>
      <rect
        height={BARB.height}
        rx={BARB.width / 2}
        transform="rotate(45 12 16.4)"
        width={BARB.width}
        x={BARB.x}
        y={BARB.y}
      />
    </g>
  </g>
</Icon>
