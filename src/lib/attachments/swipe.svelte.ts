import type { Attachment } from "svelte/attachments";
import { on } from "svelte/events";
import { Spring, type SpringOptions } from "svelte/motion";
import { MediaQuery } from "svelte/reactivity";

interface SwipeConfig {
  onResetComplete?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  triggerReset?: boolean;
}

const MOBILE_MEDIA_QUERY = new MediaQuery("(max-width: 1024px)");
const transformElement = (
  x: number,
  element: HTMLElement,
  isTypedOm: boolean
) => {
  // Use CSS Typed OM where available (Chrome, Safari 16.4+, Edge); fallback for Firefox etc.
  if (isTypedOm) {
    // CSS Typed OM is supported
    element.attributeStyleMap.set(
      "transform",
      new CSSTranslate(CSS.px(x), CSS.px(0))
    );
  } else {
    // CSS Typed OM is not supported
    element.style.transform = `translateX(${x}px)`;
  }
};

// Initial spring state
const INITIAL_SPRING_STATE = { x: 0, y: 0 };
// Spring configuration
const SPRING_CONFIG: SpringOptions = {
  stiffness: 0.2,
  damping: 0.4,
};

/**
 * Modern Svelte 5 swipe attachment using @attach directive
 * Uses the new Spring class for smooth animations
 *
 * Performance: Prefer stable callback references for onResetComplete, onSwipeLeft, and
 * onSwipeRight (e.g. defined in script or bound with a stable wrapper). If inline
 * functions are passed, the attachment re-runs whenever those references change;
 * wrapping the config in $derived can reduce churn by only updating when triggerReset
 * (or other chosen deps) change. Prefer avoiding inline callbacks over relying on $derived.
 */
export function swipe(config: SwipeConfig = {}): Attachment<HTMLElement> {
  const {
    triggerReset = false,
    onResetComplete,
    onSwipeLeft,
    onSwipeRight,
    threshold = 20,
  } = config;
  // Check if we're on mobile and CSS Typed OM is supported
  const isMobile = MOBILE_MEDIA_QUERY.current;
  const isTypedOm = Boolean(window.CSS && CSS.px);

  // Use the new Spring class for smooth animations
  const spring = new Spring(INITIAL_SPRING_STATE, SPRING_CONFIG);
  return (element) => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let elementWidth = 0;
    /** Cleanups for document listeners (drag); cleared when drag ends or on attachment cleanup */
    let documentCleanups: (() => void)[] = [];

    $effect(() => {
      const x = spring.current.x;
      transformElement(x, element, isTypedOm);
    });

    // Reset function
    function reset() {
      spring.set(INITIAL_SPRING_STATE);
    }

    // Handle swipe completion
    function handleSwipeEnd() {
      if (!isDragging) {
        return;
      }

      const movement = startX - currentX;
      const leftSnapX = elementWidth * -0.95;

      if (movement > threshold) {
        // Swiped left
        spring.set({ x: leftSnapX, y: 0 });
        onSwipeLeft?.();
      } else {
        // Swiped right or insufficient movement
        spring.set(INITIAL_SPRING_STATE);
        onSwipeRight?.();
      }

      isDragging = false;
    }

    // Mouse event handlers
    function handleMouseDown(event: MouseEvent) {
      if (!isMobile) {
        return;
      }

      for (const off of documentCleanups) {
        off();
      }
      documentCleanups = [];

      event.preventDefault();
      startX = event.clientX;
      currentX = event.clientX;
      isDragging = true;
      elementWidth = element.clientWidth;

      const offMove = on(document, "mousemove", handleMouseMove);
      const offUp = on(document, "mouseup", () => {
        if (!isDragging) {
          return;
        }
        handleSwipeEnd();
        offMove();
        offUp();
        documentCleanups = [];
      });
      documentCleanups = [offMove, offUp];
    }

    function handleMouseMove(event: MouseEvent) {
      if (!isDragging) {
        return;
      }

      const dx = event.clientX - currentX;
      currentX = event.clientX;

      spring.set({ x: spring.current.x + dx, y: 0 });
    }

    // Touch event handlers
    function handleTouchStart(event: TouchEvent) {
      if (!isMobile) {
        return;
      }

      for (const off of documentCleanups) {
        off();
      }
      documentCleanups = [];

      event.preventDefault();
      startX = event.touches[0].clientX;
      currentX = event.touches[0].clientX;
      isDragging = true;
      elementWidth = element.clientWidth;

      const offMove = on(document, "touchmove", handleTouchMove, {
        passive: false,
      });
      const offEnd = on(document, "touchend", () => {
        if (!isDragging) {
          return;
        }
        handleSwipeEnd();
        offMove();
        offEnd();
        documentCleanups = [];
      });
      documentCleanups = [offMove, offEnd];
    }

    function handleTouchMove(event: TouchEvent) {
      if (!isDragging) {
        return;
      }

      event.preventDefault();
      const dx = event.touches[0].clientX - currentX;
      currentX = event.touches[0].clientX;

      spring.set({ x: spring.current.x + dx, y: 0 });
    }

    // Watch for reset trigger
    $effect(() => {
      if (triggerReset) {
        reset();
        onResetComplete?.();
      }
    });

    // Watch for mobile breakpoint changes: use on() so cleanup is returned and order matches declarative handlers
    $effect(() => {
      if (!isMobile) {
        reset();
        return;
      }
      const offMouse = on(element, "mousedown", handleMouseDown);
      const offTouch = on(element, "touchstart", handleTouchStart);
      return () => {
        offMouse();
        offTouch();
      };
    });

    // Cleanup: remove any active document listeners (e.g. drag in progress) when attachment is detached
    return () => {
      isDragging = false;
      for (const off of documentCleanups) {
        off();
      }
      documentCleanups = [];
    };
  };
}
