<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * A state flag, as a fallback for the ones flagcdn does not host. Vendored
   * from Lucide's flag: the same wavy banner, no pole — the pole exists to carry
   * the mark up a 24 grid, and once it is gone the banner can sit in the middle
   * and grow. It is scaled to nearly fill the box (22.7 units of 24) so it reads
   * at the same weight as the hosted 24×18 flag images beside it in the list.
   *
   * Static, and it has to be: this renders inside an `<option>`, which no
   * pointer state reaches.
   */
  const BANNER = "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z";
  /* Scale about the banner's own centre, then drop it onto the grid centre. */
  const FRAME = "translate(0 3) translate(12 9) scale(1.42) translate(-12 -9)";

  const inkClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <path class={inkClass} d={BANNER} transform={FRAME} />
</Icon>
