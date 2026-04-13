<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import ItemsHeader from "$lib/components/items-header.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import { Button } from "$lib/components/ui/button";
  import BlankState from "$lib/features/clients/components/BlankState.svelte";
  import ClientForm, {
    type Props,
  } from "$lib/features/clients/components/ClientForm.svelte";
  import InvoiceRow from "$lib/features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "$lib/features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "$lib/features/invoices/components/InvoiceRowSkeleton.svelte";
  import { ClientInvoicesStore } from "$lib/features/invoices/stores/clientInvoicesStore.svelte";
  import Pagination from "$lib/features/pagination/components/Pagination.svelte";
  import { listUrlKey } from "$lib/features/pagination/utils/url";
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

  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");

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
  let isEditing = $state<Props["formState"]>("create");

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

<div class="flex grow flex-col">
  {#if clientInvoicesStore.loading}
    <InvoiceRowHeader />
    <div class="flex flex-col-reverse gap-y-4">
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
    </div>
  {:else if clientInvoicesStore.error}
    <div class="grid place-content-center py-8 block-full">
      <div class="text-lg text-red-500">Error: {clientInvoicesStore.error}</div>
    </div>
  {:else if clientInvoicesStore.items.length === 0 && !searchQuery}
    <BlankState />
  {:else if clientInvoicesStore.items.length === 0 && searchQuery}
    <NoSearchResults>
      {#snippet header()}
        <InvoiceRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {:else}
    <div
      class="grid min-h-full items-start gap-y-4 lg:grid-rows-[min-content_1fr_min-content]"
    >
      <InvoiceRowHeader />
      <div class="flex flex-col-reverse gap-y-4">
        {#each clientInvoicesStore.items as i (i.invoiceNumber)}
          <InvoiceRow
            invoice={i}
            onEdit={(inv) => goto(`/invoices/${inv.id}`)}
            onDelete={(inv) => goto(`/invoices/${inv.id}`)}
          />
        {/each}
      </div>
      <Pagination store={clientInvoicesStore} />
      <CircledAmount amount={invoiceSummaryTotals.grandTotal} label="Total" />
    </div>
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
