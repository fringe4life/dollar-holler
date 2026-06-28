import { createToaster } from "@ark-ui/svelte/toast";
import { pickDefined } from "$lib/utils/strip-nullish-entries";

interface ToastOptions {
  closable?: boolean;
  description?: string;
  duration?: number;
  id?: string;
}

type ToastKind = "success" | "error" | "info" | "warning";

const toToastPayload = (title: string, options?: ToastOptions) => ({
  title,
  ...pickDefined(options ?? {}),
});

export const toaster = createToaster({
  placement: "bottom-end",
  max: 4,
  offsets: "1rem",
  pauseOnPageIdle: true,
});

const notify = (kind: ToastKind, title: string, options?: ToastOptions) =>
  toaster[kind](toToastPayload(title, options));

export const toast = {
  success: (title: string, options?: ToastOptions) =>
    notify("success", title, options),
  error: (title: string, options?: ToastOptions) =>
    notify("error", title, options),
  info: (title: string, options?: ToastOptions) =>
    notify("info", title, options),
  warning: (title: string, options?: ToastOptions) =>
    notify("warning", title, options),
  dismiss: (id?: string) => toaster.dismiss(id),
};
