<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /*
   * Screen is a hole in the bezel with a dim panel behind it, so the monitor
   * keeps a lit interior without a second colour. Stand and base are separate
   * nodes — the stand is the part a future "system follows the OS" state would
   * settle, never the panel.
   */
  const panelClass = css({ fill: "currentColor", opacity: 0.28 });
  const bezelClass = css({ fill: "currentColor" });
  const standClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <rect class={panelClass} height="9.6" rx="1" width="14.6" x="4.7" y="5.2" />
  <path
    class={bezelClass}
    d="M6.6 3.2h10.8a3.4 3.4 0 0 1 3.4 3.4v6.9a3.4 3.4 0 0 1-3.4 3.4H6.6a3.4 3.4 0 0 1-3.4-3.4V6.6a3.4 3.4 0 0 1 3.4-3.4ZM5.2 6.6v6.9c0 0.77 0.63 1.4 1.4 1.4h10.8c0.77 0 1.4-0.63 1.4-1.4V6.6c0-0.77-0.63-1.4-1.4-1.4H6.6c-0.77 0-1.4 0.63-1.4 1.4Z"
    fill-rule="evenodd"
  />
  <path class={standClass} d="M10.7 16.9h2.6l1 3.1h-4.6Z" />
  <rect class={standClass} height="1.6" rx="0.8" width="8" x="8" y="19.6" />
</Icon>
