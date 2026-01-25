<script lang="ts">
  import Icon, { type IconProps } from "$lib/components/Icon.svelte"

  let { width, height }: IconProps = $props()
</script>

<Icon {width} {height}>
  <path
    d="M9.80022 23.4013L0 13.6011L4.2832 9.31542L9.02697 14.0568L19.0672 0L24 3.52207L9.80022 23.4013Z"
  />
</Icon>
