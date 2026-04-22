<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import BlankState from "$features/clients/components/BlankState.svelte";
  import ClientForm, {
    type ClientFormProps,
  } from "$features/clients/components/ClientForm.svelte";
  import InvoiceRow from "$features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "$features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "$features/invoices/components/InvoiceRowSkeleton.svelte";
  import { ClientInvoicesStore } from "$features/invoices/stores/clientInvoicesStore.svelte";
  import PaginatedList from "$features/pagination/components/PaginatedList.svelte";
  import { listUrlKey } from "$features/pagination/utils/url";
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import ItemsHeader from "$lib/components/ItemsHeader.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import type { BitsButton } from "$lib/types";
  import { centsToDollars } from "$lib/utils/moneyHelpers";
  import { onDestroy } from "svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const client = $derived(data.client);

  // svelte-ignore state_referenced_locally
  let clientInvoicesStore = $state(new ClientInvoicesStore(data.client.id));
  // svelte-ignore state_referenced_locally
  clientInvoicesStore.hydrateListAndSummaryFromLoad(
    {
      items: data.items,
      paginationMetadata: data.paginationMetadata,
    },
    listUrlKey(page.url),
    data.summary
  );

  // $effect(() => {
  //   const id = data.client.id;
  //   if (clientInvoicesStore.clientId !== id) {
  //     clientInvoicesStore.reset();
  //     clientInvoicesStore = new ClientInvoicesStore(id);
  //   }
  //   clientInvoicesStore.hydrateListAndSummaryFromLoad(
  //     {
  //       items: data.items,
  //       paginationMetadata: data.paginationMetadata,
  //     },
  //     listUrlKey(page.url),
  //     data.summary
  //   );
  // });

  onDestroy(() => {
    clientInvoicesStore.reset();
  });

  const invoiceSummaryTotals = $derived.by(() => {
    const s = clientInvoicesStore.summary;
    if (!s) {
      return {
        overdue: "—",
        outstanding: "—",
        draft: "—",
        paid: "—",
        grandTotal: "—",
      };
    }
    return {
      overdue: centsToDollars(s.overdue),
      outstanding: centsToDollars(s.outstanding),
      draft: centsToDollars(s.draft),
      paid: centsToDollars(s.paid),
      grandTotal: centsToDollars(s.grandTotal),
    };
  });

  let isFormShowing = new Toggle();
  let isEditing = $state<ClientFormProps["formState"]>("create");

  const handleEdit: BitsButton = () => {
    isEditing = "edit";
    isFormShowing.toggle();
  };
</script>

<svelte:head>
  <title>{client.name} | Doller Holla</title>
</svelte:head>
<ItemsHeader store={clientInvoicesStore} toggle={isFormShowing.toggle}>
  {#snippet button()}
    + Client
  {/snippet}
</ItemsHeader>

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
    <div class="number">{invoiceSummaryTotals.overdue}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Outstanding</div>
    <div class="number">{invoiceSummaryTotals.outstanding}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Draft</div>
    <div class="number">{invoiceSummaryTotals.draft}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Paid</div>
    <div class="number">{invoiceSummaryTotals.paid}</div>
  </div>
</div>

<PaginatedList store={clientInvoicesStore}>
  {#snippet header()}
    <InvoiceRowHeader />
  {/snippet}
  {#snippet skeleton()}
    <InvoiceRowSkeleton />
  {/snippet}
  {#snippet row(invoice)}
    <InvoiceRow
      {invoice}
      onEdit={(inv) => goto(`/invoices/${inv.id}`)}
      onDelete={(inv) => goto(`/invoices/${inv.id}`)}
    />
  {/snippet}
  {#snippet blankState()}
    <BlankState />
  {/snippet}
  {#snippet noResults()}
    <NoSearchResults>
      {#snippet header()}
        <InvoiceRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {/snippet}
  {#snippet footer()}
    <CircledAmount amount={invoiceSummaryTotals.grandTotal} label="Total" />
  {/snippet}
</PaginatedList>

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
