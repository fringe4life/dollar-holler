<script lang="ts">
  import { css } from "styled-system/css";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { resetPassword } from "$features/auth/auth.remote";
  import { authHeading } from "$features/auth/styles";
  import Form from "$lib/components/Form.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";

  const token = $derived(page.url.searchParams.get("token") ?? "");
</script>

<h1 class={authHeading}>Reset my Password</h1>

<Form remote={resetPassword}>
  <input {...resetPassword.fields.token.as("hidden", token)} />
  <FormField forId="newPassword" label="New Password">
    <Input
      id="newPassword"
      minlength={6}
      required
      {...resetPassword.fields._newPassword.as("password")}
    />
  </FormField>
  <FormField forId="confirmPassword" label="Confirm Password">
    <Input
      id="confirmPassword"
      minlength={6}
      required
      {...resetPassword.fields._confirmPassword.as("password")}
    />
  </FormField>
  {#snippet submit()}
    Update my password!
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
        href={resolve("/login")}>I'm ready to login</a
      >
    </p>
  {/snippet}
</Form>
