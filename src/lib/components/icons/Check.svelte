<script lang="ts">
  import Icon, { type IconProps } from "$lib/components/Icon.svelte";

  let { width, height, ...rest }: IconProps = $props();
</script>

<Icon {width} {height} {...rest}>
  <path
    d="M9.80022 23.4013L0 13.6011L4.2832 9.31542L9.02697 14.0568L19.0672 0L24 3.52207L9.80022 23.4013Z"
  />
</Icon>
