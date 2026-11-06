<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /* Mirror of ChevronLeft — same two parts, echo trailing inline-start. */
  const echoClass = css({
    fill: "currentColor",
    opacity: 0,
    transitionDuration: "normal",
    transitionProperty: "opacity",
    transitionTimingFunction: "glide",
    _groupFocusVisible: { opacity: 0.45 },
    _groupHoverEnabled: { opacity: 0.45 },
    _groupDisabled: { opacity: 0 },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const chevronClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <path
    class={echoClass}
    d="M4.8 3.4L2.1 5.9L8.3 12L2.1 18.1L4.8 20.6L13.8 12Z"
  />
  <path
    class={chevronClass}
    d="M8.8 3.4L6.1 5.9L12.3 12L6.1 18.1L8.8 20.6L17.8 12Z"
  />
</Icon>
