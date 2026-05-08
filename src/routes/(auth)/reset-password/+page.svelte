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
    <FormField label="New Password" forId="newPassword">
      <Input type="password" name="newPassword" id="newPassword" />
    </FormField>
    <FormField label="Confirm Password" forId="confirmPassword">
      <Input type="password" name="confirmPassword" id="confirmPassword" />
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
        href={resolve("/login")}
        class={css({ textDecoration: { base:"underline", _hover: "none" }})}
        >I'm ready to login</a
      >
    </p>
  {/snippet}
</Form>
