import { tick } from "svelte";
import { supportsViewTransition } from "#lib/client/supports.ts";

export interface ViewTransitionOptions {
  /** DOM update. Runs inside the transition, or on its own when that cannot. */
  update: () => void | Promise<void>;
  /** Sets `:active-view-transition-type` for this transition. */
  types?: readonly string[];
}

const swallowTransitionSkip = (promise: Promise<void>): void => {
  void promise.catch(() => undefined);
};

/**
 * Same-document view transition around a DOM update.
 *
 * Svelte has no `<ViewTransition>` (React does). This is the manual
 * equivalent of Chrome's `transitionHelper`: the animation is an
 * enhancement. `update` still runs when the API is missing,
 * `startViewTransition` throws (hidden document), or `finished` rejects
 * because the callback never applied.
 *
 * `ready` rejects with `AbortError` when a transition is skipped or
 * superseded. That promise exists immediately, so a skip is swallowed
 * here and does not fail the update. `finished` rejects only when the
 * update callback failed; that path runs `update` again.
 */
export const withViewTransition = async ({
  update,
  types,
}: ViewTransitionOptions): Promise<void> => {
  if (!supportsViewTransition()) {
    await update();
    return;
  }

  let applied = false;

  const applyInsideTransition = async (): Promise<void> => {
    await update();
    applied = true;
    await tick();
  };

  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(
      types === undefined
        ? applyInsideTransition
        : {
            types: [...types],
            update: applyInsideTransition,
          }
    );
  } catch {
    await update();
    return;
  }

  // `ready` rejects on skip/supersede. `updateCallbackDone` rejects with the
  // callback. Both exist immediately and otherwise surface as unhandled
  // rejections. `finished` is awaited below so a failed callback can retry.
  swallowTransitionSkip(transition.ready);
  swallowTransitionSkip(transition.updateCallbackDone);

  try {
    await transition.finished;
  } catch {
    if (!applied) {
      await update();
    }
  }
};
