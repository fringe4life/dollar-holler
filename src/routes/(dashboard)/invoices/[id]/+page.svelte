<script lang="ts">
  import { toast } from "svelte-sonner";
  import { asset, resolve } from "$app/paths";
  import { page } from "$app/state";
  import LineItemRows from "$features/line-items/components/LineItemRows.svelte";
  import HtmlContent from "$lib/components/HtmlContent.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton } from "$lib/types";
  import { convertDate } from "$lib/utils/dateHelpers";
  import { tryCatch } from "$lib/utils/try-catch";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const { settings: settingsStore } = getDashboardStores();

  const invoice = $derived(data.invoice);
  const lineItems = $derived(data.lineItems ?? []);
  const settingsLink = $derived(resolve("/settings"));

  const printInvoice: BitsButton = () => {
    window.print();
  };

  const copyLink: BitsButton = async () => {
    const { error } = await tryCatch(() =>
      window.navigator.clipboard.writeText(page.url.href)
    );
    if (error) {
      toast.error("Failed to copy link");
      return;
    }
    toast.success("Success!", {
      description: `${page.url.href}`,
    });
  };

  const payInvoice: BitsButton = () => {
    console.log("PAY INVOICE");
  };

  const sendInvoice: BitsButton = () => {
    console.log("SEND INVOICE");
  };
</script>

<div
  class=" fixed z-0 mbe-16 grid grid-flow-row justify-between gap-y-5 px-4 inline-full max-inline-5xl md:grid-flow-col lg:px-0 print:hidden"
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
  class="not-print:shadow-addInvoice relative inset-bs-36 z-10 grid grid-cols-6 gap-x-5 gap-y-8 bg-white px-5 py-8 md:px-32 md:py-16 print:inset-bs-0"
>
  <div class="col-span-full sm:col-span-3 print:col-span-3">
    <img
      src={asset("/images/logo.png")}
      srcset={`${asset("/images/logo@2x.png")} 2x, ${asset("/images/logo.png")} 1x`}
      alt="Compressed fm"
    >
  </div>

  <div
    class="col-span-full pbs-4 sm:col-span-2 sm:col-start-5 print:col-span-3"
  >
    <div class="label">From</div>
    {#if settingsStore.settings?.myName}
      <p>
        {#if settingsStore.settings.myName}
          {settingsStore.settings.myName}<br>
        {/if}
        {#if settingsStore.settings.city && settingsStore.settings.street && settingsStore.settings.state && settingsStore.settings.zip}
          {settingsStore.settings.street}<br>
          {settingsStore.settings.city}
          {settingsStore.settings.state}
          {settingsStore.settings.zip}
        {/if}
      </p>
    {:else}
      <div
        class="bg-gallery flex items-center justify-center rounded min-block-17"
      >
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a
          href={settingsLink}
          class="text-stone-600 underline hover:no-underline"
          >Add your contact information.</a
        >
      </div>
    {/if}
  </div>
  <div class="col-span-full sm:col-span-3 print:col-span-3">
    <div class="label">Bill To:</div>
    <p>
      {#if data.client}
        {#if data.client.name}
          <strong>{data.client.name}</strong><br>
        {/if}
        {#if data.client.email}
          {data.client.email}<br>
        {/if}
        {#if data.client.street}
          {data.client.street}<br>
        {/if}
        {#if data.client.state}
          {data.client.state}
        {/if}
        {#if data.client.zip}
          {data.client.zip}
        {/if}
      {:else}
        No client found
      {/if}
    </p>
  </div>
  <div class="col-span-full sm:col-span-2 sm:col-start-5">
    <div class="label">Invoice Id:</div>
    <p>{invoice.invoiceNumber}</p>
  </div>
  <div class="col-span-3">
    <div class="label">Due Date:</div>
    <p>
      {convertDate(invoice.dueDate === null ? null : String(invoice.dueDate))}
    </p>
  </div>

  <div class="col-span-3 sm:col-span-2 sm:col-start-5">
    <div class="label">Issue Date:</div>
    <p>
      {convertDate(
        invoice.issueDate === null ? null : String(invoice.issueDate),
      )}
    </p>
  </div>

  <div class="col-span-full">
    <div class="label">Subject:</div>
    <p>{invoice.subject}</p>
  </div>

  <!-- line items div wrapper -->
  <div class="col-span-full">
    <LineItemRows mode="view" {lineItems} discount={invoice.discount || 0} />
  </div>

  {#if data.notesHtml}
    <div class="col-span-full">
      <div class="label">Notes:</div>
      <HtmlContent html={data.notesHtml} />
    </div>
  {/if}
  {#if data.termsHtml}
    <div class="col-span-full">
      <div class="label">Terms and Conditions:</div>
      <HtmlContent html={data.termsHtml} />
    </div>
  {/if}
</section>

<style>
  @reference "#app.css";
  .label {
    @apply text-monsoon font-black;
  }
</style>
