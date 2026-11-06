<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { keyframes } from "#styled-system/css/keyframes.js";

  /**
   * One blink, held open at both ends so the closed frame lands late enough to
   * be seen at 16px. Closing is the almond squashed to a slit.
   */
  const blink = keyframes({
    "0%, 28%": { scale: "1 1" },
    "46%": { scale: "1 0.12" },
    "64%, 100%": { scale: "1 1" },
  });

  const blinkMotion = {
    animationDuration: "420ms",
    animationName: blink,
    animationTimingFunction: "ease-in-out",
  } as const;

  /* The group carries the blink only, so it can squash eye and pupil together. */
  const blinkGroupClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    _focusVisible: blinkMotion,
    _groupFocusVisible: blinkMotion,
    _groupHoverEnabled: blinkMotion,
    _hover: blinkMotion,
    _groupDisabled: { animationName: "none" },
    _motionReduce: { animationName: "none" },
  });

  /* Opening wide belongs to the almond: a round pupil is the whole point of it. */
  const almondClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "elastic",
    },
    _groupActive: { scale: "1 1.18" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const pupilClass = css({
    transformBox: "fill-box",
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "translate, scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "elastic",
    },
    _focusVisible: { translate: "0 -1.8px" },
    _groupFocusVisible: { translate: "0 -1.8px" },
    _groupHoverEnabled: { translate: "0 -1.8px" },
    _hover: { translate: "0 -1.8px" },
    _groupActive: { scale: "1.35", translate: "0 -1.8px" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<!--
  Almond and pupil share one group so the blink squashes the eye and its pupil
  together; the almond keeps its own scale for the press, the pupil its own
  look-up and dilation.
-->
<Icon {...props}>
  <g class={blinkGroupClass}>
    <path
      class={almondClass}
      d="M24 11.5C24 11.5 18.9285 4 12 4C5.0715 4 0 11.5 0 11.5C0 11.5 5.0715 19 12 19C18.9285 19 24 11.5 24 11.5ZM12 16C9.5145 16 7.5 13.987 7.5 11.5C7.5 9.013 9.5145 7 12 7C14.484 7 16.5 9.013 16.5 11.5C16.5 13.987 14.484 16 12 16Z"
    />
    <path
      class={pupilClass}
      d="M12 13C12.8284 13 13.5 12.3284 13.5 11.5C13.5 10.6716 12.8284 10 12 10C11.1716 10 10.5 10.6716 10.5 11.5C10.5 12.3284 11.1716 13 12 13Z"
    />
  </g>
</Icon>
