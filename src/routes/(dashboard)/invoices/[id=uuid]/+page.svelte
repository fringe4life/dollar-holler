<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import {
    center,
    grid,
    gridItem,
    wrap,
  } from "#styled-system/patterns/index.js";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import {
    getInvoiceDetail,
    updateInvoiceStatus,
  } from "#features/invoices/invoices.remote.ts";
  import LineItemRows from "#features/line-items/components/LineItemRows.svelte";
  import { getSettings } from "#features/settings/settings.remote.ts";
  import BoundaryError from "#lib/components/BoundaryError.svelte";
  import HtmlContent from "#lib/components/HtmlContent.svelte";
  import Spinner from "#lib/components/Spinner.svelte";
  import Button from "#lib/components/ui/button/button.svelte";
  import type {
    BitsButton,
    CursorId,
    Maybe,
    SanitizedHTML,
  } from "#lib/types.ts";
  import { convertDate } from "#lib/utils/dateHelpers.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { toast } from "#lib/utils/toast.svelte.ts";
  import { tryCatch } from "#lib/utils/try-catch.ts";

  const invoiceId = $derived(page.params.id as CursorId);
  const [detail, settings] = $derived(
    await Promise.all([getInvoiceDetail(invoiceId), getSettings()])
  );

  const invoice = $derived(detail.invoice);
  const lineItems = $derived(detail.lineItems ?? []);
  const client = $derived(detail.client);
  const settingsLink = $derived(resolve("settings"));

  const canSendInvoice = $derived(invoice.invoiceStatus === "draft");
  const canPayInvoice = $derived(invoice.invoiceStatus === "sent");
  const hasFromName = $derived(Boolean(settings?.myName));
  const hasFullFromAddress = $derived(
    Boolean(
      settings?.city && settings?.street && settings?.state && settings?.zip
    )
  );

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
      await updateInvoiceStatus({
        id: invoice.id,
        invoiceStatus: "paid",
      });
      await goto(resolve("invoices/thanks"));
    } catch (err) {
      toast.error(getErrorMessage(err, fb));
    }
  };

  const sendInvoice: BitsButton = async () => {
    const fb = "Failed to send invoice";
    try {
      await updateInvoiceStatus({
        id: invoice.id,
        invoiceStatus: "sent",
      }).updates(getInvoiceDetail(invoiceId));
      toast.success("Invoice sent");
    } catch (err) {
      toast.error(getErrorMessage(err, fb));
    }
  };
</script>

<svelte:head>
  <title>Invoice {invoice.invoiceNumber} | Dollar Holler</title>
  <meta
    content={client
      ? `View invoice ${invoice.invoiceNumber} for ${client.name} and record payment in Dollar Holler.`
      : `View invoice ${invoice.invoiceNumber} and record payment in Dollar Holler.`}
    name="description"
  />
</svelte:head>

