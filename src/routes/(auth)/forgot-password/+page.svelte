<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import { Button } from '$lib/components/ui/button'
  import type { PageProps } from './$types'

  let { form }: PageProps = $props()
</script>

<h1 class="auth-heading">Forgot Password</h1>

<form method="POST">
  {#if form?.success}
    <Alert message="Check your email for the password reset link." />
  {:else}
    <Alert message={form?.error?.message || ''} />
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

    <Button variant="auth">Send me a reset email!</Button>
    <p class="mt-4 text-center text-sm text-white">
      <a href="/login" class="underline hover:no-underline">Ready to login?</a>
    </p>
  {/if}
</form>
