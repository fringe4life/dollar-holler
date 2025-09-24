<script lang="ts">
  import TableHeader from '$lib/components/TableHeader.svelte';
 import type { HeaderProps } from '$lib/components/TableHeader.svelte';

  const clientHeaders = ['Status', 'Client', 'Received', 'Balanced']

  let { className = '', emptyState = false }: HeaderProps = $props()
</script>

<TableHeader 
  headers={clientHeaders} 
  className={`client-table ${className}`} 
  emptyState={emptyState}
>
  {#snippet headerSnippet(title: string, emptyState: boolean = false)}
    <h3
      class={{
        'text-xl leading-snug font-black': true,
        'text-right': title === 'Received' || title === 'Balanced',
        'text-daisyBush': !emptyState,
        'text-pastelPurple': emptyState,
      }}
    >
      {title}
    </h3>
  {/snippet}
</TableHeader>
