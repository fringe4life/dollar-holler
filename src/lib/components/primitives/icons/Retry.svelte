<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { keyframes } from "#styled-system/css/keyframes.js";

  /**
   * Try again. Three quarters of a ring with the head on the right, pointing
   * the way the ring travels — described once, in geometry, so the gap and the
   * head can never drift apart: 270° of arc from 40° round to 310°, which
   * leaves the opening across the right side.
   *
   * The head is a triangle on the band's midline tangent instead of the usual
   * L-shaped corner: a corner cap belongs to a stroked circle, and this set is
   * filled, so the arrow has to be a shape that can stand on its own.
   *
   * Hover turns a quarter turn — enough to read as a rewind without leaving the
   * glyph at a strange angle. A held press spins, which is the only state here
   * that can honestly say "working"; nothing spins at rest.
   */
  const CENTER = 12;
  const OUTER = 8.6;
  const INNER = 6.9;
  const START = 40;
  const END = 310;
  const HEAD = 5.8;

  const toUnits = (value: number) => Math.round(value * 100) / 100;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;

  const at = (radius: number, degrees: number) =>
    `${toUnits(CENTER + radius * Math.cos(radians(degrees)))} ${toUnits(
      CENTER + radius * Math.sin(radians(degrees))
    )}`;

  const BAND = `M${at(OUTER, START)}A${OUTER} ${OUTER} 0 1 1 ${at(OUTER, END)}L${at(INNER, END)}A${INNER} ${INNER} 0 1 0 ${at(INNER, START)}Z`;

  /* Tangent at END, and the band's midline it leaves from. */
  const MIDLINE = (OUTER + INNER) / 2;
  const tangent = {
    x: -Math.sin(radians(END)),
    y: Math.cos(radians(END)),
  };
  const apex = {
    x: CENTER + MIDLINE * Math.cos(radians(END)) + HEAD * tangent.x,
    y: CENTER + MIDLINE * Math.sin(radians(END)) + HEAD * tangent.y,
  };
  /* Wider than the band, so the head overhangs on both sides. */
  const HEAD_PATH = `M${at(OUTER + 1.2, END)}L${toUnits(apex.x)} ${toUnits(apex.y)}L${at(INNER - 1.2, END)}Z`;

  const spin = keyframes({
    from: { rotate: "0deg" },
    to: { rotate: "360deg" },
  });

  const glyphClass = css({
    transformBox: "view-box",
    transformOrigin: `${CENTER}px ${CENTER}px`,
    transitionDuration: "420ms",
    transitionProperty: "rotate",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _focusVisible: { rotate: "90deg" },
    _groupFocusVisible: { rotate: "90deg" },
    _groupHoverEnabled: { rotate: "90deg" },
    _hover: { rotate: "90deg" },
    _groupActive: {
      animationDuration: "680ms",
      animationIterationCount: "infinite",
      animationName: spin,
      animationTimingFunction: "linear",
      rotate: "0deg",
    },
    _motionReduce: { animationName: "none", transitionDuration: "0.01ms" },
  });

  const inkClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <g class={glyphClass}>
    <g class={inkClass}>
      <path d={BAND} />
      <path d={HEAD_PATH} />
    </g>
  </g>
</Icon>
