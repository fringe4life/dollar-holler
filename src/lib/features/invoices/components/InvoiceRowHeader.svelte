<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import type { HeaderProps } from "#lib/components/primitives/TableHeader.svelte";
  import TableHeader from "#lib/components/primitives/TableHeader.svelte";
  import { invoiceTable } from "../styles";

  let { emptyState = false }: HeaderProps = $props();
  let tableHeaders = ["Status", "Due Date", "ID", "Client", "Amount"] as const;
</script>

<TableHeader className={invoiceTable} {emptyState} headers={tableHeaders}>
  {#snippet headerSnippet(title, emptyState)}
    <h3
      class={css({
        fontSize: "xl",
        lineHeight: "snug",
        fontWeight: "bold",
        textAlign: title === "Amount" ? "right" : undefined,
        overflow: title === "Client" ? "hidden" : undefined,
        textOverflow: title === "Client" ? "ellipsis" : undefined,
        whiteSpace: title === "Client" ? "nowrap" : undefined,
        color: emptyState ? "pastelPurple" : "daisyBush",
      })}
    >
      {title}
    </h3>
  {/snippet}
</TableHeader>
