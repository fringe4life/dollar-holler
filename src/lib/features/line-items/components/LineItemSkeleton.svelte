<script lang="ts">
  import { css } from "styled-system/css";
  import { between } from "styled-system/patterns";
</script>

<div class={css({ spaceY: 4 })}>
  <div class={between({ borderBottomWidth: 2, paddingBlockEnd: 2 })}>
    <div
      class={css({ animation: "pulse", rounded: "md", bg: "gray.200", blockSize: 4, inlineSize: 24 })}
    ></div>
    <div
      class={css({ animation: "pulse", rounded: "md", bg: "gray.200", blockSize: 4, inlineSize: 16 })}
    ></div>
    <div
      class={css({ animation: "pulse", rounded: "md", bg: "gray.200", blockSize: 4, inlineSize: 12 })}
    ></div>
    <div
      class={css({ animation: "pulse", rounded: "md", bg: "gray.200", blockSize: 4, inlineSize: 16 })}
    ></div>
  </div>
  <div
    class={css({ animation: "pulse", rounded: "md", bg: "gray.100", blockSize: 10, inlineSize: "full" })}
  ></div>
  <div
    class={css({ animation: "pulse", rounded: "md", bg: "gray.100", blockSize: 10, inlineSize: "full" })}
  ></div>
</div>
