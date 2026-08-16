<script lang="ts">
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { css } from "#styled-system/css/index.js";
  import Button from "#lib/components/ui/button/button.svelte";
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

  const rootClass = css({
    alignItems: { base: "stretch", sm: "center" },
    backgroundColor: "white",
    borderColor: "scarlet/30",
    borderInlineStartColor: "scarlet",
    borderInlineStartWidth: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: "lg",
    boxShadow: "colored",
    display: "flex",
    flexDirection: { base: "column", sm: "row" },
    gap: { base: 4, sm: 5 },
    inlineSize: "full",
    padding: { base: 5, sm: 6 },
  });

  const iconWrapperClass = css({
    alignItems: "center",
    backgroundColor: "goldenFizz",
    borderRadius: "full",
    color: "scarlet",
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
    color: "daisyBush",
    fontSize: "xl",
    fontWeight: "bold",
    lineHeight: "tight",
    marginBlockEnd: 1,
  });

  const messageClass = css({
    color: "monsoon",
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
