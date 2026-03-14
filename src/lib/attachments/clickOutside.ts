import { on } from "svelte/events";
import type { Attachment } from "svelte/attachments";

export function clickOutside(callback: () => void): Attachment {
  return (element) => {
    function handleClick(e: MouseEvent) {
      if (
        e.target instanceof HTMLElement &&
        e.target.tagName !== element.tagName
      ) {
        callback();
      }
    }

    return on(document, "click", handleClick);
  };
}
