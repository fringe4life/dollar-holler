<script lang="ts">
  import Icon, { type IconProps } from "$lib/components/Icon.svelte";

  let props: IconProps = $props();
</script>

<Icon {...props}>
  <path
    d="M2.01 21.0002L23 12.0002L2.01 3.00024L2 10.0002L17 12.0002L2 14.0002L2.01 21.0002Z"
  />
</Icon>
