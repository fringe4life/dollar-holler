<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags -- serializer emits escaped text + span.token only */
  import { css, cx } from "#styled-system/css/index.js";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import Textarea from "#lib/components/primitives/textarea/Textarea.svelte";
  import { highlightMarkdown } from "./highlight-markdown.ts";

  /**
   * Match `Textarea.svelte` box (p, border, font) so wrap/scroll stay aligned.
   * Token CSS is color-only — weight/family would desync glyph width.
   */
  const overlayFace = {
    borderStyle: "solid",
    borderWidth: 2,
    fontFamily: "sansserif",
    fontSize: "inherit",
    inlineSize: "full",
    lineHeight: "normal",
    overflow: "auto",
    overflowWrap: "break-word",
    p: 4,
    tabSize: 2,
    whiteSpace: "pre-wrap",
  } as const;

  const wrapperClass = css({
    display: "grid",
    isolation: "isolate",
    position: "relative",
  });

  const overlayClass = css({
    ...overlayFace,
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "& .token.blockquote": { color: "daisyBush" },
    "& .token.bold": { color: "daisyBush" },
    "& .token.code": { color: "caribbeanGreen" },
    "& .token.code-snippet": { color: "caribbeanGreen" },
    "& .token.comment": { color: "pastelPurple" },
    "& .token.hr": { color: "lightGray" },
    "& .token.important": { color: "purple" },
    "& .token.italic": { color: "lavenderIndigo" },
    "& .token.keyword": { color: "caribbeanGreen" },
    "& .token.list": { color: "daisyBush" },
    "& .token.punctuation": { color: "lightGray" },
    "& .token.strike": { color: "monsoon" },
    "& .token.string": { color: "robinEggBlue" },
    "& .token.title": { color: "purple" },
    "& .token.url": { color: "caribbeanGreen" },
    "& .token.url-reference": { color: "caribbeanGreen" },
    borderColor: "transparent",
    gridArea: "1 / 1",
    margin: 0,
    minBlockSize: 0,
    pointerEvents: "none",
    scrollbarWidth: "none",
    zIndex: 0,
  });

  const overlayTextareaClass = css({
    ...overlayFace,
    "&::selection": {
      backgroundColor: "lavenderIndigo/30",
      color: "transparent",
    },
    backgroundColor: "transparent",
    caretColor: "daisyBush",
    color: "transparent",
    gridArea: "1 / 1",
    position: "relative",
    zIndex: 1,
  });

  let overlayEl: HTMLPreElement | undefined = $state();

  const captureOverlay: Attachment<HTMLPreElement> = (el) => {
    overlayEl = el;
    return () => {
      overlayEl = undefined;
    };
  };

  const syncOverlayScroll: Attachment<HTMLTextAreaElement> = (textarea) =>
    on(textarea, "scroll", () => {
      const overlay = overlayEl;
      if (!overlay) {
        return;
      }
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    });

  let {
    class: className = "",
    value = $bindable(),
    ...rest
  }: Omit<HTMLTextareaAttributes, "class"> & { class?: string } = $props();

  /** Serializer in `highlightMarkdown`: escaped text + `span.token` only. */
  const highlightedHtml = $derived(
    highlightMarkdown(value == null ? "" : String(value))
  );
</script>

<div class={wrapperClass}>
  <pre
    class={overlayClass}
    aria-hidden="true"
    {@attach captureOverlay}>{@html highlightedHtml}</pre>
  <Textarea
    class={cx(overlayTextareaClass, className)}
    {...rest}
    {@attach syncOverlayScroll}
    bind:value
  />
</div>
