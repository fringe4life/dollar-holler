<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * "This goes somewhere." Vendored from van-life's `arrow-right-icon`: a shaft
   * and two barbs that pitch, rather than a whole arrow that slides. The head is
   * tighter than the stock 45° — 33° off the shaft — which is what makes it read
   * as aimed rather than as a chevron with a tail.
   *
   * Authored pointing right, then turned 45° by an attribute on the outer group:
   * a CSS transform would overwrite that attribute, and every css() value has to
   * be a literal for the extractor, so the diagonal is geometry, not a rotation
   * prop.
   *
   * The push runs along the glyph's own diagonal, not the page's X — an
   * up-and-right arrow that travels right reads as a typo.
   */
  const TIP = { x: 19.6, y: 12 } as const;
  const BARB = { height: 7.6, width: 2.2, x: 18.5 } as const;
  /*
   * 57° off vertical is 33° off the shaft. The signs matter: a positive turn
   * swings a barb past the tip, which flips the head to the wrong side of the
   * shaft — the glyph still reads as an arrow, just aimed backwards.
   */
  const UPPER_BASE = -57;
  const LOWER_BASE = 57;

  const inkClass = css({ fill: "currentColor" });

  const bodyClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "translate",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _focusVisible: { translate: "1.1px -1.1px" },
    _groupFocusVisible: { translate: "1.1px -1.1px" },
    _groupHoverEnabled: { translate: "1.1px -1.1px" },
    _hover: { translate: "1.1px -1.1px" },
    ".group:active:not(:disabled) &": { translate: "2.2px -2.2px" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  /* Closing toward the shaft is clockwise for the upper barb, counter for the lower. */
  const barbBase = {
    transformBox: "view-box",
    transformOrigin: `${TIP.x}px ${TIP.y}px`,
    transitionDuration: "normal",
    transitionProperty: "rotate",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _motionReduce: { transitionDuration: "0.01ms" },
  } as const;

  const upperBarb = css({
    ...barbBase,
    _focusVisible: { rotate: "-15deg" },
    _groupFocusVisible: { rotate: "-15deg" },
    _groupHoverEnabled: { rotate: "-15deg" },
    _hover: { rotate: "-15deg" },
    ".group:active:not(:disabled) &": { rotate: "-20deg" },
  });

  const lowerBarb = css({
    ...barbBase,
    _focusVisible: { rotate: "15deg" },
    _groupFocusVisible: { rotate: "15deg" },
    _groupHoverEnabled: { rotate: "15deg" },
    _hover: { rotate: "15deg" },
    ".group:active:not(:disabled) &": { rotate: "20deg" },
  });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<!-- Scaled to 0.92 inside the turn so the diagonal stays inside the 24 box. -->
<Icon {...props}>
  <g class={bodyClass}>
    <g transform="translate(12 12) scale(0.92) rotate(-45) translate(-12 -12)">
      <g class={inkClass}>
        <rect height="2.2" rx="1.1" width="15.6" x="4" y="10.9" />
        <g class={upperBarb}>
          <rect
            height={BARB.height}
            rx={BARB.width / 2}
            transform={`rotate(${UPPER_BASE} ${TIP.x} ${TIP.y})`}
            width={BARB.width}
            x={BARB.x}
            y={TIP.y - BARB.height}
          />
        </g>
        <g class={lowerBarb}>
          <rect
            height={BARB.height}
            rx={BARB.width / 2}
            transform={`rotate(${LOWER_BASE} ${TIP.x} ${TIP.y})`}
            width={BARB.width}
            x={BARB.x}
            y={TIP.y}
          />
        </g>
      </g>
    </g>
  </g>
</Icon>
