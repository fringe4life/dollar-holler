<script lang="ts">
  import Icon, { type IconProps } from "$lib/components/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <circle cx="5" cy="12" r="2" />
  <circle cx="12" cy="12" r="2" />
  <circle cx="19" cy="12" r="2" />
</Icon>
