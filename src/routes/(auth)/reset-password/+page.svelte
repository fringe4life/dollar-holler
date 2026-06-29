<script lang="ts">
  import { css } from "styled-system/css";
  import { resolve } from "$app/paths";
  import { authHeading } from "$features/auth/styles";
  import Form from "$lib/components/Form.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<h1 class={authHeading}>Reset my Password</h1>

<Form {form} method="POST">
  {#snippet children()}
    <FormField forId="newPassword" label="New Password">
      <Input id="newPassword" name="newPassword" type="password" />
    </FormField>
    <FormField forId="confirmPassword" label="Confirm Password">
      <Input id="confirmPassword" name="confirmPassword" type="password" />
    </FormField>
  {/snippet}
  {#snippet submit()}
    Update my password!
  {/snippet}
  {#snippet footer()}
    <p
      class={css({ marginBlockStart: 4, textAlign: "center", fontSize: "sm", color: "white" })}
    >
      <a
        class={css({ textDecoration: { base:"underline", _hover: "none" }})}
        href={resolve("/login", {})}
        >I'm ready to login</a
      >
    </p>
  {/snippet}
</Form>
