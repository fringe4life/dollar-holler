<script lang="ts">
  import { resolve } from "$app/paths";
  import { clickOutside } from "$lib/attachments/clickOutside";
  import { swipe } from "$lib/attachments/swipe.svelte";
  import AdditionalOptions from "$lib/components/AdditionalOptions.svelte";
  import InvoiceForm from "$lib/components/invoice-form.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import Badge, {
    type BadgeVariant,
  } from "$lib/components/ui/badge/badge.svelte";
  import Cancel from "$lib/icon/Cancel.svelte";
  import Edit from "$lib/icon/Edit.svelte";
  import Send from "$lib/icon/Send.svelte";
  import ThreeDots from "$lib/icon/ThreeDots.svelte";
  import Trash from "$lib/icon/Trash.svelte";
  import View from "$lib/icon/View.svelte";
  import { convertDate, isLate } from "$lib/utils/dateHelpers";
  import { centsToDollars, getTotal } from "$lib/utils/moneyHelpers";
  import type { InvoiceWithRelationsResponse } from "$lib/validators";
  import type { MouseEventHandler } from "svelte/elements";
  import ConfirmDelete from "./ConfirmDelete.svelte";

  let isAdditionalMenuShowing = $state(false);
  let isOptionsDisabled = $state(false);
  let triggerReset = $state(false);

  type Props = {
    invoice: InvoiceWithRelationsResponse;
  };

  let { invoice }: Props = $props();

  const onclick: MouseEventHandler<HTMLButtonElement> = () => {
    isAdditionalMenuShowing = !isAdditionalMenuShowing;
  };

  const getLabel = (
    label: BadgeVariant,
    dueDate: string | null
  ): BadgeVariant => {
    if (label === "draft") {
      return "draft";
    } else if (label === "sent" && isLate?.(dueDate)) {
      isOptionsDisabled = true;
      return "late";
    } else if (label === "sent" && !isLate?.(dueDate)) {
      isOptionsDisabled = true;
      return "sent";
    } else if (label === "paid") {
      isOptionsDisabled = true;
      return "paid";
    }
  };

  const closeOptions = () => {
    isAdditionalMenuShowing = false;
  };

  let open = $state<boolean>(false);
  let isInvoiceShowingPanel = $state<boolean>(false);

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () => {
    open = true;
    isAdditionalMenuShowing = false;
  };

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () => {
    isInvoiceShowingPanel = true;
    isAdditionalMenuShowing = false;
  };

  const handleSendInvoice: MouseEventHandler<HTMLButtonElement> = () => {};

  // svelte-ignore state_referenced_locally
  const {
    id,
    invoiceStatus,
    dueDate,
    invoiceNumber,
    client,
  }: InvoiceWithRelationsResponse = invoice;

  const label = getLabel(invoiceStatus ?? "draft", dueDate);

  // @ts-expect-error - resolve function supports 2 arguments in SvelteKit v2.26+
  const resolved = resolve("/invoices/[id]", { id });
</script>

<div class="relative isolate">
  <div
    {@attach swipe({ triggerReset: triggerReset })}
    class="invoice-table invoice-row shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  >
    <div class="status justify-self-end">{@render tag(label)}</div>
    <div class="duedate text-sm lg:text-lg">{convertDate(dueDate)}</div>
    <div class="invoicenumber text-sm lg:text-lg">{invoiceNumber}</div>
    <div class="clientname text-base font-bold lg:text-xl">{client.name}</div>
    <div class="amount text-right font-mono text-sm font-bold lg:text-lg">
      {centsToDollars(getTotal(invoice))}
    </div>
    <div
      class="hover:text-daisyBush viewbutton text-pastelPurple hidden text-sm transition-colors duration-200 md:place-self-center lg:block lg:text-lg"
    >
      <a href={resolved} class=""><View /></a>
    </div>
    <div
      class="text-pastelPurple morebutton hover:text-daisyBush relative hidden place-self-center text-sm transition-colors duration-200 lg:block lg:text-lg"
    >
      <button
        {@attach isAdditionalMenuShowing && clickOutside(closeOptions)}
        {onclick}
        class="flex cursor-pointer items-center justify-center"
        ><ThreeDots /></button
      >
      {#if isAdditionalMenuShowing}
        <AdditionalOptions
          options={[
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
          ]}
        />
      {/if}
    </div>
  </div>
  <!-- revealed on swipe -->
  <div class="swipe-revealed-actions">
    <button onclick={() => (triggerReset = true)} class="action-button">
      <Cancel width={32} height={32} />
      Cancel
    </button>
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
  </div>
</div>

{#snippet tag(title: BadgeVariant)}
  <Badge class="ml-auto lg:ml-0" variant={title} size="small">{title}</Badge>
{/snippet}

<ConfirmDelete bind:open {invoice} />

<SlidePanel bind:open={isInvoiceShowingPanel} buttonText="">
  {#snippet title()}
    <h2 class="font-sansserif text-daisyBush mb-7 text-3xl font-bold">
      Edit an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  <InvoiceForm
    formState="edit"
    bind:invoiceEdit={invoice}
    closePanel={() => (isInvoiceShowingPanel = false)}
  />
</SlidePanel>

<style>
  @reference "../../../app.css";
  .invoice-row {
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
  .morebutton {
    grid-area: morebutton;
  }
</style>
