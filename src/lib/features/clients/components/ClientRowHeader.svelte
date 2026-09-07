<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { HeaderProps } from "#lib/components/primitives/TableHeader.svelte";
  import TableHeader from "#lib/components/primitives/TableHeader.svelte";
  import TableHeaderItem from "#lib/components/primitives/TableHeaderItem.svelte";
  import { clientTable } from "../styles";

  const clientHeaders = [
    { title: "Status" },
    { title: "Client" },
    { class: css({ textAlign: "right" }), title: "Received" },
    { class: css({ textAlign: "right" }), title: "Balanced" },
  ];

  let { className = "", emptyState = false }: HeaderProps = $props();
</script>

<TableHeader className={cx(clientTable, className)} headers={clientHeaders}>
  {#snippet headerSnippet({ title, class: columnClass })}
    <TableHeaderItem class={columnClass} {emptyState}>{title}</TableHeaderItem>
  {/snippet}
</TableHeader>
