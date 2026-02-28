<script lang="ts">
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Search from "$lib/components/Search.svelte";
  import { centsToDollars, sumInvoices } from "$lib/utils/moneyHelpers";
  import BlankState from "../BlankState.svelte";

  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import { Button } from "$lib/components/ui/button";
  import Edit from "$lib/icon/Edit.svelte";
  import { invoices, invoicesStore } from "$lib/stores/invoicesStore.svelte";
  import { isLate } from "$lib/utils/dateHelpers";
  import { onMount } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";
  import InvoiceRow from "../../invoices/InvoiceRow.svelte";
  import InvoiceRowHeader from "../../invoices/InvoiceRowHeader.svelte";
  import ClientForm, { type Props } from "../ClientForm.svelte";

  let { data } = $props();
  let isFormShowing = $state<boolean>(false);
  let isEditing = $state<Props["formState"]>("create");
  // svelte-ignore state_referenced_locally
  const client = $state(data.client);
  // Load invoices and filter by client
  onMount(async () => {
    await invoicesStore.getInvoicesByClientId(client.id);
  });

  // Get invoices for this client from the invoice store
  const clientInvoices = $derived(
    invoices.filter((invoice) => invoice.clientId === data.client.id)
  );

  const handleEdit: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = () => {
    isEditing = "edit";
    isFormShowing = true;
  };

  const getDraft = (): string => {
    const draftInvoices = clientInvoices.filter(
      (i) => i.invoiceStatus === "draft"
    );
    return centsToDollars(sumInvoices(draftInvoices));
  };

  const getPaid = (): string => {
    const paidInvoices = clientInvoices.filter(
      (i) => i.invoiceStatus === "paid"
    );
    return centsToDollars(sumInvoices(paidInvoices));
  };

  const getOverdue = (): string => {
    const overdueInvoices = clientInvoices.filter((i) => {
      if (isLate(i.dueDate.toISOString()) && i.invoiceStatus === "sent") {
        return true;
      }
      return false;
    });
    return centsToDollars(sumInvoices(overdueInvoices));
  };

  const getOustanding = (): string => {
    const overdueInvoices = clientInvoices.filter((i) => {
      if (!isLate(i.dueDate.toISOString()) && i.invoiceStatus === "sent") {
        return true;
      }
      return false;
    });
    return centsToDollars(sumInvoices(overdueInvoices));
  };

  const handleSearch = async (searchTerms: string) => {
    console.log(searchTerms);
  };
</script>

<svelte:head>
  <title>{client.name} | Doller Holla</title>
</svelte:head>
<div
  class="mb-7 flex flex-col-reverse items-start justify-between gap-y-6 px-5 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mb-16 lg:px-10 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  {#if clientInvoices && clientInvoices.length > 0}
    <Search {handleSearch} />
  {:else}
    <div></div>
  {/if}
  <!-- new invoice button -->
  <div class="z-1">
    <Button onclick={() => (isFormShowing = true)} size="lg">+ Client</Button>
  </div>
</div>

<div class="mb-7 flex w-full items-center justify-between">
  <h1 class="font-sansserif text-daisyBush text-3xl font-bold">
    {client.name}
  </h1>
  <Button variant="textOnly" onclick={handleEdit}><Edit /> Edit</Button>
</div>

<div
  class="bg-gallery mb-10 grid grid-cols-1 gap-4 rounded-lg px-10 py-7 lg:grid-cols-4"
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
    <div class="flex flex-col-reverse">
      {#each clientInvoices as i (i.invoiceNumber)}
        <InvoiceRow invoice={{ ...i, client }} />
      {/each}
    </div>
    <CircledAmount
      amount={centsToDollars(sumInvoices(clientInvoices))}
      label="Total"
    />
  {:else}
    <BlankState />
  {/if}
</div>

<SlidePanel bind:open={isFormShowing} buttonText="">
  {#snippet title()}
    <h2
      class="font-sansserif text-daisyBush mt-9 mb-7 text-3xl font-bold lg:mt-0"
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
        isFormShowing = false;
        isEditing = "edit";
      }}
    />
  {:else}
    <ClientForm
      edit={undefined}
      formState="create"
      closePanel={() => {
        isFormShowing = false;
        isEditing = "create";
      }}
    />
  {/if}
</SlidePanel>

<style>
  @reference "../../../../app.css";
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
