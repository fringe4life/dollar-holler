<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { keyframes } from "#styled-system/css/keyframes.js";

  /**
   * Dashboard. Four panels, two per column, heights alternating between the
   * columns — short over tall on the left, tall over short on the right, the
   * right column a shade wider. That opposition is what reads as a dashboard
   * rather than as a window frame; four equal panes read as a browser.
   *
   * Vendored from van-life's `dashboard-icon`, geometry and stagger intact: the
   * panels land in reading order 60ms apart, each dropping 1.6px and scaling up
   * on `spring`. Theirs filled one panel on hover because their glyph was
   * strokes; ours are already solid, so the landing itself is the event.
   */
  const tileIn = keyframes({
    from: { scale: "0.82", translate: "0 -1.6px" },
    to: { scale: "1", translate: "0 0" },
  });

  const tileDrop = (delay: string) =>
    ({
      _groupFocusVisible: {
        animationDelay: delay,
        animationDuration: "520ms",
        animationName: tileIn,
        animationTimingFunction: "anticipate",
      },
      _groupHoverEnabled: {
        animationDelay: delay,
        animationDuration: "520ms",
        animationName: tileIn,
        animationTimingFunction: "anticipate",
      },
      _motionReduce: { animationName: "none" },
      transformBox: "fill-box",
      transformOrigin: "center",
    }) as const;

  const shortLeft = css(tileDrop("0ms"));
  const tallRight = css(tileDrop("60ms"));
  const tallLeft = css(tileDrop("120ms"));
  const shortRight = css(tileDrop("180ms"));

  const inkClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <g class={inkClass}>
    <rect class={shortLeft} height="6.2" rx="2.2" width="7.6" x="3.2" y="3.2" />
    <rect
      class={tallRight}
      height="10.2"
      rx="2.2"
      width="8.2"
      x="12.6"
      y="3.2"
    />
    <rect class={tallLeft} height="9.6" rx="2.2" width="7.6" x="3.2" y="11.2" />
    <rect
      class={shortRight}
      height="5.6"
      rx="2.2"
      width="8.2"
      x="12.6"
      y="15.2"
    />
  </g>
</Icon>
