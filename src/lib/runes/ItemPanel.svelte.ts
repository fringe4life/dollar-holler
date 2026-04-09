import type { Maybe } from "$lib/types";
import { Toggle } from "./Toggle.svelte";

/**
 * Generic panel/modal state for a single selected item.
 * Composes with Toggle for open/close state; clears item when closed.
 *
 * Example (edit panel):
 *   const editPanel = new ItemPanel<InvoiceSelect>();
 *   <SlidePanel bind:open={editPanel.toggle.isOn}>
 *   handleEdit = (invoice) => editPanel.open(invoice);
 *
 * Example (delete modal):
 *   const deleteModal = new ItemPanel<InvoiceListResponse>();
 *   <ConfirmDelete bind:open={deleteModal.toggle.isOn} ... />
 *   handleDeleteClick = (invoice) => deleteModal.open(invoice);
 */
export class ItemPanel<T> {
  toggle = new Toggle();
  item = $state<Maybe<T>>(undefined);

  open = (item: T) => {
    this.item = item;
    this.toggle.on();
  };

  close = () => {
    this.toggle.off();
    this.item = null;
  };
}
