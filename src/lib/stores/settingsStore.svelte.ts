import { client } from "$lib/client";
import {
  settingsSelectWithDatesSchema,
  type SettingsResponse,
} from "$lib/validators";
import { ArkErrors } from "arktype";
import { toast } from "svelte-sonner";

class SettingsStore {
  // Use $state for reactive class fields
  settings = $state<SettingsResponse | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  // Use $derived for computed values
  isLoaded = $derived(this.settings !== null);

  // Load settings from API
  async loadSettings() {
    this.loading = true;
    this.error = null;

    try {
      const { data: settingsData } = await client.api.settings.get();
      if (
        !settingsData ||
        (typeof settingsData === "object" && "error" in settingsData)
      ) {
        throw new Error(settingsData?.error || "Failed to load settings");
      }

      // Convert Date objects to ISO strings for validation
      const serializedData = {
        ...settingsData,
        createdAt:
          settingsData.createdAt instanceof Date
            ? settingsData.createdAt.toISOString()
            : settingsData.createdAt,
        updatedAt:
          settingsData.updatedAt instanceof Date
            ? settingsData.updatedAt.toISOString()
            : settingsData.updatedAt,
      };

      // Validate response with ArkType
      const validationResult = settingsSelectWithDatesSchema(serializedData);
      if (validationResult instanceof ArkErrors) {
        console.error(
          "Invalid settings data received:",
          validationResult.summary
        );
        throw new Error("Invalid settings data received from server");
      }

      // Update the reactive state
      this.settings = validationResult;
    } catch (error) {
      console.error("Error loading settings:", error);
      this.error =
        error instanceof Error ? error.message : "Failed to load settings";
      toast.error("Failed to load settings");
    } finally {
      this.loading = false;
    }
  }

  // Update settings via API
  async updateSettings(settingsToUpdate: SettingsResponse) {
    this.loading = true;
    this.error = null;

    try {
      const { data: settingsData } =
        await client.api.settings.put(settingsToUpdate);
      if (
        !settingsData ||
        (typeof settingsData === "object" && "error" in settingsData)
      ) {
        throw new Error(settingsData?.error || "Failed to update settings");
      }

      // Update the reactive state
      this.settings = settingsToUpdate;
      toast.success("Settings updated successfully");
      return settingsToUpdate;
    } catch (error) {
      console.error("Error updating settings:", error);
      this.error =
        error instanceof Error ? error.message : "Failed to update settings";
      toast.error("Failed to update settings");
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Reset store state
  reset() {
    this.settings = null;
    this.loading = false;
    this.error = null;
  }
}

// Create and export a singleton instance
export const settingsStore = new SettingsStore();
