<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { resolve } from "$app/paths";
  import { forgotPassword } from "#features/auth/auth.remote.ts";
  import { authHeading } from "#features/auth/styles.ts";
  import Alert from "#lib/components/patterns/Alert.svelte";
  import Form from "#lib/components/patterns/form/Form.svelte";
  import FormField from "#lib/components/patterns/form/FormField.svelte";
  import LoaderButton from "#lib/components/primitives/button/LoaderButton.svelte";
  import Input from "#lib/components/primitives/input/Input.svelte";
</script>

<svelte:head>
  <title>Reset Dollar Holler account password</title>
  <meta
    content="Request a password reset email for your Dollar Holler invoice account."
    name="description"
  />
</svelte:head>

<h1 class={authHeading}>Forgot Password</h1>

{#if forgotPassword.result?.success}
  <Alert message="Check your email for the password reset link." />
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
      href={resolve("login")}>Ready to login?</a
    >
  </p>
{:else}
  <Form remote={forgotPassword}>
    <FormField
      forId="email"
      issues={forgotPassword.fields.email.issues()}
      label="Email Address"
      labelClass={css({ color: "goldenFizz" })}
    >
      {#snippet children({ errorId })}
        <Input
          id="email"
          placeholder="john@email.com"
          required
          aria-describedby={errorId}
          {...forgotPassword.fields.email.as("email")}
        />
      {/snippet}
    </FormField>
    {#snippet submit({ pending })}
      <LoaderButton {pending} variant="auth"
        >Send me a reset email!</LoaderButton
      >
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
          href={resolve("login")}>Ready to login?</a
        >
      </p>
    {/snippet}
  </Form>
{/if}
