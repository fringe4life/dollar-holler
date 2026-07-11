<script lang="ts">
  import { css } from "styled-system/css";
  import { grid, gridItem } from "styled-system/patterns";
  import { onMount } from "svelte";
  import {
    computeSettingsEditableDelta,
    pickSettingsEditableSnapshot,
  } from "$features/settings/settings-diff";
  import type {
    SettingsEditableSnapshot,
    SettingsSelect,
  } from "$features/settings/types";
  import { changePassword } from "$features/auth/auth.remote";
  import Form from "$lib/components/Form.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Check from "$lib/components/icons/Check.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import { toast } from "$lib/utils/toast.svelte.js";

  const { settings: settingsStore } = getDashboardStores();

  let mySettings = $state<SettingsSelect>(settingsStore.newSettings());
  let isNewSettings = $state(false);
  /** Last saved invoice-details fields; used to send only PATCH deltas. */
  let baselineInvoiceDetails = $state<SettingsEditableSnapshot | null>(null);

  onMount(async () => {
    await settingsStore.loadSettings();
    if (settingsStore.items.length > 0) {
      mySettings = { ...settingsStore.items[0] };
      baselineInvoiceDetails = pickSettingsEditableSnapshot(mySettings);
      isNewSettings = false;
    } else {
      isNewSettings = true;
      baselineInvoiceDetails = null;
    }
  });

  const saveSettings = async () => {
    if (isNewSettings) {
      await settingsStore.createSettings(mySettings);
      if (settingsStore.settings) {
        mySettings = { ...settingsStore.settings };
        baselineInvoiceDetails = pickSettingsEditableSnapshot(mySettings);
        isNewSettings = false;
      }
      return;
    }

    if (!baselineInvoiceDetails) {
      baselineInvoiceDetails = pickSettingsEditableSnapshot(mySettings);
    }

    const delta = computeSettingsEditableDelta(
      baselineInvoiceDetails,
      pickSettingsEditableSnapshot(mySettings)
    );

    if (Object.keys(delta).length === 0) {
      toast.info("No changes to save");
      return;
    }

    await settingsStore.updateSettings(delta);
    if (settingsStore.settings) {
      mySettings = { ...settingsStore.settings };
    }
    baselineInvoiceDetails = pickSettingsEditableSnapshot(mySettings);
  };

  function handlePasswordSuccess() {
    toast.success("Password changed successfully");
  }
</script>

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

<form class={grid({ columns: 6, columnGap: 5 })}>
  <FormField
    class={gridItem({ colSpan: { base: 6, md: 3 } })}
    forId="myName"
    label="Name"
  >
    <Input
      id="myName"
      name="myName"
      type="text"
      bind:value={mySettings.myName}
    />
  </FormField>
  <FormField
    class={gridItem({ colSpan: { base: 6, md: 3 } })}
    forId="invoiceEmail"
    label="Email (shown on invoices)"
  >
    <Input
      id="invoiceEmail"
      name="invoiceEmail"
      type="email"
      bind:value={mySettings.email}
    />
  </FormField>
  <FormField class={gridItem({ colSpan: 6 })} forId="address" label="Address">
    <Input
      id="address"
      name="address"
      type="text"
      bind:value={mySettings.street}
    />
  </FormField>
  <FormField
    class={gridItem({ colSpan: { base: 6, md: 2 } })}
    forId="city"
    label="City"
  >
    <Input id="city" name="city" type="text" bind:value={mySettings.city} />
  </FormField>
  <FormField class={gridItem({ colSpan: { base: 6, md: 2 } })}>
    <label for="state">State</label>
    <States bind:value={mySettings.state} />
  </FormField>
  <FormField
    class={gridItem({ colSpan: { base: 6, md: 2 } })}
    forId="zip"
    label="Zip"
  >
    <Input id="zip" name="zip" type="text" bind:value={mySettings.zip} />
  </FormField>
  <FormField
    class={gridItem({
      colSpan: { base: 6, md: 2 },
      gridColumnStart: { md: 5 },
    })}
  >
    <Button onclick={saveSettings}><Check /> Save</Button>
  </FormField>
</form>
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
      label="Email"
    >
      <Input id="email" required {...changePassword.fields.email.as("email")} />
    </FormField>

    <FormField
      class={gridItem({ colSpan: { base: 6, md: 3 } })}
      forId="currentPassword"
      label="Current Password"
    >
      <Input
        id="currentPassword"
        minlength={6}
        required
        {...changePassword.fields._currentPassword.as("password")}
      />
    </FormField>

    <FormField
      class={gridItem({ colSpan: { base: 6, md: 3 } })}
      forId="newPassword"
      label="New Password"
    >
      <Input
        id="newPassword"
        minlength={6}
        required
        {...changePassword.fields._newPassword.as("password")}
      />
    </FormField>

    <FormField
      class={gridItem({ colSpan: { base: 6, md: 3 } })}
      forId="confirmPassword"
      label="Confirm Password"
    >
      <Input
        id="confirmPassword"
        minlength={6}
        required
        {...changePassword.fields._confirmPassword.as("password")}
      />
    </FormField>
  </div>
  {#snippet submit()}
    <Check />
    Save
  {/snippet}
</Form>
