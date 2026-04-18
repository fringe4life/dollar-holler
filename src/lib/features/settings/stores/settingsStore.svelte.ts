import { apiClient } from "$lib/api";
import { LoadableListStoreBase } from "$lib/stores/loadable-list-store-base.svelte";
import type { Maybe } from "$lib/types";
import { getErrorMessage } from "$lib/utils/error-message";
import { unwrapTreaty } from "$lib/utils/unwrap";
import { toast } from "svelte-sonner";
import type { SettingsInsert, SettingsSelect, SettingsUpdate } from "../types";

export class SettingsStore extends LoadableListStoreBase<SettingsSelect> {
  /** Single loaded row (settings are one row per user). */
  get settings(): Maybe<SettingsSelect> {
    return this.items.at(0);
  }

  /** Returns a blank Settings for forms (before load or when no settings exist). */
  newSettings(): SettingsSelect {
    return {
      myName: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zip: "",
    };
  }

  // Load settings from API
  async loadSettings() {
    this.loading = true;
    this.error = null;

    const loadFallback = "Failed to load settings";
    try {
      const settingsData = await unwrapTreaty(apiClient.settings.get(), {
        fallbackMessage: loadFallback,
      });

      this.items.length = 0;
      this.items.push(settingsData);
    } catch (error) {
      const errorMessage = getErrorMessage(error, loadFallback);
      console.error("Error loading settings:", error);
      this.error = errorMessage;
      toast.error(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  // Update settings via API
  async updateSettings(settingsToUpdate: SettingsUpdate) {
    this.loading = true;
    this.error = null;

    const updateFallback = "Failed to update settings";
    try {
      const updated = await unwrapTreaty(
        apiClient.settings.patch(settingsToUpdate),
        {
          fallbackMessage: updateFallback,
        }
      );
      this.items[0] = updated;
      toast.success("Settings updated successfully");
      return updated;
    } catch (error) {
      const errorMessage = getErrorMessage(error, updateFallback);
      console.error("Error updating settings:", error);
      this.error = errorMessage;
      toast.error(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  async createSettings(settingsToCreate: SettingsInsert) {
    this.loading = true;
    this.error = null;
    const createFallback = "Failed to create settings";
    try {
      const createdSettings = await unwrapTreaty(
        apiClient.settings.post(settingsToCreate),
        {
          fallbackMessage: createFallback,
        }
      );
      this.items.push(createdSettings);
      toast.success("Settings created successfully");
      return createdSettings;
    } catch (error) {
      const errorMessage = getErrorMessage(error, createFallback);
      console.error("Error creating settings:", error);
      this.error = errorMessage;
      toast.error(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  // Reset store state
  reset() {
    this.resetLoadableListState();
  }
}
