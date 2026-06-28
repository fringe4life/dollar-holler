<script lang="ts">
  import { css } from "styled-system/css";
  import { center } from "styled-system/patterns";
  import { asset } from "$app/paths";

  interface Props {
    amount: string;
    label: string;
  }
  let { label, amount }: Props = $props();
</script>

<div
  class={center({
    columnGap: 4,
    float: "right",
    backgroundImage: "var(--circle)",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    textAlign: "center",
    minBlockSize: 24,
    minInlineSize: 64,
    _after: { clear: "right", content: '""' }, })}
  style:--circle={`url(${asset('/images/circle.svg')})`}
>
  <div class={css({ fontWeight: "bold" })}>{label}</div>
  <div class={css({ fontSize: "xl" })}>{amount}</div>
</div>
