<script lang="ts">
  import { resolve } from "$app/paths";
  import Form from "$lib/components/Form.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<h1 class="auth-heading">Login</h1>

<Form {form}>
  {#snippet children()}
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
          class="text-whisper text-sm underline hover:no-underline"
          href={resolve("/forgot-password")}>Forgot Password</a
        >
      </div>
      <input required minlength="6" type="password" name="password" />
    </div>
  {/snippet}
  {#snippet submit()}
    Let's do this!
  {/snippet}
  {#snippet footer()}
    <p class="mbs-4 text-center text-sm text-white">
      <a href={resolve("/signup")} class="underline hover:no-underline"
        >Don't have an account yet?</a
      >
    </p>
  {/snippet}
</Form>
