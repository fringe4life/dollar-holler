<script lang="ts">
  import { css } from "#styled-system/css/index.js";

  let { title, amount }: { title: string; amount: string } = $props();
</script>

<dl class={css({ textAlign: "center" })}>
  <dt
    class={css({
      color: "metricLabel",
      fontSize: "sm",
      fontWeight: "semibold",
    })}
  >
    {title}
  </dt>
  <dd
    class={css({
      color: "metric",
      fontSize: "3xl",
      fontWeight: "bold",
      truncate: true,
    })}
  >
    {amount}
  </dd>
</dl>
