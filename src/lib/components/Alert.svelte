<script lang="ts">
  type Props = {
    message: string
  }
  let { message = '' }: Props = $props()
</script>

{#if message}
  <div class="bg-lavenderIndigo mb-8 h-14 rounded-md p-4 text-center text-base text-white">
    <p>{message}</p>
  </div>
{/if}
