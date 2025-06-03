<script lang="ts">
  type Props = {
    width?: number
    height?: number
  }
  let { width = 24, height = 24 }: Props = $props()
</script>

<svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M10.5455 23L13.0909 20.4545L6.90909 14.6364L24 14.6364L24 11L6.90909 11L13.0909 5.18182L10.5455 2.27273L2.54545 10.2727L5.21658e-07 12.8182L10.5455 23Z"
  />
</svg>
