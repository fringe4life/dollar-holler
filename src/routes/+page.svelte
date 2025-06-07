<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  
  import { toast } from 'svelte-sonner'
</script>

<h1 class="text-3xl font-bold underline">Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<Button
  variant="outline"
  onclick={() =>
    toast.success('Invoice has been updated', {
      description: 'Sunday, December 03, 2023 at 9:00 AM',
      action: {
        label: 'Close',
        onClick: () => console.info('Undo')
      },
      duration: 10
    })}
>
  Show Toast
</Button>
