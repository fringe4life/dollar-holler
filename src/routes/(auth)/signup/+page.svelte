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
        forId="name"
        label="Full Name"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input id="name" name="name" type="text" />
      </FormField>

      <FormField
        forId="email"
        label="Email"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input id="email" name="email" required type="email" />
      </FormField>
      <FormField
        forId="password"
        label="Password"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input id="password" name="password" required type="password" />
      </FormField>
      <FormField
        forId="confirmPassword"
        label="Confirm Password"
        labelClass={css({ color: "goldenFizz" })}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          required
          type="password"
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
          class={css({ textDecoration: { base: "underline", _hover: "none" }})}
          data-sveltekit-preload-data="hover"
          href={resolve("/login", {})}
          >Already have an account?</a
        >
      </p>
    {/snippet}
  </Form>
{:else}
  <Alert message="Check your email for confirmation" />
  <a class={buttonVariants({ variant: "auth" })} href={resolve("/login", {})}
    >Login</a
  >
{/if}
