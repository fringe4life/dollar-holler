<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { gridItem } from "styled-system/patterns";
  import type { MouseEventHandler } from "svelte/elements";
  import { resolve } from "$app/paths";
  import { getLabel } from "$features/invoices/utils/labelHelpers";
  import AdditionalOptions from "$lib/components/additionaloptions/AdditionalOptions.svelte";
  import AdditionalOptionsButton from "$lib/components/additionaloptions/AdditionalOptionsButton.svelte";
  import type { Option } from "$lib/components/additionaloptions/AdditionalOptionsItem.svelte";
  import AdditionalOptionsList from "$lib/components/additionaloptions/AdditionalOptionsList.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import Send from "$lib/components/icons/Send.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import View from "$lib/components/icons/View.svelte";
  import Swipeable from "$lib/components/Swipeable.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import {
    actionButton,
    invoiceRow,
    invoiceTable,
    tableRowBase,
    tableRowHover,
  } from "$lib/styles";
  import { convertDate } from "$lib/utils/dateHelpers";
  import { formatTotal } from "$lib/utils/moneyHelpers";
  import type { InvoiceListResponse } from "../types";

  interface Props {
    invoice: InvoiceListResponse;
    onDelete: (invoice: InvoiceListResponse) => void;
    onEdit: (invoice: InvoiceListResponse) => void;
    onSendInvoice: (invoice: InvoiceListResponse) => void;
  }

  let { invoice, onEdit, onDelete, onSendInvoice }: Props = $props();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () =>
    onDelete(invoice);

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () =>
    onEdit(invoice);

  const handleSendInvoice: MouseEventHandler<HTMLButtonElement> = () =>
    onSendInvoice(invoice);

  const id = $derived(invoice.id);
  const dueDate = $derived(invoice.dueDate);
  const invoiceNumber = $derived(invoice.invoiceNumber);
  const client = $derived(invoice.name);
  const total = $derived(invoice.total);
  const totalDisplay = $derived(formatTotal(total));
  const invoiceStatus = $derived(invoice.invoiceStatus);

  const label = $derived(getLabel(invoiceStatus, dueDate.toISOString()));
  const isOptionsDisabled = $derived(label !== "draft");
  const resolved = $derived(resolve(`/invoices/${id}`));

  const INVOICE_OPTIONS = $derived([
    {
      label: "Edit",
      icon: Edit,
      onclick: handleEdit,
      disabled: isOptionsDisabled,
    },

    {
      label: "Delete",
      icon: Trash,
      onclick: handleDelete,
      disabled: false,
    },

    {
      label: "Send",
      icon: Send,
      onclick: handleSendInvoice,
      disabled: isOptionsDisabled,
    },
  ] satisfies Option[]);
</script>

<!-- "group/row invoice-table invoice-row table-row-hover shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6" -->
<Swipeable
  contentClass={cx(
    "group",
    invoiceTable,
    invoiceRow,
    tableRowHover,
    tableRowBase,
  )}
  contentViewTransitionName={`invoice-${id}`}
>
  {#snippet content()}
    <div class={gridItem({ justifySelf: "end", gridArea: "status" })}>
      <Badge
        class={css({ marginInlineStart: { base: "auto", md: 0 } })}
        variant={label}
        size="small"
        >{label}</Badge
      >
    </div>
    <div
      class={gridItem({
        gridArea: "duedate",
        truncate: true,
        fontSize: { base: "sm", lg: "lg" },
      })}
    >
      {convertDate(dueDate.toISOString())}
    </div>
    <div
      class={gridItem({
        gridArea: "invoicenumber",
        truncate: true,
        fontSize: { base: "sm", lg: "lg" },
      })}
    >
      {invoiceNumber}
    </div>
    <div
      class={gridItem({
        gridArea: "clientName",
        truncate: true,
        fontSize: { lg: "xl" },
        fontWeight: "bold",
      })}
    >
      {client}
    </div>
    <div
      class={gridItem({
        gridArea: "amount",
        justifySelf: "end",
        fontSize: { base: "sm", lg: "lg" },
        fontWeight: "bold",
      })}
    >
      {totalDisplay}
    </div>
    <div
      class={gridItem({
          gridArea: "view",
          display: { base: "none", lg: "block" },
          placeSelf: { md: "center" },
          fontSize: { base: "sm", lg: "lg" },
          transitionProperty: "colors",
          transitionDuration: "normal",
          color: {
            base: "pastelPurple",
            _hover: "daisyBush",
            _groupHover: "daisyBush/50",
          },
        })}
    >
      <a href={resolved}><View /></a>
    </div>
    <AdditionalOptions classes={gridItem({ gridArea: "threeDots" })}>
      {#snippet content(additionalMenu)}
        <AdditionalOptionsButton {additionalMenu} />
        <AdditionalOptionsList {additionalMenu} options={INVOICE_OPTIONS} />
      {/snippet}
    </AdditionalOptions>
  {/snippet}
  {#snippet revealed()}
    {#if !isOptionsDisabled}
      <button onclick={handleEdit} type="button" class={actionButton}>
        <Edit width={32} height={32} />
        Edit
      </button>
      <button onclick={handleSendInvoice} type="button" class={actionButton}>
        <Send width={32} height={32} />
        Send
      </button>
    {/if}
    <button onclick={handleDelete} type="button" class={actionButton}>
      <Trash width={32} height={32} />
      Delete
    </button>
    <a class={actionButton} href={resolved}><View height={32} width={32} /></a>
  {/snippet}
</Swipeable>
