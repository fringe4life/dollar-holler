import type { Attachment } from "svelte/attachments";
import { on } from "svelte/events";

export function clickOutside(callback: () => void): Attachment<HTMLElement> {
  return (element) => {
    function handleClick(e: MouseEvent) {
      if (e.target instanceof Node && !element.contains(e.target)) {
        callback();
      }
    }

    return on(document, "click", handleClick);
  };
}
