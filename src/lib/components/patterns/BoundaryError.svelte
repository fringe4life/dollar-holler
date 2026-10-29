<script lang="ts">
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { css } from "#styled-system/css/index.js";
  import Button from "#lib/components/primitives/button/button.svelte";
  import { CORNER_SHAPE } from "#lib/styles.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";

  interface Props {
    error: unknown;
    fallbackMessage: string;
    onRetry: () => void;
    title?: string;
  }

  let {
    error,
    fallbackMessage,
    onRetry,
    title = "Couldn’t load this content",
  }: Props = $props();

  const message = $derived(getErrorMessage(error, fallbackMessage));

  /*
   * Speaks the same corner language as a failed list row: card-tier squircle
   * plus the top-end status marker instead of the old 4px inline-start stripe
   * (a thick side accent fights a rounded corner and reads generic).
   */
  const rootClass = css({
    _before: {
      backgroundColor: "destructive",
      clipPath: "polygon(0 0, 100% 0, 100% 100%)",
      content: '""',
      height: 3,
      insetBlockStart: 0,
      insetInlineEnd: 0,
      position: "absolute",
      width: 3,
    },
    alignItems: { base: "stretch", sm: "center" },
    backgroundColor: "card",
    borderColor: "destructive/30",
    borderRadius: "xl",
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow: "colored",
    cornerShape: CORNER_SHAPE,
    display: "flex",
    flexDirection: { base: "column", sm: "row" },
    gap: { base: 4, sm: 5 },
    inlineSize: "full",
    isolation: "isolate",
    overflow: "hidden",
    padding: { base: 5, sm: 6 },
    position: "relative",
  });

  const iconWrapperClass = css({
    alignItems: "center",
    backgroundColor: "warning",
    borderRadius: "full",
    color: "destructive",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    padding: 3,
    width: "fit-content",
  });

  const iconClass = css({
    blockSize: 6,
    color: "currentColor",
    inlineSize: 6,
  });

  const contentClass = css({
    flex: 1,
    minInlineSize: 0,
  });

  const titleClass = css({
    color: "foreground",
    fontSize: "xl",
    fontWeight: "bold",
    lineHeight: "tight",
    marginBlockEnd: 1,
  });

  const messageClass = css({
    color: "textMuted",
    maxInlineSize: "prose",
  });

  const actionClass = css({
    alignSelf: { base: "stretch", sm: "center" },
    flexShrink: 0,
  });
</script>

<div aria-atomic="true" aria-live="assertive" class={rootClass} role="alert">
  <div aria-hidden="true" class={iconWrapperClass}>
    <AlertTriangle class={iconClass} />
  </div>
  <div class={contentClass}>
    <h2 class={titleClass}>{title}</h2>
    <p class={messageClass}>{message}</p>
  </div>
  <Button class={actionClass} onclick={onRetry} size="sm">
    <RefreshCw aria-hidden="true" class={iconClass} />
    Try again
  </Button>
</div>
