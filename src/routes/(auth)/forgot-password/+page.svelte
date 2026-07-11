<script lang="ts">
  import { css } from "styled-system/css";
  import { resolve } from "$app/paths";
  import { forgotPassword } from "$features/auth/auth.remote";
  import { authHeading } from "$features/auth/styles";
  import Alert from "$lib/components/Alert.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";

  const issues = $derived(forgotPassword.fields.allIssues() ?? []);
  const isLoading = $derived(forgotPassword.pending > 0);
</script>

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
      href={resolve("/login")}>Ready to login?</a
    >
  </p>
{:else}
  <form {...forgotPassword}>
    {#each issues as issue, index (index)}
      <Alert message={issue.message} />
    {/each}
    <FormField
      forId="email"
      label="Email Address"
      labelClass={css({ color: "goldenFizz" })}
    >
      <Input
        id="email"
        placeholder="john@email.com"
        required
        {...forgotPassword.fields.email.as("email")}
      />
    </FormField>

    <Button disabled={isLoading} type="submit" variant="auth">
      {#if isLoading}
        <Loader />
      {:else}
        Send me a reset email!
      {/if}
    </Button>
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
  </form>
{/if}
