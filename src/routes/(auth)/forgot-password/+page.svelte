<script lang="ts">
  import { css } from "styled-system/css";
  import { resolve } from "$app/paths";
  import { authHeading } from "$features/auth/styles";
  import Alert from "$lib/components/Alert.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<h1 class={authHeading}>Forgot Password</h1>

<form method="POST">
  {#if form?.success}
    <Alert message="Check your email for the password reset link." />
  {:else}
    <Alert message={form?.error || ""} />
    <FormField
      forId="email"
      label="Email Address"
      labelClass={css({ color: "goldenFizz" })}
    >
      <Input
        id="email"
        name="email"
        placeholder="john@email.com"
        type="email"
        value={form?.email ?? ""}
      />
    </FormField>

    <Button type="submit" variant="auth">Send me a reset email!</Button>
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
        href={resolve("/login")}>Ready to login?</a
      >
    </p>
  {/if}
</form>
