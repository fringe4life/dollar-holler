<script lang="ts">
  import { resolve } from "$app/paths";
  import AdditionalOptions from "$lib/components/AdditionalOptions.svelte";
  import AdditionalOptionsButton from "$lib/components/additionaloptions/AdditionalOptionsButton.svelte";
  import type { Option } from "$lib/components/additionaloptions/AdditionalOptionsItem.svelte";
  import AdditionalOptionsList from "$lib/components/additionaloptions/AdditionalOptionsList.svelte";
  import Swipeable from "$lib/components/Swipeable.svelte";
  import Badge, {
    type BadgeVariant,
  } from "$lib/components/ui/badge/badge.svelte";
  import Edit from "$lib/icon/Edit.svelte";
  import Send from "$lib/icon/Send.svelte";
  import Trash from "$lib/icon/Trash.svelte";
  import View from "$lib/icon/View.svelte";
  import { convertDate } from "$lib/utils/dateHelpers";
  import { getLabel } from "$lib/utils/labelHelpers";
  import { formatTotal } from "$lib/utils/moneyHelpers";
  import type { InvoiceListResponse } from "$lib/validators";
  import type { MouseEventHandler } from "svelte/elements";
  import ConfirmDelete from "./ConfirmDelete.svelte";

  type Props = {
    invoice: InvoiceListResponse;
    onEdit: (invoice: InvoiceListResponse) => void;
  };

  let { invoice, onEdit }: Props = $props();
  let open = $state<boolean>(false);

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () => {
    open = true;
  };

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () => {
    onEdit(invoice);
  };

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

  const label = $derived(
    getLabel(invoiceStatus ?? "draft", dueDate.toISOString())
  );
  const isOptionsDisabled = $derived(label !== "draft");
  const resolved = $derived(resolve(`/invoices/${id}`));

  const INVOICE_OPTIONS = [
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
  ] satisfies Option[];
</script>

<Swipeable
  contentClass="invoice-table invoice-row shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
>
  {#snippet content()}
    <div class="status justify-self-end">{@render tag(label)}</div>
    <div class="duedate text-sm lg:text-lg">
      {convertDate(dueDate.toISOString())}
    </div>
    <div class="invoicenumber text-sm lg:text-lg">{invoiceNumber}</div>
    <div class="clientname text-base font-bold lg:text-xl">{client.name}</div>
    <div class="amount text-right font-mono text-sm font-bold lg:text-lg">
      {totalDisplay}
    </div>
    <div
      class="hover:text-daisyBush viewbutton text-pastelPurple hidden text-sm transition-colors duration-200 md:place-self-center lg:block lg:text-lg"
    >
      <a href={resolved}><View /></a>
    </div>
    <AdditionalOptions options={INVOICE_OPTIONS}>
      {#snippet content(additionalMenu, options)}
        <AdditionalOptionsButton {additionalMenu} />
        <AdditionalOptionsList {additionalMenu} {options} />
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

{#snippet tag(title: BadgeVariant)}
  <Badge class="ml-auto lg:ml-0" variant={title} size="small">{title}</Badge>
{/snippet}

<ConfirmDelete
  bind:open
  invoiceId={id}
  clientName={client.name}
  {totalDisplay}
/>

<style>
  @reference "../../../app.css";
  :global(.invoice-row) {
    grid-template-areas:
      "invoicenumber invoicenumber "
      "clientname    amount"
      "duedate       status";
    @media screen and (width > 1024px) {
      grid-template-areas: "status duedate invoicenumber clientname amount viewbutton morebutton";
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
  .clientname {
    grid-area: clientname;
  }

  .amount {
    grid-area: amount;
  }

  .viewbutton {
    grid-area: viewbutton;
  }
  :global(.morebutton) {
    grid-area: morebutton;
  }
</style>
