<script lang="ts">
  type Props = {
    width?: number
    height?: number
  }
  let { width = 24, height = 24 }: Props = $props()
</script>

<svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.01 21.0002L23 12.0002L2.01 3.00024L2 10.0002L17 12.0002L2 14.0002L2.01 21.0002Z" />
</svg>
