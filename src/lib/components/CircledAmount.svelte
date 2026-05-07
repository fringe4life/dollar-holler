<script lang="ts">
  import { css } from "styled-system/css";
  import { flex } from "styled-system/patterns";
  import { asset } from "$app/paths";

  interface Props {
    amount: string;
    label: string;
  }
  let { label, amount }: Props = $props();
</script>

<div
  style:--circle={`url(${asset('/images/circle.svg')})`}
  class={flex({ 
    align: "center", justify: "center", columnGap: 4, float: "right",
    backgroundImage: "var(--circle)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    textAlign: "center",
    minBlockSize: 24,
    minInlineSize: 64,
    _after: { clear: "right", content: '""' }, })}
>
  <div class={css({ fontWeight: "bold" })}>{label}</div>
  <div class={css({ fontSize: "xl" })}>{amount}</div>
</div>
