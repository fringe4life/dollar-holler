<script lang="ts">
  import { css } from "styled-system/css";
  import { center, flex, grid, gridItem } from "styled-system/patterns";
  import { goto, invalidateAll } from "$app/navigation";
  import { asset, resolve } from "$app/paths";
  import { page } from "$app/state";
  import LineItemRows from "$features/line-items/components/LineItemRows.svelte";
  import { apiClient } from "$lib/api";
  import HtmlContent from "$lib/components/HtmlContent.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton } from "$lib/types";
  import { convertDate } from "$lib/utils/dateHelpers";
  import { getErrorMessage } from "$lib/utils/error-message";
  import { toast } from "$lib/utils/toast.svelte";
  import { tryCatch } from "$lib/utils/try-catch";
  import { unwrapTreaty } from "$lib/utils/unwrap";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const { settings: settingsStore } = getDashboardStores();

  const invoice = $derived(data.invoice);
  const lineItems = $derived(data.lineItems ?? []);
  const settingsLink = $derived(resolve("/settings"));

  const canSendInvoice = $derived(invoice.invoiceStatus === "draft");
  const canPayInvoice = $derived(invoice.invoiceStatus === "sent");

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

  const payInvoice: BitsButton = async () => {
    const fb = "Failed to record payment";
    try {
      await unwrapTreaty(
        apiClient.invoices({ id: invoice.id }).patch({ invoiceStatus: "paid" }),
        { fallbackMessage: fb }
      );
      await goto(resolve("/invoices/thanks"));
    } catch (err) {
      toast.error(getErrorMessage(err, fb));
    }
  };

  const sendInvoice: BitsButton = async () => {
    const fb = "Failed to send invoice";
    try {
      await unwrapTreaty(
        apiClient.invoices({ id: invoice.id }).patch({ invoiceStatus: "sent" }),
        { fallbackMessage: fb }
      );
      await invalidateAll();
      toast.success("Invoice sent");
    } catch (err) {
      toast.error(getErrorMessage(err, fb));
    }
  };
</script>

<div
  class={grid({
      gridAutoFlow: { base: "row", md: "column" },
      justifyContent: "space-between",
      rowGap: 5,
      inlineSize: "full",
      maxInlineSize: "5xl" ,
      paddingInline: { base: 4, lg: 0 },
      position: "fixed",
      zIndex: 0,
      marginBlockEnd: 16,
      _print: { display: "none" }
    })}
>
  <h1
    class={gridItem({ color: "daisyBush", fontSize: "3xl", fontWeight: "bold" })}
  >
    Invoice
  </h1>
  <div
    class={flex({ align: "center", gap: 2, wrap: { base: "wrap", sm: "nowrap" } })}
  >
    <Button size="short" onclick={printInvoice} variant="outline">Print</Button>
    <Button size="short" onclick={copyLink}>Copy Link</Button>
    {#if canPayInvoice}
      <Button size="short" onclick={payInvoice}>Pay Invoice</Button>
    {/if}
    {#if canSendInvoice}
      <Button size="short" onclick={sendInvoice}>Send Invoice</Button>
    {/if}
  </div>
</div>

<section
  class={grid({
      columns: 6,
      columnGap: 5,
      rowGap: 8,
      paddingInline: { base: 5, md: 32 },
      paddingBlock: { base: 8, md: 16 },
      position: "relative",
      insetBlockStart: { base: 36, _print: 0 },
      zIndex: 10,
      shadow: { base: "addInvoice", _print: "none" },
      backgroundColor: "white",
    })}
>
  <div class={gridItem({ colSpan: { base: 6, sm: 3, _print: 3 } })}>
    <img
      src={asset('/images/logo.png')}
      srcset={`${asset('/images/logo@2x.png')} 2x, ${asset('/images/logo.png')} 1x`}
      alt="Compressed fm"
    >
  </div>

  <div
    class={gridItem({gridColumnStart: { sm: 5 },  colSpan: { base: 6, sm: 2, _print: 3 }, paddingBlockStart: 4 })}
  >
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>From</div>
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
        class={center({ backgroundColor: "gallery", borderRadius: "md", minBlockSize: 17 })}
      >
        <a
          href={settingsLink}
          class={css({ color: "stone.600", textDecoration: { base:"underline", _hover: "none"} })}
          >Add your contact information.</a
        >
      </div>
    {/if}
  </div>
  <div class={gridItem({ colSpan: { base: 6, sm: 3, _print: 3} })}>
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>Bill To:</div>
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
  <div
    class={gridItem({ colSpan: { base: 6, sm: 2, _print: 3 }, gridColumnStart: { sm: 5 } })}
  >
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>Invoice Id:</div>
    <p>{invoice.invoiceNumber}</p>
  </div>
  <div class={gridItem({ colSpan: 3 })}>
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>Due Date:</div>
    <p>
      {convertDate(invoice.dueDate === null ? null : String(invoice.dueDate))}
    </p>
  </div>

  <div
    class={gridItem({ colSpan: { base: 3, sm: 2, _print: 3 }, gridColumnStart: { sm: 5 } })}
  >
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>Issue Date:</div>
    <p>
      {convertDate(
        invoice.issueDate === null ? null : String(invoice.issueDate),
      )}
    </p>
  </div>

  <div class={gridItem({ colSpan: 6 })}>
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>Subject:</div>
    <p>{invoice.subject}</p>
  </div>

  <!-- line items div wrapper -->
  <div class={gridItem({ colSpan: 6 })}>
    <LineItemRows mode="view" {lineItems} discount={invoice.discount || 0} />
  </div>

  {#if data.notesHtml}
    <div class={gridItem({ colSpan: 6 })}>
      <div class={css({ color: "monsoon", fontWeight: "bold" })}>Notes:</div>
      <HtmlContent html={data.notesHtml} />
    </div>
  {/if}
  {#if data.termsHtml}
    <div class={gridItem({ colSpan: 6 })}>
      <div class={css({ color: "monsoon", fontWeight: "bold" })}>
        Terms and Conditions:
      </div>
      <HtmlContent html={data.termsHtml} />
    </div>
  {/if}
</section>
