<script lang="ts">
  import { page } from '$app/state'
  import { asset } from '$app/paths'
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import { settingsStore } from '$lib/stores/settingsStore.svelte'
  import { convertDate } from '$lib/utils/dateHelpers'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import type { MouseEventHandler } from 'svelte/elements'
  import LineItemRows from '../LineItemRows.svelte'
  import type { PageProps } from './$types'
  let { data }: PageProps = $props()

  const invoice = $state(data.invoice)

  onMount(() => {
    settingsStore.loadSettings()
  })

  const printInvoice: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = () => {
    window.print()
  }

  const copyLink: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = async () => {
    await window.navigator.clipboard.writeText(page.url.href)
    toast.success('Success!', {
      description: `${page.url.href}`,
    })
  }

  const payInvoice: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = () => {
    console.log('PAY INVOICE')
  }

  const sendInvoice: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = () => {
    console.log('SEND INVOICE')
  }
</script>

<div
  class=" fixed z-0 mb-16 flex w-full max-w-256 flex-col justify-between gap-y-5 px-4 md:flex-row lg:px-0 print:hidden"
>
  <h1 class="text-daisyBush text-3xl font-bold">Invoice</h1>
  <div class="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
    <Button size="short" onclick={printInvoice} variant="outline">Print</Button>
    <Button size="short" onclick={copyLink}>Copy Link</Button>
    <Button size="short" onclick={payInvoice}>Pay Invoice</Button>
    <Button size="short" onclick={sendInvoice}>Send Invoice</Button>
  </div>
</div>
<section
  class="not-print:shadow-addInvoice relative top-36 z-10 grid grid-cols-6 gap-x-5 gap-y-8 bg-white px-5 py-8 md:px-32 md:py-16 print:top-0"
>
  <div class="col-span-full sm:col-span-3 print:col-span-3">
    <img
      src={asset('/images/logo.png')}
      srcset={`${asset('/images/logo@2x.png')} 2x, ${asset('/images/logo.png')} 1x`}
      alt="Compressed fm"
    />
  </div>

  <div class="col-span-full pt-4 sm:col-span-2 sm:col-start-5 print:col-span-3">
    <div class="label">From</div>
    {#if settingsStore.settings && settingsStore.settings.myName}
      <p>
        {#if settingsStore.settings.myName}
          {settingsStore.settings.myName}<br />
        {/if}
        {#if settingsStore.settings.city && settingsStore.settings.street && settingsStore.settings.state && settingsStore.settings.zip}
          {settingsStore.settings.street}<br />
          {settingsStore.settings.city} {settingsStore.settings.state} {settingsStore.settings.zip}
        {/if}
      </p>
    {:else}
      <div class="bg-gallery flex min-h-17 items-center justify-center rounded">
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a href="#" class="text-stone-600 underline hover:no-underline"
          >Add your contact information.</a
        >
      </div>
    {/if}
  </div>
  <div class="col-span-full sm:col-span-3 print:col-span-3">
    <div class="label">Bill To:</div>
    <p>
      {#if invoice.client.name}<strong>{invoice.client.name}</strong><br />{/if}
      {#if invoice.client.name}{invoice.client.email}<br />{/if}
      {#if invoice.client.street}{invoice.client.street}<br />{/if}
      {#if invoice.client.state}{invoice.client.state}{/if}
      {#if invoice.client.zip}{invoice.client.zip}{/if}
    </p>
  </div>
  <div class="col-span-full sm:col-span-2 sm:col-start-5">
    <div class="label">Invoice Id:</div>
    <p>{invoice?.invoiceNumber}</p>
  </div>
  <div class="col-span-3">
    <div class="label">Due Date:</div>
    <p>{convertDate(invoice?.dueDate)}</p>
  </div>

  <div class="col-span-3 sm:col-span-2 sm:col-start-5">
    <div class="label">Issue Date:</div>
    <p>{convertDate(invoice?.issueDate)}</p>
  </div>

  <div class="col-span-full">
    <div class="label">Subject:</div>
    <p>{invoice?.subject}</p>
  </div>

  <!-- line items div wrapper -->
  <div class="col-span-full">
    <LineItemRows
      lineItems={invoice?.lineItems}
      isEditible={false}
      addLineItem={() => {}}
      removeLineItem={() => {}}
      discount={invoice?.discount || 0}
    />
  </div>

  {#if invoice?.notes}
    <div class="col-span-full">
      <div class="label">Notes:</div>
      <MarkdownRenderer source={invoice.notes} />
    </div>
  {/if}
  {#if invoice?.terms}
    <div class="col-span-full">
      <div class="label">Terms and Conditions:</div>

      <MarkdownRenderer source={invoice?.terms} />
    </div>
  {/if}
</section>

<style>
  @reference "../../../../app.css";
  .label {
    @apply text-monsoon font-black;
  }
</style>
