<script lang="ts">
  import AuthEntryGuard from "#features/auth/components/AuthEntryGuard.svelte" with {
    render: "deferred",
  };
  import LoginForm from "#features/auth/components/LoginForm.svelte" with {
    wake: "load",
  };
  import { authHeading } from "#features/auth/styles.ts";
</script>

<svelte:head>
  <title>Log in to Dollar Holler invoices</title>
  <meta
    content="Sign in to Dollar Holler to create invoices, track payments, and manage your clients."
    name="description"
  />
</svelte:head>

<AuthEntryGuard />

<h1 class={authHeading}>Login</h1>

<LoginForm />
