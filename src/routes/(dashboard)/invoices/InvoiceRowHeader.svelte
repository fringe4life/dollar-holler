<script lang="ts">
  import TableHeader from '$lib/components/TableHeader.svelte'
  import type { HeaderProps } from '$lib/components/TableHeader.svelte'

  let { emptyState = false }: HeaderProps = $props()
  let tableHeaders = ['Status', 'Due Date', 'ID', 'Client', 'Amount'] as const
</script>

<TableHeader headers={tableHeaders} className="invoice-table" {emptyState}>
  {#snippet headerSnippet(title: string, emptyState: boolean = false)}
    <h3
      class={{
        'text-xl leading-snug font-black': true,
        'text-right': title === 'Amount',
        'truncate whitespace-nowrap': title === 'Client',
        'text-daisyBush': !emptyState,
        'text-pastelPurple': emptyState,
      }}
    >
      {title}
    </h3>
  {/snippet}
</TableHeader>
