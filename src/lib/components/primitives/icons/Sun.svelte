<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /*
   * Rays are dimmer than the core so the sun reads as emitting rather than as a
   * solid disc. They sit in one group: a select option cannot animate, but the
   * split is what a future light-mode swap would animate.
   */
  const raysClass = css({ fill: "currentColor", opacity: 0.78 });
  const coreClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <g class={raysClass}>
    <rect height="3.4" rx="0.9" width="1.8" x="11.1" y="1.2" />
    <rect
      height="3.4"
      rx="0.9"
      transform="rotate(45 12 12)"
      width="1.8"
      x="11.1"
      y="1.2"
    />
    <rect
      height="3.4"
      rx="0.9"
      transform="rotate(90 12 12)"
      width="1.8"
      x="11.1"
      y="1.2"
    />
    <rect
      height="3.4"
      rx="0.9"
      transform="rotate(135 12 12)"
      width="1.8"
      x="11.1"
      y="1.2"
    />
    <rect
      height="3.4"
      rx="0.9"
      transform="rotate(180 12 12)"
      width="1.8"
      x="11.1"
      y="1.2"
    />
    <rect
      height="3.4"
      rx="0.9"
      transform="rotate(225 12 12)"
      width="1.8"
      x="11.1"
      y="1.2"
    />
    <rect
      height="3.4"
      rx="0.9"
      transform="rotate(270 12 12)"
      width="1.8"
      x="11.1"
      y="1.2"
    />
    <rect
      height="3.4"
      rx="0.9"
      transform="rotate(315 12 12)"
      width="1.8"
      x="11.1"
      y="1.2"
    />
  </g>
  <circle class={coreClass} cx="12" cy="12" r="4.6" />
</Icon>
