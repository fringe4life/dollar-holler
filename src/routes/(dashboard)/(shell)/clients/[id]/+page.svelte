<script lang="ts">
  import { css } from "styled-system/css";
  import { flex, grid } from "styled-system/patterns";
  import { onDestroy } from "svelte";
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
  import ItemsHeader from "$features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "$features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "$features/pagination/components/PaginatedList.svelte";
  import { normalizeListQueryFromUrl } from "$features/pagination/utils/list-query";
  import { listUrlKey } from "$features/pagination/utils/url";
  import { ItemPanel } from "$lib/client/runes/ItemPanel.svelte";
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { BitsButton } from "$lib/types";
  import { centsToDollars } from "$lib/utils/moneyHelpers";
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

  const formPanel = new ItemPanel<undefined>();
  let isEditing = $state<ClientFormProps["formState"]>("create");

  const handleEdit: BitsButton = () => {
    isEditing = "edit";
    formPanel.open(undefined);
  };

  const listQueryNormalized = $derived(
    normalizeListQueryFromUrl(page.url).normalized
  );
</script>

<svelte:head> <title>{client.name} | Doller Holla</title> </svelte:head>
<ItemsHeader
  store={clientInvoicesStore}
  open={formPanel.open.bind(null, undefined)}
>
  {#snippet button()}
    + Client
  {/snippet}
</ItemsHeader>

<div
  class={flex({ justify: "space-between", align: "center", marginBlockEnd: 7, inlineSize: "full" })}
>
  <h1 class={css({ color: "daisyBush", fontSize: "3xl", fontWeight: "bold" })}>
    {client.name}
  </h1>
  <Button variant="textOnly" onclick={handleEdit}><Edit /> Edit</Button>
</div>

<div
  class={grid({ columns: { base:1, lg: 4 }, gap: 4, marginBlockEnd: 10, bg: "gallery", borderRadius: "lg", paddingX: 10, paddingY: 7 })}
>
  <div class={css({ textAlign: "center" })}>
    <div
      class={css({ color: "lightGray", fontSize: "sm", fontWeight: "black" })}
    >
      Total Overdue
    </div>
    <div
      class={css({ color: "purple", fontSize: "4xl", fontWeight: "black", truncate:true })}
    >
      {invoiceSummaryTotals.overdue}
    </div>
  </div>
  <div class={css({ textAlign: "center" })}>
    <div
      class={css({ color: "lightGray", fontSize: "sm", fontWeight: "black", truncate: true })}
    >
      Total Outstanding
    </div>
    <div
      class={css({ color: "purple", fontSize: "4xl", fontWeight: "black", truncate: true })}
    >
      {invoiceSummaryTotals.outstanding}
    </div>
  </div>
  <div class={css({ textAlign: "center" })}>
    <div
      class={css({ color: "lightGray", fontSize: "sm", fontWeight: "black" })}
    >
      Total Draft
    </div>
    <div
      class={css({ color: "purple", fontSize: "4xl", fontWeight: "black", truncate: true })}
    >
      {invoiceSummaryTotals.draft}
    </div>
  </div>
  <div class={css({ textAlign: "center" })}>
    <div
      class={css({ color: "lightGray", fontSize: "sm", fontWeight: "black" })}
    >
      Total Paid
    </div>
    <div
      class={css({ color: "purple", fontSize: "4xl", fontWeight: "black", truncate: true })}
    >
      {invoiceSummaryTotals.paid}
    </div>
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
      onSendInvoice={async (inv) => {
        await clientInvoicesStore.updateInvoiceStatus(
          inv.id,
          "sent",
          listQueryNormalized
        );
      }}
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

<Modal
  variant="panel"
  bind:dialogEl={formPanel.dialogEl}
  onClose={formPanel.close}
>
  {#snippet title()}
    <h2
      class={css({
        fontFamily: "sansserif",
        color: "daisyBush",
        marginBlockStart: { base: 9, lg: 0 },
        marginBlockEnd: 7,
        fontSize: "3xl",
        fontWeight: "bold",
      })}
    >
      Add a Client
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class={css({ display: "none" })}>""</h2>
  {/snippet}

  {#if isEditing === "edit"}
    <ClientForm edit={client} formState="edit" closePanel={formPanel.close} />
  {:else}
    <ClientForm
      edit={undefined}
      formState="create"
      closePanel={formPanel.close}
    />
  {/if}
</Modal>
