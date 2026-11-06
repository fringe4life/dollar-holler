<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * The one glyph that carries colour: a wooden pencil is yellow with a red
   * eraser, and the point is ink. Body, ferrule, eraser and point are separate
   * nodes so the squish lands on the whole pencil without the eraser sliding.
   *
   * At rest the parts are washed tones of the same ink, like the plane's shaded
   * fold — a solid pencil sat too loud next to the monochrome set. Colour only
   * arrives with the owner.
   *
   * The 45° stance is an attribute on an inner group; the outer group is what
   * CSS transforms, because a CSS transform would override the attribute.
   */
  const pencilClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "rotate, scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "elastic",
    },
    _focusVisible: { rotate: "-7deg", scale: "1.05 0.95" },
    _groupFocusVisible: { rotate: "-7deg", scale: "1.05 0.95" },
    _groupHoverEnabled: { rotate: "-7deg", scale: "1.05 0.95" },
    _hover: { rotate: "-7deg", scale: "1.05 0.95" },
    ".group:active:not(:disabled) &": { rotate: "3deg", scale: "1.14 0.84" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const tintClass = {
    transitionDuration: "normal",
    transitionProperty: "fill, opacity",
  } as const;

  const bodyClass = css({
    ...tintClass,
    _focusVisible: { fill: "warning", opacity: 1 },
    _groupFocusVisible: { fill: "warning", opacity: 1 },
    _groupHoverEnabled: { fill: "warning", opacity: 1 },
    _hover: { fill: "warning", opacity: 1 },
    ".group:active:not(:disabled) &": { fill: "warning", opacity: 1 },
    fill: "currentColor",
    opacity: 0.78,
  });

  const ferruleClass = css({ fill: "currentColor", opacity: 0.45 });

  const eraserClass = css({
    ...tintClass,
    _focusVisible: { fill: "destructive", opacity: 1 },
    _groupFocusVisible: { fill: "destructive", opacity: 1 },
    _groupHoverEnabled: { fill: "destructive", opacity: 1 },
    _hover: { fill: "destructive", opacity: 1 },
    ".group:active:not(:disabled) &": { fill: "destructive", opacity: 1 },
    fill: "currentColor",
    opacity: 0.86,
  });

  const pointClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <g class={pencilClass}>
    <g transform="rotate(45 12 12)">
      <rect class={bodyClass} height="10.8" width="3.4" x="10.3" y="5.6" />
      <path class={bodyClass} d="M10.3 16.4h3.4l-1.2 3.2h-1Z" />
      <rect class={ferruleClass} height="1.4" width="3.4" x="10.3" y="4.2" />
      <rect
        class={eraserClass}
        height="2.8"
        rx="1.2"
        width="3.4"
        x="10.3"
        y="1.4"
      />
      <path class={pointClass} d="M11.5 19.6h1L12 22.1Z" />
    </g>
  </g>
</Icon>
