<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import { Button } from '$lib/components/ui/button'
  import { resolve } from '$app/paths'
  import type { PageProps } from './$types'

  let { form }: PageProps = $props()
</script>

<h1 class="auth-heading">Forgot Password</h1>

<form method="POST">
  {#if form?.success}
    <Alert message="Check your email for the password reset link." />
  {:else}
    <Alert message={form?.error || ''} />
    <div class="field">
      <label for="email" class="text-goldenFizz">Email Address</label>
      <input
        value={form?.email ?? ''}
        type="email"
        name="email"
        id="email"
        placeholder="john@email.com"
      />
    </div>

    <Button variant="auth" type="submit">Send me a reset email!</Button>
    <p class="mt-4 text-center text-sm text-white">
      <a href={resolve('/login')} class="underline hover:no-underline">Ready to login?</a>
    </p>
  {/if}
</form>
