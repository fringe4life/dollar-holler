import type { Attachment } from "svelte/attachments";
import { on } from "svelte/events";

export const clickOutside = (callback: () => void): Attachment<HTMLElement> => {
  return (element) => {
    const handleClick = (e: MouseEvent) => {
      if (e.target instanceof Node && !element.contains(e.target)) {
        callback();
      }
    };

    return on(document, "click", handleClick);
  };
};
