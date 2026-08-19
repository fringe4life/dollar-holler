<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { resetPassword } from "#features/auth/auth.remote.ts";
  import { authHeading } from "#features/auth/styles.ts";
  import Form from "#lib/components/form/Form.svelte";
  import FormField from "#lib/components/form/FormField.svelte";
  import LoaderButton from "#lib/components/ui/button/LoaderButton.svelte";
  import Input from "#lib/components/ui/input/Input.svelte";

  const token = $derived(page.url.searchParams.get("token") ?? "");
</script>

<svelte:head>
  <title>Choose a new Dollar Holler password</title>
  <meta
    content="Set a new password for your Dollar Holler account using the reset link from your email."
    name="description"
  />
</svelte:head>

<h1 class={authHeading}>Reset my Password</h1>

<Form remote={resetPassword}>
  <input {...resetPassword.fields.token.as("hidden", token)} />
  <FormField
    forId="newPassword"
    issues={resetPassword.fields._newPassword.issues()}
    label="New Password"
  >
    {#snippet children({ errorId })}
      <Input
        id="newPassword"
        minlength={6}
        required
        aria-describedby={errorId}
        {...resetPassword.fields._newPassword.as("password")}
      />
    {/snippet}
  </FormField>
  <FormField
    forId="confirmPassword"
    issues={resetPassword.fields._confirmPassword.issues()}
    label="Confirm Password"
  >
    {#snippet children({ errorId })}
      <Input
        id="confirmPassword"
        minlength={6}
        required
        aria-describedby={errorId}
        {...resetPassword.fields._confirmPassword.as("password")}
      />
    {/snippet}
  </FormField>
  {#snippet submit({ pending })}
    <LoaderButton {pending} variant="auth">Update my password!</LoaderButton>
  {/snippet}
  {#snippet footer()}
    <p
      class={css({
        marginBlockStart: 4,
        textAlign: "center",
        fontSize: "sm",
        color: "white",
      })}
    >
      <a
        class={css({ textDecoration: { base: "underline", _hover: "none" } })}
        href={resolve("login")}>I'm ready to login</a
      >
    </p>
  {/snippet}
</Form>
