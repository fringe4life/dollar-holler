import type { Attachment } from "svelte/attachments";
import {
  type DialogApi,
  dialogController,
} from "#lib/client/attachments/dialogController.ts";
import type { Maybe } from "#lib/types.ts";

export type UpsertTarget<T> = { kind: "create" } | { kind: "edit"; item: T };

export const upsertKey = <T>(
  target: UpsertTarget<T>,
  ofItem: (item: T) => string
): string => (target.kind === "edit" ? ofItem(target.item) : "create");

/**
 * Generic panel/modal state for a single selected item.
 * Registers a dialog controller via `{@attach panel.attach}` — no raw element binding.
 *
 * Example (upsert panel):
 *   const formPanel = new ItemPanel<UpsertTarget<ClientSelect>>();
 *   <FormPanel attach={formPanel.attach} onClose={formPanel.close} ...>
 *   formPanel.open({ kind: "create" });
 *   formPanel.open({ kind: "edit", item: client });
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
