import type { Maybe } from "$lib/types";

/**
 * Generic panel/modal state for a single selected item.
 * Composes with Toggle for open/close state; clears item when closed.
 *
 * Example (edit panel):
 *   const editPanel = new ItemPanel<InvoiceSelect>();
 *   <SlidePanel bind:dialogEl={editPanel.dialogEl}>
 *   handleEdit = (invoice) => editPanel.open(invoice);
 *
 * Example (delete modal):
 *   const deleteModal = new ItemPanel<InvoiceListResponse>();
 *   <ConfirmDelete bind:dialogEl={deleteModal.dialogEl} ... />
 *   handleDeleteClick = (invoice) => deleteModal.open(invoice);
 */
export class ItemPanel<T> {
  dialogEl: HTMLDialogElement | undefined = $state();
  item = $state<Maybe<T>>(null);

  open = (item: T) => {
    this.item = item;
    this.dialogEl?.showModal();
  };

  close = () => {
    this.dialogEl?.close();
    this.item = null;
  };
}
