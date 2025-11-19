<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { resolve } from '$app/paths'
  import Alert from '$lib/components/Alert.svelte'

  import Loader from '$lib/components/Loader.svelte'
  import type { PageProps } from './$types'

  let { data, form }: PageProps = $props()

  let isFormShowing = $state<boolean>(true)
  let isLoading = $state<boolean>(false)
</script>

{#if isFormShowing}
  <h1 class="auth-heading">Sign up</h1>
  <Alert message={form?.error || ''} />
  <form method="POST">
    <fieldset disabled={isLoading}>
      <!-- client-side debug: minimal -->
      <input type="hidden" name="__debug_ts" value={Date.now()} />
      <div class="field">
        <label for="name" class="text-goldenFizz">Full Name</label>
        <input type="text" name="name" id="name" />
      </div>

      <div class="field">
        <label for="email" class="text-goldenFizz">Email</label>
        <input type="email" name="email" id="email" required />
      </div>
      <div class="field">
        <label for="password" class="text-goldenFizz">Password</label>
        <input type="password" name="password" id="password" required />
      </div>
      <div class="field">
        <label for="confirmPassword" class="text-goldenFizz">Confirm Password</label>
        <input type="password" name="confirmPassword" id="confirmPassword" required />
      </div>
      <Button variant="auth" type="submit"
        >{#if isLoading}
          <Loader />{:else}Count me in!{/if}</Button
      >
      <p class="mt-4 text-center text-sm text-white">
        <a
          href={resolve('/login')}
          class="underline hover:no-underline"
          data-sveltekit-preload-data="hover">Already have an account?</a
        >
      </p>
    </fieldset>
  </form>
{:else}
  <Alert message="Check your email for confirmation" />
  <a href={resolve('/login')} class={buttonVariants({ variant: 'auth' })}>Login</a>
{/if}
