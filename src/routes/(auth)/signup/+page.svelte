<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { resolve } from "$app/paths";
  import { signup } from "#features/auth/auth.remote.ts";
  import { authHeading } from "#features/auth/styles.ts";
  import Form from "#lib/components/form/Form.svelte";
  import FormField from "#lib/components/form/FormField.svelte";
  import LoaderButton from "#lib/components/ui/button/LoaderButton.svelte";
  import Input from "#lib/components/ui/input/Input.svelte";
</script>

<svelte:head>
  <title>Create your Dollar Holler account</title>
  <meta
    content="Sign up for Dollar Holler to send professional invoices and manage clients from one dashboard."
    name="description"
  />
</svelte:head>

<h1 class={authHeading}>Sign up</h1>
<Form remote={signup}>
  <FormField
    forId="name"
    issues={signup.fields.name.issues()}
    label="Full Name"
    labelClass={css({ color: "goldenFizz" })}
  >
    {#snippet children({ errorId })}
      <Input
        id="name"
        required
        type="text"
        aria-describedby={errorId}
        {...signup.fields.name.as("text")}
      />
    {/snippet}
  </FormField>

  <FormField
    forId="email"
    issues={signup.fields.email.issues()}
    label="Email"
    labelClass={css({ color: "goldenFizz" })}
  >
    {#snippet children({ errorId })}
      <Input
        id="email"
        required
        aria-describedby={errorId}
        {...signup.fields.email.as("email")}
      />
    {/snippet}
  </FormField>
  <FormField
    forId="password"
    issues={signup.fields._password.issues()}
    label="Password"
    labelClass={css({ color: "goldenFizz" })}
  >
    {#snippet children({ errorId })}
      <Input
        id="password"
        minlength={6}
        required
        aria-describedby={errorId}
        {...signup.fields._password.as("password")}
      />
    {/snippet}
  </FormField>
  <FormField
    forId="confirmPassword"
    issues={signup.fields._confirmPassword.issues()}
    label="Confirm Password"
    labelClass={css({ color: "goldenFizz" })}
  >
    {#snippet children({ errorId })}
      <Input
        id="confirmPassword"
        minlength={6}
        required
        aria-describedby={errorId}
        {...signup.fields._confirmPassword.as("password")}
      />
    {/snippet}
  </FormField>
  {#snippet submit({ pending })}
    <LoaderButton {pending} variant="auth">Count me in!</LoaderButton>
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
        data-sveltekit-preload-data="hover"
        href={resolve("login")}>Already have an account?</a
      >
    </p>
  {/snippet}
</Form>
