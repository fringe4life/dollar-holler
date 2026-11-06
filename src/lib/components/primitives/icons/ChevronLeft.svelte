<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /*
   * Two parts: the chevron and an echo trailing it. `directionalArrow` moves the
   * whole element on group hover; the echo resolving is what makes that move
   * read as a repeat rather than a slide. `fill` is set on the parts because
   * `directionalArrow` sets `fill: none` on the root for the stroke glyphs it
   * was written for.
   *
   * The echo hangs off `_groupHoverEnabled`, not `_groupHover`: the pagination
   * controls are disabled at either end, and Chrome still matches `:hover` on a
   * disabled button, so an unguarded rule made the dead button react.
   */
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
    d="M19.2 3.4L21.9 5.9L15.7 12L21.9 18.1L19.2 20.6L10.2 12Z"
  />
  <path
    class={chevronClass}
    d="M15.2 3.4L17.9 5.9L11.7 12L17.9 18.1L15.2 20.6L6.2 12Z"
  />
</Icon>
