<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import { Button } from '$lib/components/ui/button'
  import { resolve } from '$app/paths'
  import type { PageProps } from './$types'

  let { form }: PageProps = $props()

  let isLoading = $state<boolean>(false)
</script>

<h1 class="auth-heading">Login</h1>

<form method="POST">
  <Alert message={form?.error || ''} />
  <fieldset disabled={isLoading}>
    <div class="field">
      <label for="email" class="text-goldenFizz">Email</label>
      <input required type="email" name="email" placeholder="john@email.com" id="email" />
    </div>
    <div class="field">
      <div class="flex items-center justify-between">
        <label for="password" class="text-goldenFizz">Password</label>
        <a class="text-sm underline hover:no-underline" href={resolve('/forgot-password')}>Forgot Password</a>
      </div>
      <input required minlength="6" type="password" name="password" id="password" />
    </div>
    <div class="field">
      <Button variant="auth" type="submit">Let's do this!</Button>
      <p class="mt-4 text-center text-sm text-white">
        <a href={resolve('/signup')} class="underline hover:no-underline">Don't have an account yet?</a>
      </p>
    </div>
  </fieldset>
</form>
