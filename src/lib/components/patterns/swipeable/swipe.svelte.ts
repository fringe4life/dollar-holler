import type { Attachment } from "svelte/attachments";
import { on } from "svelte/events";
import { Spring, type SpringOptions } from "svelte/motion";
import { supportsCssTypedOm } from "#lib/client/supports.ts";
import { getItemRowMdBreakpointPx } from "./item-row-breakpoint.ts";

interface SwipeConfig {
  getMaxInlineSize?: () => number;
  getTriggerReveal?: () => boolean;
  maxInlineSize?: number;
  onResetComplete?: () => void;
  onSwipeLeft?: () => void;
  onSwipeModeChange?: (swipeEnabled: boolean) => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

const SWIPE_REVEAL_RATIO = -0.95;
const DEFAULT_MAX_INLINE_SIZE = 448;
const INITIAL_SPRING_STATE = { x: 0, y: 0 };
const SPRING_CONFIG: SpringOptions = {
  damping: 0.4,
  stiffness: 0.2,
};

const transformElement = (x: number, element: HTMLElement): void => {
  if (supportsCssTypedOm) {
    element.attributeStyleMap.set(
      "transform",
      new CSSTranslate(CSS.px(x), CSS.px(0))
    );
    return;
  }
  element.style.transform = `translateX(${x}px)`;
};

/**
 * Enables horizontal swipe only while the row itself is narrower than the
 * button-row threshold. ResizeObserver keeps the behavior aligned with the
 * CSS container queries even when a sidebar changes the available width.
 */
export function swipe(config: SwipeConfig = {}): Attachment<HTMLElement> {
  const {
    getMaxInlineSize = getItemRowMdBreakpointPx,
    getTriggerReveal,
    maxInlineSize = DEFAULT_MAX_INLINE_SIZE,
    onResetComplete,
    onSwipeLeft,
    onSwipeModeChange,
    onSwipeRight,
    threshold = 20,
  } = config;

  const resolveMaxInlineSize = (): number =>
    getMaxInlineSize() ?? maxInlineSize;

  const spring = new Spring(INITIAL_SPRING_STATE, SPRING_CONFIG);

  return (element) => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let isSwipeEnabled = false;
    let elementWidth = 0;
    let documentCleanups: (() => void)[] = [];
    let startListenerCleanups: (() => void)[] = [];

    const reset = (): void => {
      spring.set(INITIAL_SPRING_STATE);
    };

    const clearCleanups = (cleanups: (() => void)[]): void => {
      for (const cleanup of cleanups) {
        cleanup();
      }
      cleanups.length = 0;
    };

    const clearDocumentListeners = (): void => {
      clearCleanups(documentCleanups);
    };

    function handleMouseMove(event: MouseEvent): void {
      if (!isDragging) {
        return;
      }

      const deltaX = event.clientX - currentX;
      currentX = event.clientX;
      spring.set({ x: spring.current.x + deltaX, y: 0 });
    }

    function handleTouchMove(event: TouchEvent): void {
      if (!isDragging) {
        return;
      }

      event.preventDefault();
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      const deltaX = touch.clientX - currentX;
      currentX = touch.clientX;
      spring.set({ x: spring.current.x + deltaX, y: 0 });
    }

    function handleSwipeEnd(): void {
      if (!isDragging) {
        return;
      }

      const movement = startX - currentX;
      const leftSnapX = elementWidth * SWIPE_REVEAL_RATIO;
      if (movement > threshold) {
        spring.set({ x: leftSnapX, y: 0 });
        onSwipeLeft?.();
      } else {
        reset();
        onSwipeRight?.();
      }
      isDragging = false;
    }

    const isInteractiveTarget = (target: EventTarget | null): boolean =>
      target instanceof Element &&
      target.closest("button, a, input, select, textarea") !== null;

    function handleMouseDown(event: MouseEvent): void {
      if (!isSwipeEnabled || isInteractiveTarget(event.target)) {
        return;
      }

      clearDocumentListeners();
      event.preventDefault();
      startX = event.clientX;
      currentX = event.clientX;
      isDragging = true;
      elementWidth = element.clientWidth;

      const offMove = on(document, "mousemove", handleMouseMove);
      const offUp = on(document, "mouseup", () => {
        handleSwipeEnd();
        clearDocumentListeners();
      });
      documentCleanups = [offMove, offUp];
    }

    function handleTouchStart(event: TouchEvent): void {
      if (!isSwipeEnabled || isInteractiveTarget(event.target)) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      clearDocumentListeners();
      event.preventDefault();
      startX = touch.clientX;
      currentX = touch.clientX;
      isDragging = true;
      elementWidth = element.clientWidth;

      const offMove = on(document, "touchmove", handleTouchMove, {
        passive: false,
      });
      const offEnd = on(document, "touchend", () => {
        handleSwipeEnd();
        clearDocumentListeners();
      });
      documentCleanups = [offMove, offEnd];
    }

    const enableSwipe = (): void => {
      if (isSwipeEnabled) {
        return;
      }

      isSwipeEnabled = true;
      startListenerCleanups = [
        on(element, "mousedown", handleMouseDown),
        on(element, "touchstart", handleTouchStart),
      ];
      onSwipeModeChange?.(true);
    };

    const disableSwipe = (): void => {
      if (!isSwipeEnabled) {
        return;
      }

      isSwipeEnabled = false;
      isDragging = false;
      clearDocumentListeners();
      clearCleanups(startListenerCleanups);
      reset();
      onSwipeModeChange?.(false);
    };

    const updateSwipeMode = (inlineSize: number): void => {
      if (inlineSize < resolveMaxInlineSize()) {
        enableSwipe();
      } else {
        disableSwipe();
      }
    };

    $effect(() => {
      const { x } = spring.current;
      transformElement(x, element);
    });

    $effect(() => {
      const triggerReveal = getTriggerReveal?.() ?? false;
      if (triggerReveal && isSwipeEnabled) {
        spring.set({
          x: element.clientWidth * SWIPE_REVEAL_RATIO,
          y: 0,
        });
        return;
      }

      if (!triggerReveal) {
        reset();
        onResetComplete?.();
      }
    });

    const rowContainer = element.parentElement;
    if (!rowContainer) {
      return;
    }

    let resizeFrame = 0;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const inlineSize = entry.contentRect.width;
      if (resizeFrame !== 0) {
        cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = requestAnimationFrame(() => {
        updateSwipeMode(inlineSize);
        resizeFrame = 0;
      });
    });

    resizeObserver.observe(rowContainer);
    updateSwipeMode(rowContainer.getBoundingClientRect().width);

    return () => {
      isDragging = false;
      clearDocumentListeners();
      clearCleanups(startListenerCleanups);
      resizeObserver.disconnect();
      if (resizeFrame !== 0) {
        cancelAnimationFrame(resizeFrame);
      }
    };
  };
}
