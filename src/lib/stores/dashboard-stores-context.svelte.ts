import { createContext } from "svelte";
import type { ClientsStore } from "./clientsStore.svelte";
import type { InvoicesStore } from "./invoicesStore.svelte";
import type { LineItemsStore } from "./lineItemsStore.svelte";
import type { SettingsStore } from "./settingsStore.svelte";

export interface DashboardStores {
  clients: ClientsStore;
  invoices: InvoicesStore;
  lineItems: LineItemsStore;
  settings: SettingsStore;
}

export const [getDashboardStores, setDashboardStores] =
  createContext<DashboardStores>();
