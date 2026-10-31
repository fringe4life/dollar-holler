<script lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import type { MouseEventHandler } from "svelte/elements";
  import { resolve } from "$app/paths";
  import { getLabel } from "#features/invoices/utils/labelHelpers.ts";
  import Swipeable from "#lib/components/patterns/swipeable/Swipeable.svelte";
  import Badge from "#lib/components/primitives/badge/badge.svelte";
  import Edit from "#lib/components/primitives/icons/Edit.svelte";
  import Send from "#lib/components/primitives/icons/Send.svelte";
  import Trash from "#lib/components/primitives/icons/Trash.svelte";
  import View from "#lib/components/primitives/icons/View.svelte";
  import {
    rowActionButton,
    rowActionDangerButton,
    rowSwipeTrigger,
    tableRowBase,
  } from "#lib/styles.ts";
  import { convertDate } from "#lib/utils/dateHelpers.ts";
  import { money } from "#lib/components/primitives/money/money.ts";
  import { formatTotal } from "#lib/utils/moneyHelpers.ts";
  import {
    invoiceAmount,
    invoiceClientName,
    invoiceDueDate,
    invoiceIdentity,
    invoiceNumber,
    invoiceRow,
    invoiceStateSignal,
    invoiceStatus,
    invoiceSwipeHint,
    invoiceTable,
  } from "../styles";
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
  const invoiceNumberDisplay = $derived(invoice.invoiceNumber);
  const totalDisplay = $derived(formatTotal(invoice.total));
  const label = $derived(
    getLabel(invoice.invoiceStatus, dueDate.toISOString())
  );
  const isDraft = $derived(label === "draft");
  const invoiceDetailPath = "/(dashboard)/invoices/[id=uuid]" as const;
  const invoiceStateClass = $derived(invoiceStateSignal({ state: label }));
</script>

<Swipeable
  contentClass={cx(invoiceTable, invoiceRow, invoiceStateClass, tableRowBase)}
  contentViewTransitionName={`invoice-${id}`}
>
  {#snippet content(showActions: () => void, isRevealed: boolean)}
    <div
      aria-label={`Invoice number ${invoiceNumberDisplay}`}
      class={invoiceIdentity}
      role="group"
    >
      <span class={invoiceNumber}>{invoiceNumberDisplay}</span>
    </div>
    <div class={invoiceClientName}>{invoice.name}</div>
    <div class={invoiceDueDate}>
      <span>Due date</span>
      <time datetime={dueDate.toISOString()}>
        {convertDate(dueDate.toISOString())}
      </time>
    </div>
    <div class={cx(invoiceAmount, money())}>{totalDisplay}</div>
    <div class={invoiceStatus}>
      <Badge size="small" variant={label}>{label}</Badge>
    </div>
    <div class={invoiceSwipeHint}>
      <button
        aria-controls={`invoice-${id}-actions`}
        aria-expanded={isRevealed}
        aria-label={`Show actions for invoice ${invoiceNumberDisplay}`}
        class={rowSwipeTrigger}
        onclick={showActions}
        type="button"
      >
        <span aria-hidden="true">←</span>
        Swipe
      </button>
      <span>{label} · View · Delete</span>
    </div>
  {/snippet}

  {#snippet actions()}
    {#if isDraft}
      <button
        aria-label={`Edit invoice ${invoiceNumberDisplay}`}
        class={rowActionButton}
        onclick={handleEdit}
        type="button"
      >
        <Edit height={16} width={16} />
        Edit
      </button>
      <button
        aria-label={`Send invoice ${invoiceNumberDisplay}`}
        class={rowActionButton}
        onclick={handleSendInvoice}
        type="button"
      >
        <Send height={16} width={16} />
        Send
      </button>
    {/if}
    <button
      aria-label={`Delete invoice ${invoiceNumberDisplay}`}
      class={cx(rowActionButton, rowActionDangerButton)}
      onclick={handleDelete}
      type="button"
    >
      <Trash height={16} width={16} />
      Delete
    </button>
    <a
      aria-label={`View invoice ${invoiceNumberDisplay}`}
      class={rowActionButton}
      href={resolve(invoiceDetailPath, { id })}
    >
      <View height={16} width={16} />
      View
    </a>
  {/snippet}

  {#snippet revealed()}
    {#if isDraft}
      <button class={rowActionButton} onclick={handleEdit} type="button">
        <Edit height={24} width={24} />
        Edit
      </button>
      <button class={rowActionButton} onclick={handleSendInvoice} type="button">
        <Send height={24} width={24} />
        Send
      </button>
    {/if}
    <button
      class={cx(rowActionButton, rowActionDangerButton)}
      onclick={handleDelete}
      type="button"
    >
      <Trash height={24} width={24} />
      Delete
    </button>
    <a class={rowActionButton} href={resolve(invoiceDetailPath, { id })}>
      <View height={24} width={24} />
      View
    </a>
  {/snippet}
</Swipeable>
