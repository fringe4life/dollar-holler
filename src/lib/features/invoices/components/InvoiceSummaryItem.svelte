<script lang="ts">
  import { css } from "styled-system/css";

  let { title, amount }: { title: string; amount: string } = $props();
</script>

<div class={css({ textAlign: "center" })}>
  <div
    class={css({ color: "lightGray", fontSize: "sm", fontWeight: "semibold" })}
  >
    {title}
  </div>
  <div
    class={css({ color: "purple", fontSize: "3xl", fontWeight: "bold", truncate:true })}
  >
    {amount}
  </div>
</div>
