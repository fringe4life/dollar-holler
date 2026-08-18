<script lang="ts">
  import { Toaster as Sonner } from "svelte-sonner";
  import { css } from "#styled-system/css/index.js";
  import Cancel from "#lib/components/icons/Cancel.svelte";
  import { between } from "#styled-system/patterns/between.js";

  const toastClass = between({
    borderRadius: "lg",
    borderStyle: "solid",
    borderWidth: "2px",
    boxShadow: "md",
    columnGap: 4,
    fontFamily: "sansserif",
    fontSize: { base: "md", md: "lg" },
    fontWeight: "bold",
    minBlockSize: 12,
    inlineSize: "100%",
    maxInlineSize: "min(100%, 26rem)",
    paddingBlock: 3,
    paddingInline: 5,
  });

  const titleClass = css({
    fontWeight: "bold",
    lineHeight: "short",
  });

  const descriptionClass = css({
    color: "monsoon",
    fontSize: "sm",
    fontWeight: "normal",
  });

  const contentClass = css({
    flex: 1,
    minInlineSize: 0,
  });

  const closeButtonClass = css({
    _focusVisible: {
      outlineColor: "currentColor",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "currentColor",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    padding: 0,
  });

  const successClass = css({
    backgroundColor: "white",
    borderColor: "caribbeanGreen",
    color: "daisyBush",
  });

  const errorClass = css({
    "& [data-description]": { color: "goldenFizz" },
    backgroundColor: "scarlet",
    borderColor: "scarlet",
    color: "goldenFizz",
  });

  const warningClass = css({
    backgroundColor: "white",
    borderColor: "goldenFizz",
    color: "daisyBush",
  });

  const infoClass = css({
    backgroundColor: "fog",
    borderColor: "fog",
    color: "daisyBush",
  });
</script>

<Sonner
  closeButton
  closeButtonAriaLabel="Close notification"
  offset="1rem"
  successIcon={null}
  errorIcon={null}
  infoIcon={null}
  warningIcon={null}
  pauseWhenPageIsHidden
  position="top-center"
  toastOptions={{
    classes: {
      closeButton: closeButtonClass,
      content: contentClass,
      description: descriptionClass,
      error: errorClass,
      info: infoClass,
      success: successClass,
      title: titleClass,
      toast: toastClass,
      warning: warningClass,
    },
    unstyled: true,
  }}
  visibleToasts={4}
  duration={3000}
>
  {#snippet closeIcon()}
    <Cancel height={24} width={24} />
  {/snippet}
</Sonner>
