<script lang="ts">
  import ResetPasswordForm from "#features/auth/components/ResetPasswordForm.svelte" with {
    wake: "load",
  };
  import { authHeading } from "#features/auth/styles.ts";
</script>

<svelte:head>
  <title>Choose a new Dollar Holler password</title>
  <meta
    content="Set a new password for your Dollar Holler account using the reset link from your email."
    name="description"
  />
</svelte:head>

<h1 class={authHeading}>Reset my Password</h1>

<ResetPasswordForm />
