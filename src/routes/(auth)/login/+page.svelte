<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import Alert from "$lib/components/Alert.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import { Button } from "$lib/components/ui/button";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();

  let isLoading = $state<boolean>(false);
</script>

<h1 class="auth-heading">Login</h1>

<form
  method="POST"
  use:enhance={() => {
    isLoading = true;
    return async ({ update }) => {
      isLoading = false;
      await update();
    };
  }}
>
  <Alert message={form?.error} />
  <fieldset disabled={isLoading}>
    <div class="field">
      <label for="email" class="text-goldenFizz">Email</label>
      <input
        required
        type="email"
        name="email"
        placeholder="john@email.com"
        defaultValue={form?.email ?? ""}
      />
    </div>
    <div class="field">
      <div class="flex items-center justify-between">
        <label for="password" class="text-goldenFizz">Password</label>
        <a
          class="text-sm underline hover:no-underline text-whisper"
          href={resolve("/forgot-password")}>Forgot Password</a
        >
      </div>
      <input required minlength="6" type="password" name="password" />
    </div>
    <div class="field">
      <Button variant="auth" type="submit" disabled={isLoading}>
        {#if isLoading}
          <Loader />
        {:else}
          Let's do this!
        {/if}
      </Button>
      <p class="mt-4 text-center text-sm text-white">
        <a href={resolve("/signup")} class="underline hover:no-underline"
          >Don't have an account yet?</a
        >
      </p>
    </div>
  </fieldset>
</form>
