import { describe, expect, it } from "bun:test";
import { withViewTransition } from "./view-transition.ts";

interface StubTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

type StartViewTransition = (
  callbackOptions: ViewTransitionUpdateCallback | StartViewTransitionOptions
) => StubTransition;

const withDocument = async (
  startViewTransition: StartViewTransition | undefined,
  run: () => Promise<void>
): Promise<void> => {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document"
  );
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: startViewTransition === undefined ? {} : { startViewTransition },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {},
  });

  try {
    await run();
  } finally {
    if (originalDocument === undefined) {
      Reflect.deleteProperty(globalThis, "document");
    } else {
      Object.defineProperty(globalThis, "document", originalDocument);
    }
    if (originalWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      Object.defineProperty(globalThis, "window", originalWindow);
    }
  }
};

const capturedUpdate = (
  callbackOptions: ViewTransitionUpdateCallback | StartViewTransitionOptions
): ViewTransitionUpdateCallback | undefined =>
  typeof callbackOptions === "function"
    ? callbackOptions
    : (callbackOptions.update ?? undefined);

describe("withViewTransition", () => {
  it("runs update immediately when the API is unavailable", async () => {
    let updates = 0;

    await withDocument(undefined, () =>
      withViewTransition({
        update: () => {
          updates += 1;
        },
      })
    );

    expect(updates).toBe(1);
  });

  it("runs update inside a typed transition", async () => {
    let updates = 0;
    let receivedTypes: string[] | undefined;
    let transitionUpdate: ViewTransitionUpdateCallback | undefined;

    await withDocument(
      (callbackOptions) => {
        if (typeof callbackOptions !== "function") {
          receivedTypes = callbackOptions.types ?? undefined;
        }
        transitionUpdate = capturedUpdate(callbackOptions);
        return {
          ready: Promise.resolve(),
          finished: new Promise<void>(() => undefined),
          updateCallbackDone: Promise.resolve(),
        };
      },
      async () => {
        void withViewTransition({
          types: ["theme-change"],
          update: () => {
            updates += 1;
          },
        });
        expect(updates).toBe(0);
        await transitionUpdate?.();
      }
    );

    expect(receivedTypes).toEqual(["theme-change"]);
    expect(updates).toBe(1);
  });

  it("runs update when startViewTransition throws", async () => {
    let updates = 0;

    await withDocument(
      () => {
        throw new DOMException("Document hidden", "InvalidStateError");
      },
      () =>
        withViewTransition({
          update: () => {
            updates += 1;
          },
        })
    );

    expect(updates).toBe(1);
  });

  it("runs update when finished rejects before the callback applies", async () => {
    let updates = 0;

    await withDocument(
      () => ({
        ready: Promise.resolve(),
        finished: Promise.reject(new Error("update failed")),
        updateCallbackDone: Promise.resolve(),
      }),
      () =>
        withViewTransition({
          update: () => {
            updates += 1;
          },
        })
    );

    expect(updates).toBe(1);
  });

  it("reruns update when the callback throws and finished rejects", async () => {
    let updates = 0;
    let transitionUpdate: ViewTransitionUpdateCallback | undefined;
    const finished = Promise.withResolvers<void>();

    await withDocument(
      (callbackOptions) => {
        transitionUpdate = capturedUpdate(callbackOptions);
        return {
          ready: Promise.resolve(),
          finished: finished.promise,
          updateCallbackDone: Promise.resolve(),
        };
      },
      async () => {
        const pending = withViewTransition({
          update: () => {
            updates += 1;
            if (updates === 1) {
              throw new Error("update failed");
            }
          },
        });
        await transitionUpdate?.().catch(() => undefined);
        finished.reject(new Error("update failed"));
        await pending;
      }
    );

    expect(updates).toBe(2);
  });

  it("does not rerun update after the callback applied it", async () => {
    let updates = 0;
    let transitionUpdate: ViewTransitionUpdateCallback | undefined;
    const finished = Promise.withResolvers<void>();

    await withDocument(
      (callbackOptions) => {
        transitionUpdate = capturedUpdate(callbackOptions);
        return {
          ready: Promise.resolve(),
          finished: finished.promise,
          updateCallbackDone: Promise.resolve(),
        };
      },
      async () => {
        const pending = withViewTransition({
          types: ["forward"],
          update: () => {
            updates += 1;
          },
        });
        await transitionUpdate?.();
        finished.reject(new Error("skipped"));
        await pending;
      }
    );

    expect(updates).toBe(1);
  });

  it("swallows a skipped transition's ready rejection", async () => {
    let updates = 0;
    let transitionUpdate: ViewTransitionUpdateCallback | undefined;
    const finished = Promise.withResolvers<void>();
    const ready = Promise.reject(
      new DOMException("Transition was skipped", "AbortError")
    );

    await withDocument(
      (callbackOptions) => {
        transitionUpdate = capturedUpdate(callbackOptions);
        return {
          ready,
          finished: finished.promise,
          updateCallbackDone: Promise.resolve(),
        };
      },
      async () => {
        const pending = withViewTransition({
          update: () => {
            updates += 1;
          },
        });
        await transitionUpdate?.();
        finished.resolve();
        await pending;
      }
    );

    expect(updates).toBe(1);
  });
});
