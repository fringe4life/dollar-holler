<script lang="ts">
  import { css } from "styled-system/css";
  import { between, grid } from "styled-system/patterns";
  import { onDestroy } from "svelte";
  import { page } from "$app/state";
  import BlankState from "$features/clients/components/BlankState.svelte";
  import ClientForm, {
    type ClientFormProps,
  } from "$features/clients/components/ClientForm.svelte";
  import InvoiceForm from "$features/invoices/components/InvoiceForm.svelte";
  import InvoiceRow from "$features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "$features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "$features/invoices/components/InvoiceRowSkeleton.svelte";
  import InvoiceSummaryItem from "$features/invoices/components/InvoiceSummaryItem.svelte";
  import { ClientInvoicesStore } from "$features/invoices/stores/clientInvoicesStore.svelte";
  import type { InvoiceListResponse } from "$features/invoices/types";
  import ItemsHeader from "$features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "$features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "$features/pagination/components/PaginatedList.svelte";
  import { normalizeListQueryFromUrl } from "$features/pagination/utils/list-query";
  import { listUrlKey } from "$features/pagination/utils/url";
  import { ItemPanel } from "$lib/client/runes/ItemPanel.svelte";
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton, CursorId } from "$lib/types";
  import { centsToDollars, formatTotal } from "$lib/utils/moneyHelpers";

  let { data } = $props();

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
        draft: "—",
        grandTotal: "—",
        outstanding: "—",
        overdue: "—",
        paid: "—",
      };
    }
    return {
      draft: centsToDollars(s.draft),
      grandTotal: centsToDollars(s.grandTotal),
      outstanding: centsToDollars(s.outstanding),
      overdue: centsToDollars(s.overdue),
      paid: centsToDollars(s.paid),
    };
  });

  const formPanel = new ItemPanel<undefined>();
  const editPanel = new ItemPanel<CursorId>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
  let isEditing = $state<ClientFormProps["formState"]>("create");
  const { invoices: invoicesStore } = getDashboardStores();

  const handleEdit: BitsButton = () => {
    isEditing = "edit";
    formPanel.open(undefined);
  };

  const listQueryNormalized = $derived(
    normalizeListQueryFromUrl(page.url).normalized
  );
</script>

<svelte:head><title>{client.name} | Doller Holla</title></svelte:head>
<ItemsHeader
  open={formPanel.open.bind(null, undefined)}
  store={clientInvoicesStore}
>
  {#snippet button()}
    + Client
  {/snippet}
</ItemsHeader>

<div class={between({ marginBlockEnd: 7, inlineSize: "full" })}>
  <h1 class={css({ color: "daisyBush", fontSize: "3xl", fontWeight: "bold" })}>
    {client.name}
  </h1>
  <Button onclick={handleEdit} variant="textOnly"><Edit /> Edit</Button>
</div>

<div
  class={grid({
    columns: { base: 1, sm: 2, lg: 4 },
    gap: 4,
    marginBlockEnd: 10,
    backgroundColor: "gallery",
    borderRadius: "lg",
    paddingInline: { base: 6, md: 8, lg: 10 },
    paddingBlock: { base: 4, md: 6, lg: 8 },
  })}
>
  <InvoiceSummaryItem
    amount={invoiceSummaryTotals.overdue}
    title="Total Overdue"
  />

  <InvoiceSummaryItem
    amount={invoiceSummaryTotals.outstanding}
    title="Total Outstanding"
  />
  <InvoiceSummaryItem amount={invoiceSummaryTotals.draft} title="Total Draft" />
  <InvoiceSummaryItem amount={invoiceSummaryTotals.paid} title="Total Paid" />
</div>

<PaginatedList store={clientInvoicesStore}>
  {#snippet header()}
    <InvoiceRowHeader />
  {/snippet}
  {#snippet skeleton()}
    <InvoiceRowSkeleton />
  {/snippet}
  {#snippet row(_item)}
    <InvoiceRow
      invoice={_item}
      onDelete={deleteModal.open}
      onEdit={(inv) => editPanel.open(inv.id)}
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

<Modal onClose={formPanel.close} variant="panel" {@attach formPanel.attach}>
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
    <ClientForm closePanel={formPanel.close} edit={client} formState="edit" />
  {:else}
    <ClientForm
      closePanel={formPanel.close}
      edit={undefined}
      formState="create"
    />
  {/if}
</Modal>

<Modal onClose={editPanel.close} variant="panel" {@attach editPanel.attach}>
  {#snippet title()}
    <h2
      class={css({
        fontFamily: "sansserif",
        color: "daisyBush",
        marginBlockEnd: 7,
        fontSize: "3xl",
        fontWeight: "bold",
      })}
    >
      Edit an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class={css({ display: "none" })}>Edit an invoice</h2>
  {/snippet}

  {#if editPanel.item}
    {#key editPanel.item}
      <InvoiceForm
        closePanel={editPanel.close}
        invoiceId={editPanel.item}
        mode="edit"
      />
    {/key}
  {/if}
</Modal>

<ConfirmDelete
  item={deleteModal.item}
  onCancel={deleteModal.close}
  onDelete={async () => {
    if (!deleteModal?.item?.id) {
      return;
    }
    await invoicesStore.deleteInvoice(deleteModal.item.id);
    deleteModal.close();
  }}
  titleText="Are you sure you want to delete this invoice?"
  {@attach deleteModal.attach}
>
  {#snippet descriptionSnippet(_item)}
    This will delete the invoice to
    <span class={css({ color: "scarlet" })}>{_item?.name ?? "Unknown"}</span>
    for
    <span class={css({ color: "scarlet" })}
      >{formatTotal(_item?.total ?? 0)}</span
    >
  {/snippet}
</ConfirmDelete>
