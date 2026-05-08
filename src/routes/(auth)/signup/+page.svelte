<script lang="ts">
  import { css } from "styled-system/css";
  import { resolve } from "$app/paths";
  import { authHeading } from "$features/auth/styles";
  import Alert from "$lib/components/Alert.svelte";
  import Form from "$lib/components/Form.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import { buttonVariants } from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();

  let isFormShowing = $state<boolean>(true);
</script>

{#if isFormShowing}
  <h1 class={authHeading}>Sign up</h1>
  <Form {form}>
    {#snippet children()}
      <FormField
        label="Full Name"
        forId="name"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input type="text" name="name" id="name" />
      </FormField>

      <FormField
        label="Email"
        forId="email"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input type="email" name="email" id="email" required />
      </FormField>
      <FormField
        label="Password"
        forId="password"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input type="password" name="password" id="password" required />
      </FormField>
      <FormField
        label="Confirm Password"
        forId="confirmPassword"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          required
        />
      </FormField>
    {/snippet}
    {#snippet submit()}
      Count me in!
    {/snippet}
    {#snippet footer()}
      <p
        class={css({ marginBlockStart: 4, textAlign: "center", fontSize: "sm", color: "white" })}
      >
        <a
          href={resolve("/login")}
          class={css({ textDecoration: { base: "underline", _hover: "none" }})}
          data-sveltekit-preload-data="hover"
          >Already have an account?</a
        >
      </p>
    {/snippet}
  </Form>
{:else}
  <Alert message="Check your email for confirmation" />
  <a href={resolve("/login")} class={buttonVariants({ variant: "auth" })}
    >Login</a
  >
{/if}
