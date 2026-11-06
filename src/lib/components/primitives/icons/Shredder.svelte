<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * A document fed into a shredder, which is the actual job: an invoice or a
   * client is destroyed, not moved to a bin. The sheet sits behind a plain
   * body and sinks into it; strips hang out of the front edge and lengthen.
   *
   * This is the one destructive mark in the set, so it carries the destructive
   * ink itself rather than borrowing its owner's colour — every call site is a
   * delete, and a delete that inherits a neutral ink stops reading as danger.
   * Paper and output are washed tones of that same red.
   */
  const sheetClass = css({
    fill: "destructive",
    opacity: 0.5,
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "opacity, translate",
    transitionTimingFunction: { base: "anticipate", _supportsLinear: "glide" },
    _groupFocusVisible: { translate: "0 2px" },
    _groupHoverEnabled: { translate: "0 2px" },
    _hover: { translate: "0 2px" },
    _groupActive: { opacity: 0.26, translate: "0 4.4px" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const bodyClass = css({ fill: "destructive" });

  /* Uneven lengths: equal stubs read as legs, uneven ones read as output. */
  const stripClass = css({
    fill: "destructive",
    opacity: 0.62,
    transformBox: "fill-box",
    transformOrigin: "top",
    transitionDuration: "normal",
    transitionProperty: "scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "elastic",
    },
    scale: "1 0.55",
    _groupFocusVisible: { scale: "1 0.9" },
    _groupHoverEnabled: { scale: "1 0.9" },
    _hover: { scale: "1 0.9" },
    _groupActive: { scale: "1 1.15" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <path
    class={sheetClass}
    d="M8.4 1.4h5.4l2.2 2.2v7.1a0.9 0.9 0 0 1-0.9 0.9H9.3a0.9 0.9 0 0 1-0.9-0.9Z"
  />
  <rect class={stripClass} height="3.4" rx="0.7" width="1.5" x="6.9" y="17.9" />
  <rect
    class={stripClass}
    height="2.6"
    rx="0.7"
    width="1.5"
    x="10.3"
    y="17.9"
  />
  <rect
    class={stripClass}
    height="3.8"
    rx="0.7"
    width="1.5"
    x="13.7"
    y="17.9"
  />
  <rect class={stripClass} height="3" rx="0.7" width="1.5" x="17.1" y="17.9" />
  <rect class={bodyClass} height="7.6" rx="2.2" width="19.6" x="2.2" y="10.4" />
</Icon>
