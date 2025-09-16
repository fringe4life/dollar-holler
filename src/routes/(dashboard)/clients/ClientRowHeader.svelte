<script lang="ts">
  type Props = {
    className?: string
    emptyState?: boolean
  }

  const clientHeaders = ['Status', 'Client', 'Received', 'Balanced']

  let { className = '', emptyState = false }: Props = $props()
</script>

<div class={`client-table hidden lg:grid ${className}`}>
  {#each clientHeaders as client (client)}
    {@render clientHeader(client, emptyState)}
  {/each}
  <div></div>
  <div></div>
</div>

{#snippet clientHeader(title: string, emptyState: boolean = false)}
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
