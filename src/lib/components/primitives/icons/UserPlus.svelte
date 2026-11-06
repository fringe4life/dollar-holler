<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";

  /**
   * New account. Person and plus, and only the plus moves: a head that turns or
   * lifts draws the eye to the wrong half of the mark, and the person is the
   * subject, not the action.
   *
   * The person is van-life's `user-icon` proportion sleeved down — a head and a
   * shoulder dome, no torso outline, because a curve pair for the shoulders read
   * as a bell at 16px. It answers the press only, where broadening shoulders is
   * the body's own gesture.
   *
   * The plus is `square-plus-icon`'s mechanic without the plate, and this is
   * where the flourish lives: the cross scales on a spring while its two arms
   * thicken on their thin axis, the vertical arm 50ms behind the horizontal one.
   * The stagger is what makes it read as the mark being *built* rather than
   * simply resized — a single scale on a plus just looks like a bigger plus.
   * Near-square caps keep it a cross; half-round caps made it a lozenge.
   */
  const PLUS = { cx: 19, cy: 11 } as const;

  /* Shoulders are the heavier mass: they settle flat rather than spring. */
  const shouldersClass = css({
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
    transitionDuration: "normal",
    transitionProperty: "scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "glide",
    },
    ".group:active:not(:disabled) &": { scale: "1.08 1" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const plusClass = css({
    transformBox: "view-box",
    transformOrigin: `${PLUS.cx}px ${PLUS.cy}px`,
    transitionDuration: "normal",
    transitionProperty: "scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "elastic",
    },
    _focusVisible: { scale: 1.16 },
    _groupFocusVisible: { scale: 1.16 },
    _groupHoverEnabled: { scale: 1.16 },
    _hover: { scale: 1.16 },
    ".group:active:not(:disabled) &": { scale: 1.3 },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const armBase = {
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "elastic",
    },
    _motionReduce: { transitionDuration: "0.01ms" },
  } as const;

  /* Horizontal arm leads; the vertical one arrives a beat later. */
  const armHClass = css({
    ...armBase,
    _focusVisible: { scale: "1 1.35" },
    _groupFocusVisible: { scale: "1 1.35" },
    _groupHoverEnabled: { scale: "1 1.35" },
    _hover: { scale: "1 1.35" },
    ".group:active:not(:disabled) &": { scale: "1 1.6" },
  });

  const armVClass = css({
    ...armBase,
    _focusVisible: { scale: "1.35 1", transitionDelay: "50ms" },
    _groupFocusVisible: { scale: "1.35 1", transitionDelay: "50ms" },
    _groupHoverEnabled: { scale: "1.35 1", transitionDelay: "50ms" },
    _hover: { scale: "1.35 1", transitionDelay: "50ms" },
    ".group:active:not(:disabled) &": {
      scale: "1.6 1",
      transitionDelay: "50ms",
    },
  });

  const inkClass = css({ fill: "currentColor" });

  const SHOULDERS = "M2.9 20.3a5.9 5.3 0 0 1 11.8 0Z";
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <ellipse class={inkClass} cx="8.8" cy="7.6" rx="2.7" ry="2.9" />
  <path class={cx(shouldersClass, inkClass)} d={SHOULDERS} />
  <g class={plusClass}>
    <rect
      class={cx(armHClass, inkClass)}
      height="2"
      rx="0.4"
      width="7.4"
      x="15.3"
      y="10"
    />
    <rect
      class={cx(armVClass, inkClass)}
      height="7.4"
      rx="0.4"
      width="2"
      x="18"
      y="7.3"
    />
  </g>
</Icon>
