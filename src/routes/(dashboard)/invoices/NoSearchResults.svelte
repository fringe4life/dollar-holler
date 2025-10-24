<script lang="ts">
  import { asset } from '$app/paths'
  import BlankRow from '$lib/components/BlankRow.svelte'

  import InvoiceRowHeader from './InvoiceRowHeader.svelte'
</script>

<div class="mt-20 lg:-mt-14">
  <div class="mb-10 ml-2 bg-no-repeat pt-14 pl-28" style="background-image: url('{asset('/images/arrow-right-up.svg')}')">
    <h2 class="font-handwriting text-caribbeanGreen text-4xl font-bold">Bummer</h2>
    <p class="text-caribbeanGreen text-xl font-bold">
      We didn't find anything that you were looking for.
    </p>
  </div>
  <InvoiceRowHeader emptyState={true} />
  <BlankRow />
  <BlankRow />
  <BlankRow />
</div>
