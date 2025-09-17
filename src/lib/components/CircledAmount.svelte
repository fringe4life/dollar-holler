<script lang="ts">
  import { asset } from '$app/paths'
  type Props = {
    label: string
    amount: string
  }
  let { label, amount }: Props = $props()
</script>

<div
  class="float-right flex min-h-24 min-w-64 items-center justify-center gap-x-4 bg-[url('{asset('/images/circle.svg')}')] bg-no-repeat text-center after:clear-right"
>
  <div class="font-bold">{label}</div>
  <div class="font-mono text-xl">{amount}</div>
</div>
