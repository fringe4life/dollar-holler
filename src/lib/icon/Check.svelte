<script lang="ts">
  type Props = {
    width?: number
    height?: number
  }
  let { width = 24, height = 24 }: Props = $props()
</script>

<svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M9.80022 23.4013L0 13.6011L4.2832 9.31542L9.02697 14.0568L19.0672 0L24 3.52207L9.80022 23.4013Z"
  />
</svg>
