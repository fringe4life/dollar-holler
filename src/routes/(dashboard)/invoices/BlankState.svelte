<script>
  import BlankRow from '$lib/components/BlankRow.svelte'
  import InvoiceRowHeader from './InvoiceRowHeader.svelte'
</script>

<div>
  <div class="-mt-14">
    <h2
      class="font-handwriting text-caribbeanGreen mb-10 bg-[url('/images/arrow-left-up.svg')] bg-left bg-no-repeat pt-14 pl-28 text-2xl font-bold capitalize md:bg-[url('/images/arrow-right-up.svg')] md:bg-right md:pr-28 md:pl-10 md:text-right md:text-4xl"
    >
      Add Your First Invoice
    </h2>
  </div>

  <!-- invoice header -->
  <InvoiceRowHeader emptyState={true} />

  <!-- blank rows -->
  <BlankRow />
  <BlankRow />
  <BlankRow />
  <BlankRow />
</div>
