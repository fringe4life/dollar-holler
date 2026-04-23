<script lang="ts">
  import { resolve } from "$app/paths";
  import Form from "$lib/components/Form.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<h1 class="auth-heading">Reset my Password</h1>

<Form {form} method="POST">
  {#snippet children()}
    <div class="field">
      <label for="newPassword">New Password</label>
      <input type="password" name="newPassword" id="newPassword">
    </div>
    <div class="field">
      <label for="confirmPassword">Confirm Password</label>
      <input type="password" name="confirmPassword" id="confirmPassword">
    </div>
  {/snippet}
  {#snippet submit()}
    Update my password!
  {/snippet}
  {#snippet footer()}
    <p class="mbs-4 text-center text-sm text-white">
      <a href={resolve("/login")} class="underline hover:no-underline"
        >I'm ready to login</a
      >
    </p>
  {/snippet}
</Form>
