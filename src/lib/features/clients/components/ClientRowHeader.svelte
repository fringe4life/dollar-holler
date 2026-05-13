<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HeaderProps } from "$lib/components/TableHeader.svelte";
  import TableHeader from "$lib/components/TableHeader.svelte";
  import { clientTable } from "../styles";

  const clientHeaders = ["Status", "Client", "Received", "Balanced"];

  let { className = "", emptyState = false }: HeaderProps = $props();
</script>

<TableHeader
  headers={clientHeaders}
  className={cx(clientTable, className)}
  {emptyState}
>
  {#snippet headerSnippet(_title, _emptyState)}
    <h3
      class={css({
        fontSize: "xl",
        lineHeight: "snug",
        fontWeight: "bolder",
        textAlign:
          _title === "Received" || _title === "Balanced" ? "right" : undefined,
        color: _emptyState ? "pastelPurple" : "daisyBush",
      })}
    >
      {_title}
    </h3>
  {/snippet}
</TableHeader>
