<script lang="ts">
  import { css } from "styled-system/css";
  import type { HeaderProps } from "$lib/components/TableHeader.svelte";
  import TableHeader from "$lib/components/TableHeader.svelte";
  import { invoiceTable } from "../styles";

  let { emptyState = false }: HeaderProps = $props();
  let tableHeaders = ["Status", "Due Date", "ID", "Client", "Amount"] as const;
</script>
<TableHeader headers={tableHeaders} className={invoiceTable} {emptyState}>
  {#snippet headerSnippet(_title, _emptyState)}
    <h3
      class={css({
        fontSize: "xl",
        lineHeight: "snug",
        fontWeight: "bold",
        textAlign: _title === "Amount" ? "right" : undefined,
        overflow: _title === "Client" ? "hidden" : undefined,
        textOverflow: _title === "Client" ? "ellipsis" : undefined,
        whiteSpace: _title === "Client" ? "nowrap" : undefined,
        color: _emptyState ? "pastelPurple" : "daisyBush",
      })}
    >
      {_title}
    </h3>
  {/snippet}
</TableHeader>
