<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /* A solid crescent: the thick limb carries the silhouette at 16px. */
  const moonClass = css({ fill: "currentColor" });
</script>

<script lang="ts">
  import Icon, { type IconProps } from "#lib/components/primitives/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <path
    class={moonClass}
    d="M20.9 14.4A9 9 0 1 1 10 3.1a7.2 7.2 0 0 0 10.9 11.3Z"
  />
</Icon>
