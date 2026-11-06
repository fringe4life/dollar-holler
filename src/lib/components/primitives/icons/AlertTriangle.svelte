<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * Outcome state: error. Vendored from van-life's `triangle-alert-icon`, whose
   * rounded triangle is doing real work — it stays recognisable at 20px where a
   * straight-cornered triangle reads as a printed warning label.
   *
   * Static by decision, theirs and ours: the state is already the loudest thing
   * on the page (destructive rail, destructive action, assertive announcement),
   * and a shaking mark on top of that is panic rather than information.
   *
   * Ported from stroke to this set's fill by inversion: the frame becomes the
   * solid shape and the exclamation is punched out of it with `evenodd`, so the
   * hole shows whatever is behind the glyph. On the error card that is the
   * amber chip, which is exactly where the mark should be reading loudest.
   */
  const inkClass = css({ fill: "currentColor" });

  const FRAME =
    "M21.73 18.2 13.73 4.2a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21.2h16a2 2 0 0 0 1.73-3Z";
  /* One unit heavier than the frame's gap, so the mark reads before the shape. */
  const BAR =
    "M12 8.6a1.1 1.1 0 0 1 1.1 1.1v3.6a1.1 1.1 0 0 1-2.2 0V9.7A1.1 1.1 0 0 1 12 8.6Z";
  const DOT = "M12 16.05a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 1 0 0-2.3Z";
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <path class={inkClass} d={`${FRAME}${BAR}${DOT}`} fill-rule="evenodd" />
</Icon>
