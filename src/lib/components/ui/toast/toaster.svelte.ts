import { createContext } from "svelte";
import type { Attachment } from "svelte/attachments";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

const TOAST_MAX = 3;
const TOAST_DURATION_MS = 3_000;
/** Fallback if `transitionend` does not fire (prefers-reduced-motion, etc.). */
const TOAST_EXIT_MS = 250;

export type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
  description?: string;
  duration?: number;
};
// fallow-ignore-next-line
export type ToastItem = {
  description?: string;
  id: string;
  title: string;
  type: ToastType;
};

type PauseReason = "hidden" | "hover";

export const [getToast, setToast] = createContext<Toaster>();

export const toastElementId = (id: string): string => `toast-${id}`;

export function createToaster({
  duration = TOAST_DURATION_MS,
  max = TOAST_MAX,
}: {
  duration?: number;
  max?: number;
} = {}): Toaster {
  return new Toaster({ duration, max });
}

/**
 * Queue + timers for toast popovers.
 *
 * Limitation: each toast is `popover="manual"` in the page top layer. A modal
 * `<dialog>` (`showModal()`) makes the rest of the document inert, so toasts
 * that fire while a form dialog is open are visible but not interactive to
 * keyboard/AT until the dialog closes. Call sites today toast after close.
 */
class Toaster {
  readonly duration: number;
  readonly max: number;

  items = $state<ToastItem[]>([]);

  #closing = new SvelteSet<string>();
  #els = new SvelteMap<string, HTMLElement>();
  #id = 0;
  #pauseReasons = new SvelteSet<PauseReason>();
  #remaining = new SvelteMap<string, number>();
  #startedAt = new SvelteMap<string, number>();
  #timers = new SvelteMap<string, ReturnType<typeof setTimeout>>();

  constructor({
    duration = TOAST_DURATION_MS,
    max = TOAST_MAX,
  }: {
    duration?: number;
    max?: number;
  } = {}) {
    this.duration = duration;
    this.max = max;
  }

  /**
   * Bind a toast popover node: show it, listen for hide (invoker / timeout),
   * then unmount after the CSS exit transition.
   */
  connect =
    (id: string): Attachment<HTMLElement> =>
    (element) => {
      this.#els.set(id, element);
      element.showPopover();

      const unmount = (): void => {
        this.#unmount(id);
      };

      const onToggle = (event: Event): void => {
        if (!(event instanceof ToggleEvent) || event.newState !== "closed") {
          return;
        }

        this.#closing.add(id);
        this.#clearClock(id);

        const onEnd = (transitionEvent: TransitionEvent): void => {
          if (transitionEvent.target !== element) {
            return;
          }
          if (
            transitionEvent.propertyName !== "opacity" &&
            transitionEvent.propertyName !== "display"
          ) {
            return;
          }
          element.removeEventListener("transitionend", onEnd);
          unmount();
        };

        element.addEventListener("transitionend", onEnd);
        window.setTimeout(unmount, TOAST_EXIT_MS);
      };

      element.addEventListener("toggle", onToggle);

      return () => {
        element.removeEventListener("toggle", onToggle);
        this.#els.delete(id);
      };
    };

  success = (title: string, options?: ToastOptions): string =>
    this.#push("success", title, options);

  error = (title: string, options?: ToastOptions): string =>
    this.#push("error", title, options);

  warning = (title: string, options?: ToastOptions): string =>
    this.#push("warning", title, options);

  info = (title: string, options?: ToastOptions): string =>
    this.#push("info", title, options);

  dismiss = (id: string): void => {
    if (!this.items.some((item) => item.id === id) || this.#closing.has(id)) {
      return;
    }

    this.#closing.add(id);
    this.#clearClock(id);
    const element = this.#els.get(id);
    if (element === undefined) {
      this.#unmount(id);
      return;
    }

    element.hidePopover();
  };

  pause = (reason: PauseReason): void => {
    const wasPaused = this.#pauseReasons.size > 0;
    this.#pauseReasons.add(reason);
    if (!wasPaused) {
      this.#stopClocks();
    }
  };

  resume = (reason: PauseReason): void => {
    this.#pauseReasons.delete(reason);
    if (this.#pauseReasons.size === 0) {
      this.#startClocks();
    }
  };

  setHidden = (hidden: boolean): void => {
    if (hidden) {
      this.pause("hidden");
      return;
    }
    this.resume("hidden");
  };

  #push = (type: ToastType, title: string, options?: ToastOptions): string => {
    const id = String(++this.#id);
    const duration = options?.duration ?? this.duration;

    this.items = [
      {
        description: options?.description,
        id,
        title,
        type,
      },
      ...this.items,
    ];
    this.#remaining.set(id, duration);

    if (this.#pauseReasons.size === 0) {
      this.#arm(id);
    }

    this.#overflow();
    return id;
  };

  #overflow = (): void => {
    const active = this.items.filter((item) => !this.#closing.has(item.id));
    while (active.length > this.max) {
      const oldest = active.at(-1);
      if (oldest === undefined) {
        break;
      }
      active.pop();
      this.dismiss(oldest.id);
    }
  };

  #arm = (id: string): void => {
    const remaining = this.#remaining.get(id);
    if (remaining === undefined) {
      return;
    }

    this.#startedAt.set(id, Date.now());
    this.#timers.set(
      id,
      setTimeout(() => {
        this.dismiss(id);
      }, remaining)
    );
  };

  #stopClocks = (): void => {
    const now = Date.now();
    for (const [id, handle] of this.#timers) {
      clearTimeout(handle);
      const started = this.#startedAt.get(id);
      const remaining = this.#remaining.get(id);
      if (started !== undefined && remaining !== undefined) {
        this.#remaining.set(id, Math.max(0, remaining - (now - started)));
      }
    }
    this.#timers.clear();
    this.#startedAt.clear();
  };

  #startClocks = (): void => {
    for (const item of this.items) {
      if (!this.#closing.has(item.id)) {
        this.#arm(item.id);
      }
    }
  };

  #clearClock = (id: string): void => {
    const handle = this.#timers.get(id);
    if (handle !== undefined) {
      clearTimeout(handle);
    }
    this.#timers.delete(id);
    this.#startedAt.delete(id);
    this.#remaining.delete(id);
  };

  #unmount = (id: string): void => {
    if (!this.items.some((item) => item.id === id)) {
      return;
    }

    this.#closing.delete(id);
    this.#clearClock(id);
    this.#els.delete(id);
    this.items = this.items.filter((item) => item.id !== id);
  };
}
