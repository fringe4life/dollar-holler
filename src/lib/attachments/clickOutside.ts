import type { Attachment } from 'svelte/attachments'

export function clickOutside(callback: () => void): Attachment {
  return element => {
    document.addEventListener('click', handleClick)
    function handleClick(e: MouseEvent) {
      if (e.target instanceof HTMLElement && e.target.tagName !== element.tagName) {
        callback()
      }
    }

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }
}
