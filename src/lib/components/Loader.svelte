<script lang="ts">
  import { circle } from "styled-system/patterns";
</script>

<div
  class={circle({
    animation: "spin",
    borderWidth: 2,
    borderColor: "currentColor",
    borderBottomColor: "transparent",
    size: 5
  })}
  aria-hidden="true"
></div>
