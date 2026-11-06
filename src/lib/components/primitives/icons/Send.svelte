<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { keyframes } from "#styled-system/css/keyframes.js";

  /** Exhaust behind the tail, only while the owner is held. */
  const speedPulse = keyframes({
    "0%, 100%": { opacity: 0.12, translate: "0 0" },
    "50%": { opacity: 0.65, translate: "-1.6px 0" },
  });

  const pulseMotion = {
    animationDuration: "520ms",
    animationIterationCount: "infinite",
    animationName: speedPulse,
    animationTimingFunction: "ease-in-out",
  } as const;

  /**
   * One group, no detached parts: the wings tuck by squashing the silhouette
   * vertically, so the fold never opens a seam against the keel.
   */
  const flightClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "rotate, translate, scale",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _groupFocusVisible: {
      rotate: "-7deg",
      scale: "1 0.95",
      translate: "1.2px 0",
    },
    _groupHoverEnabled: {
      rotate: "-7deg",
      scale: "1 0.95",
      translate: "1.2px 0",
    },
    _hover: { rotate: "-7deg", scale: "1 0.95", translate: "1.2px 0" },
    /* Press: launch forward from wherever the hover left it. */
    ".group:active:not(:disabled) &": {
      rotate: "-2.5deg",
      scale: "1.07",
      translate: "4.6px -0.8px",
    },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  /*
   * Three tones of one ink: lit top surface, dark inner keel, shaded lower wing.
   * Tones stay high because at 16px the shading has to survive a 1px fold.
   */
  const keelClass = css({ opacity: 0.5 });
  const lowerWingClass = css({ opacity: 0.74 });

  const trailBase = {
    fill: "currentColor",
    opacity: 0,
    transitionDuration: "normal",
    transitionProperty: "opacity",
  } as const;

  const trailMotion = {
    _groupActive: pulseMotion,
    _groupDisabled: { animationName: "none", opacity: 0 },
    _motionReduce: { animationName: "none", opacity: 0.5 },
  } as const;

  const trailNearClass = css({
    ...trailBase,
    ...trailMotion,
    animationDelay: "0ms",
  });
  const trailMidClass = css({
    ...trailBase,
    ...trailMotion,
    animationDelay: "120ms",
  });
  const trailFarClass = css({
    ...trailBase,
    ...trailMotion,
    animationDelay: "240ms",
  });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <g class={flightClass}>
    <rect
      class={trailFarClass}
      height="1.5"
      rx="0.75"
      width="2.2"
      x="0.7"
      y="12.7"
    />
    <rect
      class={trailMidClass}
      height="1.6"
      rx="0.8"
      width="3.2"
      x="0.2"
      y="11.2"
    />
    <rect
      class={trailNearClass}
      height="1.5"
      rx="0.75"
      width="2.6"
      x="0.7"
      y="9.8"
    />
    <path class={lowerWingClass} d="M23.2 12L4.4 20.4L4.4 14.6L15.5 12Z" />
    <path class={keelClass} d="M4.2 9.4L15.5 12L4.4 14.6Z" />
    <path d="M4.2 3.6L23.2 12L15.5 12L4.2 9.4Z" />
  </g>
</Icon>
