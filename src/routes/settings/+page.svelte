<script lang="ts">
  import { enhance } from "$app/forms";
  import Alert from "$lib/components/Alert.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Check from "$lib/icon/Check.svelte";
  import { settingsStore } from "$lib/stores/settingsStore.svelte";
  import type { SettingsResponse } from "$lib/validators";
  import { onMount } from "svelte";

  const { data, form } = $props();

  let isPasswordLoading = $state(false);

  let mySettings = $state<SettingsResponse>(settingsStore.newSettings());
  onMount(async () => {
    await settingsStore.loadSettings();
    if (settingsStore.settings) {
      mySettings = { ...settingsStore.settings };
    }
  });

  const saveSettings = async () => {
    await settingsStore.updateSettings(mySettings);
  };
</script>

<div class="bg-whisper grid min-h-dvh grid-cols-12 md:gap-x-16">
  <Navbar user={data?.user} />
  <main
    class="col-span-12 px-4 pt-4 md:col-span-8 md:col-start-4 md:pt-20 lg:col-span-6 lg:col-start-5"
  >
    <h2>Invoice Details</h2>
    <p class="mb-8">This information gets included on each invoice.</p>

    <form class="grid grid-cols-6 gap-x-5">
      <div class="field col-span-6 md:col-span-3">
        <label for="myName">Name</label>
        <input
          type="text"
          name="myName"
          id="myName"
          bind:value={mySettings.myName}
        />
      </div>
      <div class="field col-span-6 md:col-span-3">
        <label for="invoiceEmail">Email (shown on invoices)</label>
        <input
          type="email"
          name="invoiceEmail"
          id="invoiceEmail"
          bind:value={mySettings.email}
        />
      </div>
      <div class="field col-span-6">
        <label for="address">Address</label>
        <input
          type="text"
          name="address"
          id="address"
          bind:value={mySettings.street}
        />
      </div>
      <div class="field col-span-6 md:col-span-2">
        <label for="city">City</label>
        <input type="text" name="city" id="city" bind:value={mySettings.city} />
      </div>
      <div class="field col-span-6 md:col-span-2">
        <label for="state">State</label>
        <States bind:value={mySettings.state} />
      </div>
      <div class="field col-span-6 md:col-span-2">
        <label for="zip">Zip</label>
        <input type="text" name="zip" id="zip" bind:value={mySettings.zip} />
      </div>
      <div
        class="field col-span-6 justify-self-end md:col-span-2 md:col-start-5"
      >
        <Button onclick={saveSettings}><Check /> Save</Button>
      </div>
    </form>
    <div class="col-span-6">
      <h2>Update Account Information</h2>
      <p class="mb-8">This information is used to access your account.</p>
    </div>
    <form
      method="POST"
      class="grid grid-cols-6 gap-x-5"
      use:enhance={() => {
        isPasswordLoading = true;
        return async ({ update }) => {
          isPasswordLoading = false;
          await update();
        };
      }}
    >
      <Alert message={form?.error} />
      <fieldset disabled={isPasswordLoading} class="contents">
        <div class="field col-span-6 md:col-span-3">
          <label for="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            defaultValue={form?.email ?? data?.user?.email}
          />
        </div>

        <div class="field col-span-6 md:col-span-3">
          <label for="currentPassword">Current Password</label>
          <input type="password" name="currentPassword" id="currentPassword" />
        </div>

        <div class="field col-span-6 md:col-span-3">
          <label for="newPassword">New Password</label>
          <input type="password" name="newPassword" id="newPassword" />
        </div>

        <div class="field col-span-6 md:col-span-3">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" name="confirmPassword" id="confirmPassword" />
        </div>
        <div class="field col-span-full justify-self-end">
          <Button variant="auth" type="submit" disabled={isPasswordLoading}>
            {#if isPasswordLoading}
              <Loader />
            {:else}
              <Check /> Save
            {/if}
          </Button>
        </div>
      </fieldset>
    </form>
  </main>
</div>

<style>
  @reference "../../app.css";
  h2 {
    @apply text-daisyBush mb-1 text-3xl font-black;
  }
</style>
