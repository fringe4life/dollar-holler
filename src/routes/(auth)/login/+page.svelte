<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { between } from "#styled-system/patterns/index.js";
  import { resolve } from "$app/paths";
  import { login } from "#features/auth/auth.remote.ts";
  import { authHeading } from "#features/auth/styles.ts";
  import Form from "#lib/components/Form.svelte";
  import FormField from "#lib/components/FormField.svelte";
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
    label="Email"
    labelClass={css({ color: "goldenFizz" })}
  >
    <Input
      id="email"
      placeholder="john@email.com"
      required
      {...login.fields.email.as("email")}
    />
  </FormField>
  <FormField>
    <div class={between()}>
      <Label class={css({ color: "goldenFizz" })} for="password">Password</Label
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
      {...login.fields._password.as("password")}
    />
  </FormField>
  {#snippet submit()}
    Let's do this!
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
