<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { between } from "#styled-system/patterns/index.js";
  import { resolve } from "$app/paths";
  import { login } from "#features/auth/auth.remote.ts";
  import { authHeading } from "#features/auth/styles.ts";
  import Form from "#lib/components/form/Form.svelte";
  import FormField from "#lib/components/form/FormField.svelte";
  import LoaderButton from "#lib/components/ui/button/LoaderButton.svelte";
  import Input from "#lib/components/ui/input/Input.svelte";
  import Label from "#lib/components/ui/label/Label.svelte";
</script>

<svelte:head>
  <title>Log in to Dollar Holler invoices</title>
  <meta
    content="Sign in to Dollar Holler to create invoices, track payments, and manage your clients."
    name="description"
  />
</svelte:head>

<h1 class={authHeading}>Login</h1>

<Form remote={login}>
  <FormField
    forId="email"
    issues={login.fields.email.issues()}
    label="Email"
    labelClass={css({ color: "goldenFizz" })}
  >
    {#snippet children({ errorId })}
      <Input
        id="email"
        placeholder="john@email.com"
        required
        aria-describedby={errorId}
        {...login.fields.email.as("email")}
      />
    {/snippet}
  </FormField>
  <FormField forId="password" issues={login.fields._password.issues()}>
    {#snippet children({ errorId })}
      <div class={between()}>
        <Label class={css({ color: "goldenFizz" })} for="password"
          >Password</Label
        >
        <a
          class={css({
            color: "whisper",
            fontSize: "sm",
            textDecoration: { base: "underline", _hover: "none" },
          })}
          href={resolve("forgot-password")}>Forgot Password</a
        >
      </div>
      <Input
        id="password"
        minlength={6}
        required
        aria-describedby={errorId}
        {...login.fields._password.as("password")}
      />
    {/snippet}
  </FormField>
  {#snippet submit({ pending })}
    <LoaderButton {pending} variant="auth">Let's do this!</LoaderButton>
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
        href={resolve("signup")}>Don't have an account yet?</a
      >
    </p>
  {/snippet}
</Form>
