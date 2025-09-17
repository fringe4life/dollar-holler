import type { Settings } from "$lib/db/schema";
import { toast } from "svelte-sonner";

class SettingsStore {
  private _settings = $state<Settings | null>(null);
  private _loading = $state(false);
  private _error = $state<string | null>(null);

  // Getters for reactive state
  get settings() {
    return this._settings;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }

  get isLoaded() {
    return this._settings !== null;
  }

  // Load settings from API
  async loadSettings() {
    this._loading = true;
    this._error = null;
    
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to load settings");
      }
      const settingsData = await response.json();

      // Update the reactive state
      this._settings = settingsData;
    } catch (error) {
      console.error("Error loading settings:", error);
      this._error = error instanceof Error ? error.message : "Failed to load settings";
      toast.error("Failed to load settings");
    } finally {
      this._loading = false;
    }
  }

  // Update settings via API
  async updateSettings(settingsToUpdate: Settings) {
    this._loading = true;
    this._error = null;

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
      this._settings = settingsToUpdate;
      toast.success("Settings updated successfully");
      return settingsToUpdate;
    } catch (error) {
      console.error("Error updating settings:", error);
      this._error = error instanceof Error ? error.message : "Failed to update settings";
      toast.error("Failed to update settings");
      throw error;
    } finally {
      this._loading = false;
    }
  }

  // Reset store state
  reset() {
    this._settings = null;
    this._loading = false;
    this._error = null;
  }
}

// Create and export a singleton instance
export const settingsStore = new SettingsStore();