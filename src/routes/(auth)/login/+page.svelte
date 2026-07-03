<script lang="ts">
  import { css } from "styled-system/css";
  import { between, flex } from "styled-system/patterns";
  import { resolve } from "$app/paths";
  import { authHeading } from "$features/auth/styles";
  import Form from "$lib/components/Form.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import Label from "$lib/components/ui/label/Label.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<h1 class={authHeading}>Login</h1>

<Form {form}>
  {#snippet children()}
    <FormField
      forId="email"
      label="Email"
      labelClass={css({ color: "goldenFizz" })}
    >
      <Input
        defaultValue={form?.email ?? ""}
        name="email"
        placeholder="john@email.com"
        required
        type="email"
      />
    </FormField>
    <FormField>
      <div class={between()}>
        <Label class={css({ color: "goldenFizz" })} for="password"
          >Password</Label
        >
        <a
          class={css({ color: "whisper", fontSize: "sm", textDecoration: { base: "underline", _hover: "none"} })}
          href={resolve("/forgot-password")}
          >Forgot Password</a
        >
      </div>
      <Input minlength={6} name="password" required type="password" />
    </FormField>
  {/snippet}
  {#snippet submit()}
    Let's do this!
  {/snippet}
  {#snippet footer()}
    <p
      class={css({ marginBlockStart: 4, textAlign: "center", fontSize: "sm", color: "white" })}
    >
      <a
        class={css({ textDecoration: {base: "underline", _hover: "none" } })}
        href={resolve("/signup")}
        >Don't have an account yet?</a
      >
    </p>
  {/snippet}
</Form>
