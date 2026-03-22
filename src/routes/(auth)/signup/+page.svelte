<script lang="ts">
  import { resolve } from "$app/paths";
  import Alert from "$lib/components/Alert.svelte";
  import Form from "$lib/components/Form.svelte";
  import { buttonVariants } from "$lib/components/ui/button";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();

  let isFormShowing = $state<boolean>(true);
</script>

{#if isFormShowing}
  <h1 class="auth-heading">Sign up</h1>
  <Form {form}>
    {#snippet children()}
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
        <label for="confirmPassword" class="text-goldenFizz"
          >Confirm Password</label
        >
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          required
        />
      </div>
    {/snippet}
    {#snippet submit()}
      Count me in!
    {/snippet}
    {#snippet footer()}
      <p class="mbs-4 text-center text-sm text-white">
        <a
          href={resolve("/login")}
          class="underline hover:no-underline"
          data-sveltekit-preload-data="hover">Already have an account?</a
        >
      </p>
    {/snippet}
  </Form>
{:else}
  <Alert message="Check your email for confirmation" />
  <a href={resolve("/login")} class={buttonVariants({ variant: "auth" })}
    >Login</a
  >
{/if}
