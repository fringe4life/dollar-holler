<script lang="ts">
  type Props = {
    emptyState?: boolean
  }
  let { emptyState = false }: Props = $props()
  let tableHeaders = ['Status', 'Due Date', 'ID', 'Client', 'Amount'] as const
</script>

<div class=" invoice-table hidden lg:grid">
  {#each tableHeaders as header (header)}
    {@render tableHeader(header, emptyState)}
  {/each}
  <div></div>

  <div></div>
</div>

{#snippet tableHeader(title: string, emptyState: boolean = false)}
  <h3
    class={{
      'text-xl leading-snug font-black': true,
      'text-right': title === 'Amount',
      'truncate whitespace-nowrap': title === 'Client',
      'text-daisyBush': !emptyState,
      'text-pastelPurple': emptyState
    }}
  >
    {title}
  </h3>
{/snippet}
