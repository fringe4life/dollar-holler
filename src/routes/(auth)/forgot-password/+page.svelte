<script lang="ts">
  import ForgotPasswordForm from "#features/auth/components/ForgotPasswordForm.svelte" with {
    wake: "load",
  };
  import { authHeading } from "#features/auth/styles.ts";
</script>

<svelte:head>
  <title>Reset Dollar Holler account password</title>
  <meta
    content="Request a password reset email for your Dollar Holler invoice account."
    name="description"
  />
</svelte:head>

<h1 class={authHeading}>Forgot Password</h1>

<ForgotPasswordForm />
