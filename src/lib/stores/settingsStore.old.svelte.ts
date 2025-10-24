import type { SettingsResponse } from "$lib/validators";
import { settingsResponseSchema } from "$lib/validators";
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
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to load settings");
      }
      const rawData = await response.json();

      // Validate response with ArkType
      const validationResult = settingsResponseSchema(rawData);
      if (validationResult instanceof ArkErrors) {
        console.error(
          "Invalid settings data received:",
          validationResult.summary,
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
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsToUpdate),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
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
