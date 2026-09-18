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
    scrollbarGutter: "stable",
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
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "& .token.blockquote": { color: "syntaxText" },
    "& .token.bold": { color: "syntaxText" },
    "& .token.code": { color: "syntaxCode" },
    "& .token.code-snippet": { color: "syntaxCode" },
    "& .token.comment": { color: "syntaxComment" },
    "& .token.hr": { color: "syntaxMuted" },
    "& .token.important": { color: "syntaxImportant" },
    "& .token.italic": { color: "syntaxType" },
    "& .token.keyword": { color: "syntaxKeyword" },
    "& .token.list": { color: "syntaxText" },
    "& .token.punctuation": { color: "syntaxPunctuation" },
    "& .token.strike": { color: "syntaxStrike" },
    "& .token.string": { color: "syntaxString" },
    "& .token.title": { color: "syntaxTitle" },
    "& .token.url": { color: "syntaxCode" },
    "& .token.url-reference": { color: "syntaxCode" },
    borderColor: "transparent",
    gridArea: "1 / 1",
    margin: 0,
    minBlockSize: 0,
    pointerEvents: "none",
    scrollbarColor: "transparent transparent",
    zIndex: 0,
  });

  const overlayTextareaClass = css({
    ...overlayFace,
    "&::selection": {
      backgroundColor: "ring/30",
      color: "transparent",
    },
    backgroundColor: "transparent",
    caretColor: "foreground",
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
