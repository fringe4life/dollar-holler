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

<h1 class="auth-heading">Reset my Password</h1>

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
  <div class="field">
    <label for="newPassword">New Password</label>
    <input type="password" name="newPassword" id="newPassword" />
  </div>
  <div class="field">
    <label for="confirmPassword">Confirm Password</label>
    <input type="password" name="confirmPassword" id="confirmPassword" />
  </div>
  <Button variant="auth" type="submit" disabled={isLoading}>
    {#if isLoading}
      <Loader />
    {:else}
      Update my password!
    {/if}
  </Button>
  <p class="mt-4 text-center text-sm text-white">
    <a href={resolve("/login")} class="underline hover:no-underline"
      >I'm ready to login</a
    >
  </p>
</form>
