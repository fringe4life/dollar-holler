<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { grid, gridItem } from "#styled-system/patterns/index.js";
  import { toast } from "svelte-sonner";
  import { changePassword } from "#features/auth/auth.remote.ts";
  import {
    getSettings,
    saveSettings,
  } from "#features/settings/settings.remote.ts";
  import Form from "#lib/components/form/Form.svelte";
  import FormField from "#lib/components/form/FormField.svelte";
  import Check from "#lib/components/icons/Check.svelte";
  import States from "#lib/components/States.svelte";
  import LoaderButton from "#lib/components/ui/button/LoaderButton.svelte";
  import Input from "#lib/components/ui/input/Input.svelte";
  import { buttonIcon } from "#lib/styles.ts";
  import Spinner from "#lib/components/Spinner.svelte";
  import { zipInputAttrs } from "#lib/utils/zip.ts";

  const loaded = await getSettings();

  const handleSettingsSuccess = () => {
    toast.success("Settings saved successfully");
  };

  const handlePasswordSuccess = () => {
    toast.success("Password changed successfully");
  };
</script>

<svelte:head>
  <title>Invoice settings | Dollar Holler</title>
  <meta
    content="Update your business details, invoice defaults, and password in Dollar Holler."
    name="description"
  />
</svelte:head>

<svelte:boundary>
  {#snippet pending()}
    <Spinner label="Loading settings…" />
  {/snippet}

  <h2
    class={css({
      color: "daisyBush",
      marginBlockEnd: 1,
      fontSize: "3xl",
      fontWeight: "black",
    })}
  >
    Invoice Details
  </h2>
  <p class={css({ marginBlockEnd: 8 })}>
    This information gets included on each invoice.
  </p>

  <Form onSuccess={handleSettingsSuccess} remote={saveSettings}>
    <div class={grid({ columns: 6, columnGap: 5 })}>
      <FormField
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
        forId="myName"
        issues={saveSettings.fields.myName.issues()}
        label="Name"
      >
        {#snippet children({ errorId })}
          <Input
            id="myName"
            aria-describedby={errorId}
            {...saveSettings.fields.myName.as("text", loaded?.myName ?? "")}
          />
        {/snippet}
      </FormField>
      <FormField
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
        forId="invoiceEmail"
        issues={saveSettings.fields.email.issues()}
        label="Email (shown on invoices)"
      >
        {#snippet children({ errorId })}
          <Input
            id="invoiceEmail"
            aria-describedby={errorId}
            {...saveSettings.fields.email.as("email", loaded?.email ?? "")}
          />
        {/snippet}
      </FormField>
      <FormField
        class={gridItem({ colSpan: 6 })}
        forId="address"
        issues={saveSettings.fields.street.issues()}
        label="Address"
      >
        {#snippet children({ errorId })}
          <Input
            id="address"
            aria-describedby={errorId}
            {...saveSettings.fields.street.as("text", loaded?.street ?? "")}
          />
        {/snippet}
      </FormField>
      <FormField
        class={gridItem({ colSpan: { base: 6, md: 2 } })}
        forId="city"
        issues={saveSettings.fields.city.issues()}
        label="City"
      >
        {#snippet children({ errorId })}
          <Input
            id="city"
            aria-describedby={errorId}
            {...saveSettings.fields.city.as("text", loaded?.city ?? "")}
          />
        {/snippet}
      </FormField>
      <FormField
        class={gridItem({ colSpan: { base: 6, md: 2 } })}
        forId="state"
        issues={saveSettings.fields.state.issues()}
        label="State"
      >
        {#snippet children({ errorId })}
          <States
            aria-describedby={errorId}
            {...saveSettings.fields.state.as("text", loaded?.state ?? "")}
          />
        {/snippet}
      </FormField>
      <FormField
        class={gridItem({ colSpan: { base: 6, md: 2 } })}
        forId="zip"
        issues={saveSettings.fields.zip.issues()}
        label="Zip"
      >
        {#snippet children({ errorId })}
          <Input
            id="zip"
            aria-describedby={errorId}
            {...zipInputAttrs}
            {...saveSettings.fields.zip.as("text", loaded?.zip ?? "")}
          />
        {/snippet}
      </FormField>
    </div>
    {#snippet submit({ pending })}
      <FormField
        class={gridItem({
          colSpan: { base: 6, md: 2 },
          gridColumnStart: { md: 5 },
        })}
      >
        <LoaderButton class="group" {pending}
          ><Check class={buttonIcon("check")} /> Save</LoaderButton
        >
      </FormField>
    {/snippet}
  </Form>
  <div class={gridItem({ colSpan: 6 })}>
    <h2
      class={css({
        color: "daisyBush",
        marginBlockEnd: 1,
        fontSize: "3xl",
        fontWeight: "black",
      })}
    >
      Update Account Information
    </h2>
    <p class={css({ marginBlockEnd: 8 })}>
      This information is used to access your account.
    </p>
  </div>
  <Form onSuccess={handlePasswordSuccess} remote={changePassword}>
    <div class={grid({ columns: 6, columnGap: 5 })}>
      <FormField
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
        forId="email"
        issues={changePassword.fields.email.issues()}
        label="Email"
      >
        {#snippet children({ errorId })}
          <Input
            id="email"
            required
            aria-describedby={errorId}
            {...changePassword.fields.email.as("email")}
          />
        {/snippet}
      </FormField>

      <FormField
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
        forId="currentPassword"
        issues={changePassword.fields._currentPassword.issues()}
        label="Current Password"
      >
        {#snippet children({ errorId })}
          <Input
            id="currentPassword"
            minlength={6}
            required
            aria-describedby={errorId}
            {...changePassword.fields._currentPassword.as("password")}
          />
        {/snippet}
      </FormField>

      <FormField
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
        forId="newPassword"
        issues={changePassword.fields._newPassword.issues()}
        label="New Password"
      >
        {#snippet children({ errorId })}
          <Input
            id="newPassword"
            minlength={6}
            required
            aria-describedby={errorId}
            {...changePassword.fields._newPassword.as("password")}
          />
        {/snippet}
      </FormField>

      <FormField
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
        forId="confirmPassword"
        issues={changePassword.fields._confirmPassword.issues()}
        label="Confirm Password"
      >
        {#snippet children({ errorId })}
          <Input
            id="confirmPassword"
            minlength={6}
            required
            aria-describedby={errorId}
            {...changePassword.fields._confirmPassword.as("password")}
          />
        {/snippet}
      </FormField>
    </div>
    {#snippet submit({ pending })}
      <LoaderButton class="group" {pending}
        ><Check class={buttonIcon("check")} /> Save</LoaderButton
      >
    {/snippet}
  </Form>
</svelte:boundary>
