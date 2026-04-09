<script lang="ts">
  import { resolve } from "$app/paths";
  import AdditionalOptions from "$lib/components/AdditionalOptions.svelte";
  import AdditionalOptionsButton from "$lib/components/additionaloptions/AdditionalOptionsButton.svelte";
  import type { Option } from "$lib/components/additionaloptions/AdditionalOptionsItem.svelte";
  import AdditionalOptionsList from "$lib/components/additionaloptions/AdditionalOptionsList.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import Send from "$lib/components/icons/Send.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import View from "$lib/components/icons/View.svelte";
  import Swipeable from "$lib/components/Swipeable.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { getLabel } from "$lib/features/invoices/utils/labelHelpers";
  import { convertDate } from "$lib/utils/dateHelpers";
  import { formatTotal } from "$lib/utils/moneyHelpers";
  import type { MouseEventHandler } from "svelte/elements";
  import type { InvoiceListResponse } from "../types";

  type Props = {
    invoice: InvoiceListResponse;
    onEdit: (invoice: InvoiceListResponse) => void;
    onDelete: (invoice: InvoiceListResponse) => void;
  };

  let { invoice, onEdit, onDelete }: Props = $props();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () =>
    onDelete(invoice);

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () =>
    onEdit(invoice);

  // TODO: Implement send invoice functionality
  // even if just using dummy money and a transaction table to keep track of it.
  const handleSendInvoice: MouseEventHandler<HTMLButtonElement> = () => {};

  const id = $derived(invoice.id);
  const dueDate = $derived(invoice.dueDate);
  const invoiceNumber = $derived(invoice.invoiceNumber);
  const client = $derived(invoice.client);
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

<Swipeable
  contentClass="group/row invoice-table invoice-row table-row-hover shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  contentViewTransitionName={`invoice-${id}`}
>
  {#snippet content()}
    <div class="status justify-self-end">
      <Badge class="ms-auto md:ms-0" variant={label} size="small">{label}</Badge
      >
    </div>
    <div class="duedate truncate text-sm lg:text-lg">
      {convertDate(dueDate.toISOString())}
    </div>
    <div class="invoicenumber truncate text-sm lg:text-lg">{invoiceNumber}</div>
    <div class="clientName truncate text-base font-bold lg:text-xl">
      {client.name}
    </div>
    <div class="amount text-right font-mono text-sm font-bold lg:text-lg">
      {totalDisplay}
    </div>
    <div
      class="group-hover/row:text-daisyBush/50 viewbutton text-pastelPurple hover:text-daisyBush hidden text-sm transition-colors duration-200 md:place-self-center lg:block lg:text-lg"
    >
      <a href={resolved}><View /></a>
    </div>
    <AdditionalOptions>
      {#snippet content(additionalMenu)}
        <AdditionalOptionsButton {additionalMenu} />
        <AdditionalOptionsList {additionalMenu} options={INVOICE_OPTIONS} />
      {/snippet}
    </AdditionalOptions>
  {/snippet}
  {#snippet revealed()}
    {#if isOptionsDisabled}
      <button onclick={handleEdit} class="action-button">
        <Edit width={32} height={32} />
        Edit
      </button>
      <button onclick={handleSendInvoice} class="action-button">
        <Send width={32} height={32} />
        Send
      </button>
    {/if}
    <button onclick={handleDelete} class="action-button">
      <Trash width={32} height={32} />
      Delete
    </button>
    <a class="action-button" href={resolved}><View height={32} width={32} /></a>
  {/snippet}
</Swipeable>

<style>
  @reference "#app.css";
  :global {
    .invoice-row {
      grid-template-areas:
        "invoicenumber invoicenumber"
        "clientName    amount"
        "duedate       status";
      @media screen and (width > 1024px) {
        grid-template-areas: "status duedate invoicenumber clientName amount viewbutton morebutton";
      }
    }

    .status {
      grid-area: status;
    }
    .duedate {
      grid-area: duedate;
    }
    .invoicenumber {
      grid-area: invoicenumber;
    }
    .clientName {
      grid-area: clientName;
    }

    .amount {
      grid-area: amount;
    }

    .viewbutton {
      grid-area: viewbutton;
    }
    .morebutton {
      grid-area: morebutton;
    }
  }
</style>