{#snippet statusActions()}
  {#if canPayInvoice}
    <Button onclick={payInvoice} size="short">Pay Invoice</Button>
  {/if}
  {#if canSendInvoice}
    <Button onclick={sendInvoice} size="short">Send Invoice</Button>
  {/if}
{/snippet}

{#snippet fromAddress()}
  <div
    class={gridItem({
      colSpan: { base: 6, sm: 2, _print: 3 },
      gridColumnStart: { sm: 5 },
      paddingBlockStart: 4,
    })}
  >
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>From</div>
    {#if hasFromName}
      <p>
        {settings?.myName}<br />
        {#if hasFullFromAddress}
          {settings?.street}<br />
          {settings?.city}
          {settings?.state}
          {settings?.zip}
        {/if}
      </p>
    {:else}
      <div
        class={center({
          backgroundColor: "gallery",
          borderRadius: "md",
          minBlockSize: 17,
        })}
      >
        <a
          class={css({
            color: "stone.600",
            textDecoration: { base: "underline", _hover: "none" },
          })}
          href={settingsLink}>Add your contact information.</a
        >
      </div>
    {/if}
  </div>
{/snippet}

{#snippet billTo()}
  <div class={gridItem({ colSpan: { base: 6, sm: 3, _print: 3 } })}>
    <div class={css({ color: "monsoon", fontWeight: "bold" })}>Bill To:</div>
    <p>
      {#if client}
        {#if client.name}
          <strong>{client.name}</strong><br />
        {/if}
        {#if client.email}
          {client.email}<br />
        {/if}
        {#if client.street}
          {client.street}<br />
        {/if}
        {#if client.state}
          {client.state}
        {/if}
        {#if client.zip}
          {client.zip}
        {/if}
      {:else}
        No client found
      {/if}
    </p>
  </div>
{/snippet}

{#snippet htmlBlock(title: string, html: Maybe<SanitizedHTML>)}
  {#if html}
    <div class={gridItem({ colSpan: 6 })}>
      <div class={css({ color: "monsoon", fontWeight: "bold" })}>{title}</div>
      <HtmlContent {html} />
    </div>
  {/if}
{/snippet}

<svelte:boundary>
  {#snippet pending()}
    <Spinner label="Loading invoice" size="lg" />
  {/snippet}
  {#snippet failed(err, reset)}
    <BoundaryError
      error={err}
      fallbackMessage="Failed to load invoice"
      onRetry={reset}
      title="We couldn't load this invoice"
    />
  {/snippet}

  <div
    class={grid({
      gridAutoFlow: { base: "row", md: "column" },
      justifyContent: "space-between",
      rowGap: 5,
      inlineSize: "full",
      maxInlineSize: "5xl",
      paddingInline: { base: 4, lg: 0 },
      position: "fixed",
      zIndex: 0,
      marginBlockEnd: 16,
      _print: { display: "none" },
    })}
  >
    <h1
      class={gridItem({
        color: "daisyBush",
        fontSize: "3xl",
        fontWeight: "bold",
      })}
    >
      Invoice
    </h1>
    <div
      class={wrap({
        align: "center",
        gap: 2,
      })}
    >
      <Button onclick={printInvoice} size="short" variant="outline"
        >Print</Button
      >
      <Button onclick={copyLink} size="short">Copy Link</Button>
      {@render statusActions()}
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
      <enhanced:img
        alt="Compressed fm"
        class={css({ inlineSize: "316px", blockSize: "134px" })}
        src="#lib/assets/logo.png"
      />
    </div>

    {@render fromAddress()}
    {@render billTo()}
    <div
      class={gridItem({
        colSpan: { base: 6, sm: 2, _print: 3 },
        gridColumnStart: { sm: 5 },
      })}
    >
      <div class={css({ color: "monsoon", fontWeight: "bold" })}>
        Invoice Id:
      </div>
      <p>{invoice.invoiceNumber}</p>
    </div>
    <div class={gridItem({ colSpan: 3 })}>
      <div class={css({ color: "monsoon", fontWeight: "bold" })}>Due Date:</div>
      <p>
        {convertDate(invoice.dueDate === null ? null : String(invoice.dueDate))}
      </p>
    </div>

    <div
      class={gridItem({
        colSpan: { base: 3, sm: 2, _print: 3 },
        gridColumnStart: { sm: 5 },
      })}
    >
      <div class={css({ color: "monsoon", fontWeight: "bold" })}>
        Issue Date:
      </div>
      <p>
        {convertDate(
          invoice.issueDate === null ? null : String(invoice.issueDate)
        )}
      </p>
    </div>

    <div class={gridItem({ colSpan: 6 })}>
      <div class={css({ color: "monsoon", fontWeight: "bold" })}>Subject:</div>
      <p>{invoice.subject}</p>
    </div>

    <div class={gridItem({ colSpan: 6 })}>
      <LineItemRows discount={invoice.discount || 0} {lineItems} mode="view" />
    </div>

    {@render htmlBlock("Notes:", invoice.notesHtml)}
    {@render htmlBlock("Terms and Conditions:", invoice.termsHtml)}
  </section>
</svelte:boundary>
