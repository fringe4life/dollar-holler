<script lang="ts">
  import AuthEntryGuard from "#features/auth/components/AuthEntryGuard.svelte" with {
    render: "deferred",
  };
  import SignupForm from "#features/auth/components/SignupForm.svelte" with {
    wake: "load",
  };
  import { authHeading } from "#features/auth/styles.ts";
</script>

<svelte:head>
  <title>Create your Dollar Holler account</title>
  <meta
    content="Sign up for Dollar Holler to send professional invoices and manage clients from one dashboard."
    name="description"
  />
</svelte:head>

<AuthEntryGuard />

<h1 class={authHeading}>Sign up</h1>

<SignupForm />
