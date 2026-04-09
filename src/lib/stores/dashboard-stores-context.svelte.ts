import { createContext } from "svelte";
import type { ClientsStore } from "../features/clients/stores/clientsStore.svelte";
import type { InvoicesStore } from "../features/invoices/stores/invoicesStore.svelte";
import type { LineItemsStore } from "../features/line-items/stores/lineItemsStore.svelte";
import type { SettingsStore } from "../features/settings/stores/settingsStore.svelte";

export interface DashboardStores {
  clients: ClientsStore;
  invoices: InvoicesStore;
  lineItems: LineItemsStore;
  settings: SettingsStore;
}

export const [getDashboardStores, setDashboardStores] =
  createContext<DashboardStores>();
