<script lang="ts">
  import { css } from "styled-system/css";
  import { resolve } from "$app/paths";
  import { signup } from "$features/auth/auth.remote";
  import { authHeading } from "$features/auth/styles";
  import Form from "$lib/components/Form.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
</script>

<h1 class={authHeading}>Sign up</h1>
<Form remote={signup}>
  <FormField
    forId="name"
    label="Full Name"
    labelClass={css({ color: "goldenFizz" })}
  >
    <Input id="name" required type="text" {...signup.fields.name.as("text")} />
  </FormField>

  <FormField
    forId="email"
    label="Email"
    labelClass={css({ color: "goldenFizz" })}
  >
    <Input id="email" required {...signup.fields.email.as("email")} />
  </FormField>
  <FormField
    forId="password"
    label="Password"
    labelClass={css({ color: "goldenFizz" })}
  >
    <Input
      id="password"
      minlength={6}
      required
      {...signup.fields._password.as("password")}
    />
  </FormField>
  <FormField
    forId="confirmPassword"
    label="Confirm Password"
    labelClass={css({ color: "goldenFizz" })}
  >
    <Input
      id="confirmPassword"
      minlength={6}
      required
      {...signup.fields._confirmPassword.as("password")}
    />
  </FormField>
  {#snippet submit()}
    Count me in!
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
        href={resolve("/login")}>Already have an account?</a
      >
    </p>
  {/snippet}
</Form>
