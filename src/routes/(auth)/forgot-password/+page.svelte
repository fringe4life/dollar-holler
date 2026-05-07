<script lang="ts">
  import { css } from "styled-system/css";
  import { resolve } from "$app/paths";
  import Alert from "$lib/components/Alert.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import { authHeading } from "$lib/styles";
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
      label="Email Address"
      forId="email"
      labelClass={css({ color: "goldenFizz" })}
    >
      <Input
        value={form?.email ?? ""}
        type="email"
        name="email"
        id="email"
        placeholder="john@email.com"
      />
    </FormField>

    <Button variant="auth" type="submit">Send me a reset email!</Button>
    <p
      class={css({ marginBlockStart: 4, textAlign: "center", fontSize: "sm", color: "white" })}
    >
      <a
        href={resolve("/login")}
        class={css({ textDecoration: "underline", _hover: { textDecoration: "none" } })}
        >Ready to login?</a
      >
    </p>
  {/if}
</form>
