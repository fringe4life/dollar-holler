<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HeaderProps } from "$lib/components/TableHeader.svelte";
  import TableHeader from "$lib/components/TableHeader.svelte";
  import { clientTable } from "$lib/styles";

  const clientHeaders = ["Status", "Client", "Received", "Balanced"];

  let { className = "", emptyState = false }: HeaderProps = $props();
</script>

<TableHeader
  headers={clientHeaders}
  className={cx(clientTable, className)}
  {emptyState}
>
  {#snippet headerSnippet(title, emptyState)}
    <h3
      class={css({
        fontSize: "xl",
        lineHeight: "snug",
        fontWeight: "bolder",
        textAlign:
          title === "Received" || title === "Balanced" ? "right" : undefined,
        color: emptyState ? "pastelPurple" : "daisyBush",
      })}
    >
      {title}
    </h3>
  {/snippet}
</TableHeader>
