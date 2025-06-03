<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import Trash from '$lib/icon/Trash.svelte'
  import type { LineItem } from '../../../global'

  type Props = {
    lineItem: LineItem
  }
  let { lineItem }: Props = $props()
</script>

<div class="invoice-line-item border-fog border-b-2 pb-2">
  <div>
    <input class="line-item" type="text" name="description" />
  </div>

  <div>
    <input class="line-item text-right" type="number" name="unitPrice" step="0.01" min="0" />
  </div>
  <div>
    <input class="line-item text-center" type="number" name="quantity" min="0" />
  </div>
  <div>
    <input class="line-item text-right" type="number" name="amount" step="0.01" min="0" />
  </div>
  <div class="place-self-center">
    <Button variant="ghost" class="h-10 w-full text-center"><Trash /></Button>
  </div>
</div>

<style>
  @reference "../../../app.css";
  input[type='text'],
  input[type='number'] {
    @apply h-10 w-full border-b-2 border-dashed border-stone-300;
  }
  input[type='text'] {
    @apply font-sansserif h-10 text-xl font-bold;
  }

  input[type='number'] {
    @apply font-mono text-base;
  }

  input[type='text']:focus,
  input[type='number']:focus {
    @apply border-lavenderIndigo border-solid outline-none;
  }
</style>
