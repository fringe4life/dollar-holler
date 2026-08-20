<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { HeaderProps } from "#lib/components/primitives/TableHeader.svelte";
  import TableHeader from "#lib/components/primitives/TableHeader.svelte";
  import { clientTable } from "../styles";

  const clientHeaders = ["Status", "Client", "Received", "Balanced"];

  let { className = "", emptyState = false }: HeaderProps = $props();
</script>

<TableHeader
  className={cx(clientTable, className)}
  {emptyState}
  headers={clientHeaders}
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
