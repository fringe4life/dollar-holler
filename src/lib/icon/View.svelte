<script lang="ts">
  type Props = {
    width?: number
    height?: number
  }
  let { width = 24, height = 24 }: Props = $props()
</script>

<svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M24 11.5C24 11.5 18.9285 4 12 4C5.0715 4 0 11.5 0 11.5C0 11.5 5.0715 19 12 19C18.9285 19 24 11.5 24 11.5ZM12 16C9.5145 16 7.5 13.987 7.5 11.5C7.5 9.013 9.5145 7 12 7C14.484 7 16.5 9.013 16.5 11.5C16.5 13.987 14.484 16 12 16Z"
  />
  <path
    d="M12 13C12.8284 13 13.5 12.3284 13.5 11.5C13.5 10.6716 12.8284 10 12 10C11.1716 10 10.5 10.6716 10.5 11.5C10.5 12.3284 11.1716 13 12 13Z"
  />
</svg>
