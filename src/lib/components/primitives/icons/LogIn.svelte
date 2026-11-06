<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * Sign in. Door on the right, arrow travelling into it — vendored from
   * van-life's `log-in-icon`, where the arrow is the thing that moves and
   * therefore the only thing that reacts.
   *
   * Theirs is an open bracket stroke; this set is filled, so the frame became a
   * bracket of even thickness drawn as one path: outer edge, then back along the
   * inner edge, leaving the entry side open.
   *
   * The head is two capsules bailing out at the tip, not one triangle, because
   * the barbs are what pinch toward the shaft while the arrow glides in. The
   * shaft is a capsule too, so nothing here depends on a stroke.
   */
  const ARROW_TIP = { x: 14.8, y: 12 } as const;
  const HEAD = { height: 7.2, width: 2.3, x: 13.65 } as const;

  const frameClass = css({ fill: "currentColor" });

  const arrowClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "translate",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _focusVisible: { translate: "1.4px 0" },
    _groupFocusVisible: { translate: "1.4px 0" },
    _groupHoverEnabled: { translate: "1.4px 0" },
    _hover: { translate: "1.4px 0" },
    ".group:active:not(:disabled) &": { translate: "2.8px 0" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  /* Origin is the tip in user units: the barbs pivot where they meet. */
  const barbRoot = {
    transformBox: "view-box",
    transformOrigin: `${ARROW_TIP.x}px ${ARROW_TIP.y}px`,
    transitionDuration: "normal",
    transitionProperty: "rotate",
    transitionTimingFunction: "glide",
    _motionReduce: { transitionDuration: "0.01ms" },
  } as const;

  /* 90° closed to 60°: each barb swings 15° toward the shaft. */
  const upperBarb = css({
    ...barbRoot,
    _focusVisible: { rotate: "-15deg" },
    _groupFocusVisible: { rotate: "-15deg" },
    _groupHoverEnabled: { rotate: "-15deg" },
    _hover: { rotate: "-15deg" },
    ".group:active:not(:disabled) &": { rotate: "-22deg" },
  });

  const lowerBarb = css({
    ...barbRoot,
    _focusVisible: { rotate: "15deg" },
    _groupFocusVisible: { rotate: "15deg" },
    _groupHoverEnabled: { rotate: "15deg" },
    _hover: { rotate: "15deg" },
    ".group:active:not(:disabled) &": { rotate: "22deg" },
  });

  const inkClass = css({ fill: "currentColor" });

  const DOOR =
    "M15.4 2.6h3a3 3 0 0 1 3 3v12.8a3 3 0 0 1-3 3h-3v-2.3h3a0.7 0.7 0 0 0 0.7-0.7V5.6a0.7 0.7 0 0 0-0.7-0.7h-3V2.6Z";
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <path class={frameClass} d={DOOR} />
  <g class={arrowClass}>
    <rect
      class={inkClass}
      height="2.3"
      rx="1.15"
      width="11.2"
      x="2.6"
      y="10.85"
    />
    <g class={upperBarb}>
      <rect
        class={inkClass}
        height={HEAD.height}
        rx={HEAD.width / 2}
        transform={`rotate(-45 ${ARROW_TIP.x} ${ARROW_TIP.y})`}
        width={HEAD.width}
        x={HEAD.x}
        y={ARROW_TIP.y - HEAD.height}
      />
    </g>
    <g class={lowerBarb}>
      <rect
        class={inkClass}
        height={HEAD.height}
        rx={HEAD.width / 2}
        transform={`rotate(45 ${ARROW_TIP.x} ${ARROW_TIP.y})`}
        width={HEAD.width}
        x={HEAD.x}
        y={ARROW_TIP.y}
      />
    </g>
  </g>
</Icon>
