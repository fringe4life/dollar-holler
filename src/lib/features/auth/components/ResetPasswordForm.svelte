<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { browser } from "$app/env";
  import { resolve } from "$app/paths";
  import { resetPassword as resetPasswordForm } from "#features/auth/auth.remote.ts";
  import Form from "#lib/components/patterns/form/Form.svelte";
  import FormField from "#lib/components/patterns/form/FormField.svelte";
  import LoaderButton from "#lib/components/primitives/button/LoaderButton.svelte";
  import Input from "#lib/components/primitives/input/Input.svelte";

  interface Props {
    /** From page load (`?token=`); required for native submit before/without wake. */
    token?: string;
  }

  let { token: tokenProp = "" }: Props = $props();

  // Per-mount instance. Drop `.for()` when sveltejs/kit#14802 is fixed.
  const uid = $props.id();
  const resetPassword = resetPasswordForm.for(uid);
  const token = $derived(
    browser
      ? (new URL(globalThis.location.href).searchParams.get("token") ??
          tokenProp)
      : tokenProp
  );
</script>

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
        color: "authForeground",
      })}
    >
      <a
        class={css({ textDecoration: { base: "underline", _hover: "none" } })}
        href={resolve("login")}>I'm ready to login</a
      >
    </p>
  {/snippet}
</Form>
