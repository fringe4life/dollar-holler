import type { Attachment } from "svelte/attachments";

export type DialogApi = {
  close: () => void;
  show: () => void;
};

/**
 * Registers a `{ show, close }` controller for an HTML `<dialog>`.
 * Prefer this over exposing the raw element to parents.
 */
export const dialogController =
  (
    onReady: (api: DialogApi) => void | (() => void)
  ): Attachment<HTMLDialogElement> =>
  (element) => {
    const api: DialogApi = {
      close: () => {
        element.close();
      },
      show: () => {
        element.showModal();
      },
    };

    const cleanup = onReady(api);
    return () => {
      cleanup?.();
    };
  };
