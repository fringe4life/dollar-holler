import { client } from "$lib/client";
import type { Maybe } from "$lib/types";
import { getErrorMessage } from "$lib/utils/error-message";
import { unwrapTreaty } from "$lib/utils/unwrap";
import { toast } from "svelte-sonner";
import { LoadableListStoreBase } from "../../../stores/loadable-list-store-base.svelte";
import type { SettingsSelect } from "../types";

export class SettingsStore extends LoadableListStoreBase<SettingsSelect> {
  /** Single loaded row (settings are one row per user). */
  get settings(): Maybe<SettingsSelect> {
    return this.items[0];
  }

  /** Returns a blank Settings for forms (before load or when no settings exist). */
  newSettings(): SettingsSelect {
    const now = new Date();
    return {
      userId: "",
      myName: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      createdAt: now,
      updatedAt: now,
    };
  }

  // Load settings from API
  async loadSettings() {
    this.loading = true;
    this.error = null;

    const loadFallback = "Failed to load settings";
    try {
      const settingsData = await unwrapTreaty(client.api.settings.get(), {
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
  async updateSettings(settingsToUpdate: SettingsSelect) {
    this.loading = true;
    this.error = null;

    const updateFallback = "Failed to update settings";
    try {
      await unwrapTreaty(client.api.settings.put(settingsToUpdate), {
        fallbackMessage: updateFallback,
      });

      this.items.length = 0;
      this.items.push(settingsToUpdate);
      toast.success("Settings updated successfully");
      return settingsToUpdate;
    } catch (error) {
      const errorMessage = getErrorMessage(error, updateFallback);
      console.error("Error updating settings:", error);
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
