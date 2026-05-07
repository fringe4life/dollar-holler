import { createToaster } from "@ark-ui/svelte/toast";

interface ToastOptions {
  closable?: boolean;
  description?: string;
  duration?: number;
  id?: string;
}

const toToastPayload = (title: string, options?: ToastOptions) => ({
  title,
  ...(options?.description === undefined
    ? {}
    : { description: options.description }),
  ...(options?.duration === undefined ? {} : { duration: options.duration }),
  ...(options?.id === undefined ? {} : { id: options.id }),
  ...(options?.closable === undefined ? {} : { closable: options.closable }),
});

export const toaster = createToaster({
  placement: "bottom-end",
  max: 4,
  offsets: "1rem",
  pauseOnPageIdle: true,
});

export const toast = {
  success: (title: string, options?: ToastOptions) =>
    toaster.success(toToastPayload(title, options)),
  error: (title: string, options?: ToastOptions) =>
    toaster.error(toToastPayload(title, options)),
  info: (title: string, options?: ToastOptions) =>
    toaster.info(toToastPayload(title, options)),
  warning: (title: string, options?: ToastOptions) =>
    toaster.warning(toToastPayload(title, options)),
  dismiss: (id?: string) => toaster.dismiss(id),
};
