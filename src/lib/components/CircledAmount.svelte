<script lang="ts">
  import { asset } from "$app/paths";

  interface Props {
    amount: string;
    label: string;
  }
  let { label, amount }: Props = $props();
</script>

<div
  class="float-right flex items-center justify-center gap-x-4 bg-no-repeat text-center min-block-24 min-inline-64 after:clear-right"
  style="background-image: url('{asset('/images/circle.svg')}')"
>
  <div class="font-bold">{label}</div>
  <div class="font-mono text-xl">{amount}</div>
</div>
