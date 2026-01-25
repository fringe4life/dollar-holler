<script lang="ts">
  import Icon, { type IconProps } from "$lib/components/Icon.svelte"

  let { width, height }: IconProps = $props()
</script>

<Icon {width} {height}>
  <path d="M2.01 21.0002L23 12.0002L2.01 3.00024L2 10.0002L17 12.0002L2 14.0002L2.01 21.0002Z" />
</Icon>
