<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * Back. At rest it is a bare head — two barbs meeting at a point, which is all
   * a back link needs to say. The shaft is there the whole time, parked at the
   * tip at 42% length and invisible; hovering reveals it while the barbs close
   * toward it, so the mark assembles into an arrow as the pointer arrives.
   *
   * That ordering matters: the head is the constant, the shaft is the news. An
   * arrow that simply slid sideways would say less with more motion.
   *
   * Colour is the owner's job — the back link goes `mutedAction` to `foreground`
   * — so every part is `currentColor` and nothing here tints.
   */
  const TIP = { x: 2.9, y: 12 } as const;
  const BARB = { height: 8.2, width: 2.3, x: 1.75 } as const;

  const inkClass = css({ fill: "currentColor" });

  const barbBase = {
    transformBox: "view-box",
    transformOrigin: `${TIP.x}px ${TIP.y}px`,
    transitionDuration: "normal",
    transitionProperty: "rotate",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _motionReduce: { transitionDuration: "0.01ms" },
  } as const;

  /* Positive rotation is clockwise, so the upper barb closes downward. */
  const upperBarb = css({
    ...barbBase,
    _focusVisible: { rotate: "15deg" },
    _groupFocusVisible: { rotate: "15deg" },
    _groupHoverEnabled: { rotate: "15deg" },
    _hover: { rotate: "15deg" },
    ".group:active:not(:disabled) &": { rotate: "20deg" },
  });

  const lowerBarb = css({
    ...barbBase,
    _focusVisible: { rotate: "-15deg" },
    _groupFocusVisible: { rotate: "-15deg" },
    _groupHoverEnabled: { rotate: "-15deg" },
    _hover: { rotate: "-15deg" },
    ".group:active:not(:disabled) &": { rotate: "-20deg" },
  });

  /* Grows out of the tip rather than fading in from the middle. */
  const shaftClass = css({
    opacity: 0,
    scale: "0.42 1",
    transformBox: "view-box",
    transformOrigin: `${TIP.x}px ${TIP.y}px`,
    transitionDuration: "normal",
    transitionProperty: "opacity, scale",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _focusVisible: { opacity: 1, scale: "1 1" },
    _groupFocusVisible: { opacity: 1, scale: "1 1" },
    _groupHoverEnabled: { opacity: 1, scale: "1 1" },
    _hover: { opacity: 1, scale: "1 1" },
    ".group:active:not(:disabled) &": { opacity: 1, scale: "1 1" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <g class={inkClass}>
    <rect
      class={shaftClass}
      height="2.3"
      rx="1.15"
      width="17.7"
      x="2.9"
      y="10.85"
    />
    <g class={upperBarb}>
      <rect
        height={BARB.height}
        rx={BARB.width / 2}
        transform="rotate(45 2.9 12)"
        width={BARB.width}
        x={BARB.x}
        y={TIP.y - BARB.height}
      />
    </g>
    <g class={lowerBarb}>
      <rect
        height={BARB.height}
        rx={BARB.width / 2}
        transform="rotate(-45 2.9 12)"
        width={BARB.width}
        x={BARB.x}
        y={TIP.y}
      />
    </g>
  </g>
</Icon>
