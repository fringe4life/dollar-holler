import { Spring } from 'svelte/motion'

interface SwipeConfig {
  triggerReset?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

/**
 * Modern Svelte 5 swipe attachment using @attach directive
 * Uses the new Spring class for smooth animations
 */
export function swipe(config: SwipeConfig = {}) {
  const { triggerReset = false, onSwipeLeft, onSwipeRight, threshold = 20 } = config

  return (element: HTMLElement) => {
    let startX = 0
    let currentX = 0
    let isDragging = false
    let elementWidth = 0

    // Use the new Spring class for smooth animations
    const spring = new Spring(
      { x: 0, y: 0 },
      {
        stiffness: 0.2,
        damping: 0.4,
      }
    )

    // Apply transforms reactively
    $effect(() => {
      element.style.transform = `translate3d(${spring.current.x}px, 0, 0)`
    })

    // Check if we're on mobile
    const isMobile = $derived(() => {
      if (typeof window === 'undefined') return false
      return window.innerWidth <= 1024
    })

    // Reset function
    function reset() {
      spring.set({ x: 0, y: 0 })
    }

    // Handle swipe completion
    function handleSwipeEnd() {
      if (!isDragging) return

      const movement = startX - currentX
      const leftSnapX = elementWidth * -0.95
      const rightSnapX = 0

      if (movement > threshold) {
        // Swiped left
        spring.set({ x: leftSnapX, y: 0 })
        onSwipeLeft?.()
      } else {
        // Swiped right or insufficient movement
        spring.set({ x: rightSnapX, y: 0 })
        onSwipeRight?.()
      }

      isDragging = false
    }

    // Mouse event handlers
    function handleMouseDown(event: MouseEvent) {
      if (!isMobile()) return

      event.preventDefault()
      startX = event.clientX
      currentX = event.clientX
      isDragging = true
      elementWidth = element.clientWidth

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    function handleMouseMove(event: MouseEvent) {
      if (!isDragging) return

      const dx = event.clientX - currentX
      currentX = event.clientX

      spring.set({ x: spring.current.x + dx, y: 0 })
    }

    function handleMouseUp() {
      if (!isDragging) return

      handleSwipeEnd()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // Touch event handlers
    function handleTouchStart(event: TouchEvent) {
      if (!isMobile()) return

      event.preventDefault()
      startX = event.touches[0].clientX
      currentX = event.touches[0].clientX
      isDragging = true
      elementWidth = element.clientWidth

      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      })
      document.addEventListener('touchend', handleTouchEnd)
    }

    function handleTouchMove(event: TouchEvent) {
      if (!isDragging) return

      event.preventDefault()
      const dx = event.touches[0].clientX - currentX
      currentX = event.touches[0].clientX

      spring.set({ x: spring.current.x + dx, y: 0 })
    }

    function handleTouchEnd() {
      if (!isDragging) return

      handleSwipeEnd()
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    // Watch for reset trigger
    $effect(() => {
      if (triggerReset) {
        reset()
      }
    })

    // Watch for mobile breakpoint changes
    $effect(() => {
      if (isMobile()) {
        element.addEventListener('mousedown', handleMouseDown)
        element.addEventListener('touchstart', handleTouchStart)
      } else {
        element.removeEventListener('mousedown', handleMouseDown)
        element.removeEventListener('touchstart', handleTouchStart)
        // Reset position when switching to desktop
        spring.set({ x: 0, y: 0 })
      }
    })

    // Cleanup function
    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }
}
