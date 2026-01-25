<script lang="ts">
  import Icon, { type IconProps } from "$lib/components/Icon.svelte"

  let { width, height }: IconProps = $props()
</script>

<Icon {width} {height}>
  <path
    d="M10.5455 23L13.0909 20.4545L6.90909 14.6364L24 14.6364L24 11L6.90909 11L13.0909 5.18182L10.5455 2.27273L2.54545 10.2727L5.21658e-07 12.8182L10.5455 23Z"
  />
</Icon>
