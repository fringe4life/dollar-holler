<script lang="ts">
  import { css, cx } from "styled-system/css";
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
  import Form from "$lib/components/Form.svelte";
  import FormField from "$lib/components/FormField.svelte";
  import Check from "$lib/components/icons/Check.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import { toast } from "$lib/utils/toast.svelte.js";

  const { form } = $props();

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

  function handlePasswordSuccess(result: { type: string; data?: unknown }) {
    if (
      result.type === "success" &&
      (result.data as { success?: boolean })?.success
    ) {
      toast.success("Password changed successfully");
    }
  }
</script>

<h2
  class={css({ color: "daisyBush", marginBlockEnd: 1, fontSize: "3xl", fontWeight: "black" })}
>
  Invoice Details
</h2>
<p class={css({ marginBlockEnd: 8 })}>
  This information gets included on each invoice.
</p>

<form class={grid({ columns: 6, columnGap: 5 })}>
  <FormField
    label="Name"
    forId="myName"
    class={gridItem({ colSpan: { base: 6, md: 3 } })}
  >
    <Input
      type="text"
      name="myName"
      id="myName"
      bind:value={mySettings.myName}
    />
  </FormField>
  <FormField
    label="Email (shown on invoices)"
    forId="invoiceEmail"
    class={gridItem({ colSpan: { base: 6, md: 3 } })}
  >
    <Input
      type="email"
      name="invoiceEmail"
      id="invoiceEmail"
      bind:value={mySettings.email}
    />
  </FormField>
  <FormField label="Address" forId="address" class={gridItem({ colSpan: 6 })}>
    <Input
      type="text"
      name="address"
      id="address"
      bind:value={mySettings.street}
    />
  </FormField>
  <FormField
    label="City"
    forId="city"
    class={gridItem({ colSpan: { base: 6, md: 2 } })}
  >
    <Input type="text" name="city" id="city" bind:value={mySettings.city} />
  </FormField>
  <FormField class={gridItem({ colSpan: { base: 6, md: 2 } })}>
    <label for="state">State</label>
    <States bind:value={mySettings.state} />
  </FormField>
  <FormField
    label="Zip"
    forId="zip"
    class={gridItem({ colSpan: { base: 6, md: 2 } })}
  >
    <Input type="text" name="zip" id="zip" bind:value={mySettings.zip} />
  </FormField>
  <FormField
    class={gridItem({ colSpan: { base: 6, md: 2 }, gridColumnStart: { md: 5 } })}
  >
    <Button onclick={saveSettings}><Check /> Save</Button>
  </FormField>
</form>
<div class={gridItem({ colSpan: 6 })}>
  <h2
    class={css({ color: "daisyBush", marginBlockEnd: 1, fontSize: "3xl", fontWeight: "black" })}
  >
    Update Account Information
  </h2>
  <p class={css({ marginBlockEnd: 8 })}>
    This information is used to access your account.
  </p>
</div>
<Form {form} onSuccess={handlePasswordSuccess}>
  {#snippet children()}
    <div class={grid({ columns: 6, columnGap: 5 })}>
      <FormField
        label="Email"
        forId="email"
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
      >
        <Input
          type="email"
          name="email"
          id="email"
          defaultValue={form?.email ?? ""}
        />
      </FormField>

      <FormField
        label="Current Password"
        forId="currentPassword"
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
      >
        <Input type="password" name="currentPassword" id="currentPassword" />
      </FormField>

      <FormField
        label="New Password"
        forId="newPassword"
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
      >
        <Input type="password" name="newPassword" id="newPassword" />
      </FormField>

      <FormField
        label="Confirm Password"
        forId="confirmPassword"
        class={gridItem({ colSpan: { base: 6, md: 3 } })}
      >
        <Input type="password" name="confirmPassword" id="confirmPassword" />
      </FormField>
    </div>
  {/snippet}
  {#snippet submit()}
    <Check />
    Save
  {/snippet}
</Form>
