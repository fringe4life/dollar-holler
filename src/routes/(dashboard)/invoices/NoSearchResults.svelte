<script lang="ts">
  import BlankRow from '$lib/components/BlankRow.svelte'

  import InvoiceRowHeader from './InvoiceRowHeader.svelte'
</script>

<div class="mt-20 lg:-mt-14">
  <div class="mb-10 ml-2 bg-[url('/images/arrow-right-up.svg')] bg-no-repeat pt-14 pl-28">
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
