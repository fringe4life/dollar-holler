import type { Attachment } from "svelte/attachments";
import {
  type DialogApi,
  dialogController,
} from "$lib/client/attachments/dialogController";
import type { Maybe } from "$lib/types";

/**
 * Generic panel/modal state for a single selected item.
 * Registers a dialog controller via `{@attach panel.attach}` — no raw element binding.
 *
 * Example (edit panel):
 *   const editPanel = new ItemPanel<InvoiceSelect>();
 *   <Modal {@attach editPanel.attach} onClose={editPanel.close}>
 *   handleEdit = (invoice) => editPanel.open(invoice);
 *
 * Example (delete modal):
 *   const deleteModal = new ItemPanel<InvoiceListResponse>();
 *   <ConfirmDelete {@attach deleteModal.attach} ... />
 *   handleDeleteClick = (invoice) => deleteModal.open(invoice);
 */
export class ItemPanel<T> {
  #api: DialogApi | undefined;

  item = $state<Maybe<T>>(null);

  readonly attach: Attachment<HTMLDialogElement> = dialogController((api) => {
    this.#api = api;
    return () => {
      if (this.#api === api) {
        this.#api = undefined;
      }
    };
  });

  open = (item: T) => {
    this.item = item;
    this.#api?.show();
  };

  close = () => {
    this.#api?.close();
    this.item = null;
  };
}
