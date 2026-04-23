<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import {
    computeSettingsEditableDelta,
    pickSettingsEditableSnapshot,
  } from "$features/settings/settings-diff";
  import type {
    SettingsEditableSnapshot,
    SettingsSelect,
  } from "$features/settings/types";
  import Form from "$lib/components/Form.svelte";
  import Check from "$lib/components/icons/Check.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";

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

<section
  class="col-span-12 px-4 pbs-4 md:col-span-8 md:col-start-4 md:pbs-20 lg:col-span-6 lg:col-start-5"
>
  <h2 class="text-daisyBush mbe-1 text-3xl font-black">Invoice Details</h2>
  <p class="mbe-8">This information gets included on each invoice.</p>

  <form class="grid grid-cols-6 gap-x-5">
    <div class="field col-span-6 md:col-span-3">
      <label for="myName">Name</label>
      <input
        type="text"
        name="myName"
        id="myName"
        bind:value={mySettings.myName}
      >
    </div>
    <div class="field col-span-6 md:col-span-3">
      <label for="invoiceEmail">Email (shown on invoices)</label>
      <input
        type="email"
        name="invoiceEmail"
        id="invoiceEmail"
        bind:value={mySettings.email}
      >
    </div>
    <div class="field col-span-6">
      <label for="address">Address</label>
      <input
        type="text"
        name="address"
        id="address"
        bind:value={mySettings.street}
      >
    </div>
    <div class="field col-span-6 md:col-span-2">
      <label for="city">City</label>
      <input type="text" name="city" id="city" bind:value={mySettings.city}>
    </div>
    <div class="field col-span-6 md:col-span-2">
      <label for="state">State</label>
      <States bind:value={mySettings.state} />
    </div>
    <div class="field col-span-6 md:col-span-2">
      <label for="zip">Zip</label>
      <input type="text" name="zip" id="zip" bind:value={mySettings.zip}>
    </div>
    <div class="field col-span-6 justify-self-end md:col-span-2 md:col-start-5">
      <Button onclick={saveSettings}><Check /> Save</Button>
    </div>
  </form>
  <div class="col-span-6">
    <h2 class="text-daisyBush mbe-1 text-3xl font-black">
      Update Account Information
    </h2>
    <p class="mbe-8">This information is used to access your account.</p>
  </div>
  <Form {form} onSuccess={handlePasswordSuccess}>
    {#snippet children()}
      <div class="grid grid-cols-6 gap-x-5">
        <div class="field col-span-6 md:col-span-3">
          <label for="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            defaultValue={form?.email ?? ""}
          >
        </div>

        <div class="field col-span-6 md:col-span-3">
          <label for="currentPassword">Current Password</label>
          <input type="password" name="currentPassword" id="currentPassword">
        </div>

        <div class="field col-span-6 md:col-span-3">
          <label for="newPassword">New Password</label>
          <input type="password" name="newPassword" id="newPassword">
        </div>

        <div class="field col-span-6 md:col-span-3">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" name="confirmPassword" id="confirmPassword">
        </div>
      </div>
    {/snippet}
    {#snippet submit()}
      <Check />
      Save
    {/snippet}
  </Form>
</section>
