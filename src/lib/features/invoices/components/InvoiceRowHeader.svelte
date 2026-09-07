<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import type { HeaderProps } from "#lib/components/primitives/TableHeader.svelte";
  import TableHeader from "#lib/components/primitives/TableHeader.svelte";
  import TableHeaderItem from "#lib/components/primitives/TableHeaderItem.svelte";
  import { invoiceTable } from "../styles";

  let { emptyState = false }: HeaderProps = $props();

  const tableHeaders = [
    { title: "Status" },
    { title: "Due Date" },
    { title: "ID" },
    {
      class: css({
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }),
      title: "Client",
    },
    { class: css({ textAlign: "right" }), title: "Amount" },
  ];
</script>

<TableHeader className={invoiceTable} headers={tableHeaders}>
  {#snippet headerSnippet({ title, class: columnClass })}
    <TableHeaderItem class={columnClass} {emptyState}>{title}</TableHeaderItem>
  {/snippet}
</TableHeader>
