<script lang="ts">
  import { goto } from "$app/navigation";
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import Search from "$lib/components/Search.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import { Button } from "$lib/components/ui/button";
  import BlankState from "$lib/features/clients/components/BlankState.svelte";
  import ClientForm, {
    type Props,
  } from "$lib/features/clients/components/ClientForm.svelte";
  import InvoiceRow from "$lib/features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "$lib/features/invoices/components/InvoiceRowHeader.svelte";
  import type { SearchableListStore } from "$lib/features/pagination/types";
  import type { ListQueryNormalized } from "$lib/features/pagination/utils/list-query";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton } from "$lib/types";
  import { isLate } from "$lib/utils/dateHelpers";
  import { centsToDollars, sumInvoiceTotals } from "$lib/utils/moneyHelpers";
  import { onMount } from "svelte";

  let { data } = $props();

  const { invoices: invoicesStore } = getDashboardStores();

  let isFormShowing = new Toggle();
  let isEditing = $state<Props["formState"]>("create");
  // svelte-ignore state_referenced_locally
  const client = $state(data.client);
  // Load invoices and filter by client
  onMount(async () => {
    await invoicesStore.getInvoicesByClientId(client.id);
  });

  // Get invoices for this client from the invoice store
  const clientInvoices = $derived(
    invoicesStore.items.filter((invoice) => invoice.clientId === data.client.id)
  );

  const handleEdit: BitsButton = () => {
    isEditing = "edit";
    isFormShowing.toggle();
  };

  const getDraft = (): string => {
    const draftInvoices = clientInvoices.filter(
      (i) => i.invoiceStatus === "draft"
    );
    return centsToDollars(sumInvoiceTotals(draftInvoices));
  };

  const getPaid = (): string => {
    const paidInvoices = clientInvoices.filter(
      (i) => i.invoiceStatus === "paid"
    );
    return centsToDollars(sumInvoiceTotals(paidInvoices));
  };

  const getOverdue = (): string => {
    const overdueInvoices = clientInvoices.filter(
      (i) => isLate(i.dueDate.toISOString()) && i.invoiceStatus === "sent"
    );
    return centsToDollars(sumInvoiceTotals(overdueInvoices));
  };

  const getOustanding = (): string => {
    const outstandingInvoices = clientInvoices.filter(
      (i) => !isLate(i.dueDate.toISOString()) && i.invoiceStatus === "sent"
    );
    return centsToDollars(sumInvoiceTotals(outstandingInvoices));
  };

  /** Do not pass `invoicesStore` here — `loadItems` would fetch the global list. Client-scoped search is not implemented yet. */
  const detailInvoiceSearch: SearchableListStore = {
    get loading() {
      return invoicesStore.loading;
    },
    async loadItems(_normalized: ListQueryNormalized) {
      // noop until client-scoped invoice search exists
    },
  };
</script>

<svelte:head>
  <title>{client.name} | Doller Holla</title>
</svelte:head>
<div
  class="mbe-7 flex flex-col-reverse items-start justify-between gap-y-6 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mbe-16 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  <Search store={detailInvoiceSearch} />
  <!-- new invoice button -->
  <div class="z-1">
    <Button onclick={isFormShowing.toggle} size="lg">+ Client</Button>
  </div>
</div>

<div class="mbe-7 flex items-center justify-between inline-full">
  <h1 class="font-sansserif text-daisyBush text-3xl font-bold">
    {client.name}
  </h1>
  <Button variant="textOnly" onclick={handleEdit}><Edit /> Edit</Button>
</div>

<div
  class="bg-gallery mbe-10 grid grid-cols-1 gap-4 rounded-lg px-10 py-7 lg:grid-cols-4"
>
  <div class="summary-block">
    <div class="label">Total Overdue</div>
    <div class="number">{getOverdue()}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Outstanding</div>
    <div class="number">{getOustanding()}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Draft</div>
    <div class="number">{getDraft()}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Paid</div>
    <div class="number">{getPaid()}</div>
  </div>
</div>

<!-- list of invoices -->
<div>
  <!-- invoices -->
  {#if !clientInvoices}
    <p>Loading...</p>
  {:else if clientInvoices.length > 0}
    <InvoiceRowHeader />
    <div class="flex flex-col-reverse gap-y-4">
      {#each clientInvoices as i (i.invoiceNumber)}
        <InvoiceRow
          invoice={{
            ...i,
            client: { name: client.name },
            total: i.total,
          }}
          onEdit={(inv) => goto(`/invoices/${inv.id}`)}
          onDelete={(inv) => goto(`/invoices/${inv.id}`)}
        />
      {/each}
    </div>
    <CircledAmount
      amount={centsToDollars(sumInvoiceTotals(clientInvoices))}
      label="Total"
    />
  {:else}
    <BlankState />
  {/if}
</div>

<SlidePanel bind:open={isFormShowing.isOn} buttonText="">
  {#snippet title()}
    <h2
      class="font-sansserif text-daisyBush mbs-9 mbe-7 text-3xl font-bold lg:mbs-0"
    >
      Add a Client
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  {#if isEditing === "edit"}
    <ClientForm
      edit={client}
      formState="edit"
      closePanel={() => {
        isFormShowing.off();
        isEditing = "edit";
      }}
    />
  {:else}
    <ClientForm
      edit={undefined}
      formState="create"
      closePanel={() => {
        isFormShowing.off();
        isEditing = "create";
      }}
    />
  {/if}
</SlidePanel>

<style>
  @reference "#app.css";
  .summary-block {
    @apply text-center;
  }

  .label {
    @apply text-lightGray text-sm font-black;
  }
  .number {
    @apply text-purple truncate text-4xl font-black;
  }
</style>
