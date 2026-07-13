<script lang="ts">
  import { css, cx, sva } from "styled-system/css";
  import type { Snippet } from "svelte";
  import Cancel from "$lib/components/icons/Cancel.svelte";
  import Button from "./ui/button/button.svelte";

  const modalRecipe = sva({
    base: {
      dialog: {
        _backdrop: {
          background: "blueGem/60",
          opacity: "0",
          transitionBehavior: "allow-discrete",
          transitionDuration: "slow",
          transitionProperty: "opacity, overlay, display",
        },
        _open: {
          _backdrop: {
            opacity: "1",
          },
          pointerEvents: "auto",
        },
        _starting: {
          _open: {
            _backdrop: {
              opacity: "0",
            },
          },
        },
        border: "none",
        margin: 0,
        outlineStyle: "none",
        overflowY: "auto",
        padding: 0,
        pointerEvents: "none",
        transitionBehavior: "allow-discrete",
        transitionDuration: "slow",
        transitionProperty: "scale, translate, opacity, overlay, display",
        transitionTimingFunction: {
          _supportsLinear: "glide",
          base: "anticipate",
        },
      },
    },
    defaultVariants: {
      variant: "modal",
    },
    slots: ["dialog", "content"],
    variants: {
      variant: {
        modal: {
          content: {
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            paddingBlock: 7,
            paddingInline: 10,
          },
          dialog: {
            _open: {
              _starting: {
                opacity: "0",
                scale: "0.95",
                translate: "-50% -50%",
              },
              opacity: "1",
              scale: "1",
              translate: "-50% -50%",
            },
            backgroundColor: "white",
            borderRadius: "lg",
            boxShadow: "md",
            display: "flex",
            flexDirection: "column",
            inlineSize: "full",
            insetBlockStart: "50%",
            insetInlineStart: "50%",
            maxInlineSize: { base: "calc(100% - 2rem)", sm: "30.625rem" },
            minBlockSize: 57.5,
            opacity: "0",
            position: "fixed",
            scale: "0.95",
            translate: "-50% -50%",
          },
        },
        panel: {
          content: {
            paddingBlock: { base: 2, lg: 12 },
            paddingInline: { base: 2, lg: 15 },
          },
          dialog: {
            _open: {
              _starting: {
                translate: "100% 0",
              },
              translate: "0 0",
            },
            backgroundColor: "white",
            boxShadow: "addInvoice",
            inlineSize: { base: "full", lg: "3/4" },
            insetBlockStart: 0,
            insetInlineEnd: 0,
            insetInlineStart: "auto",
            minBlockSize: "100dvh",
            overflowY: "scroll",
            position: "fixed",
            translate: "100% 0",
          },
        },
      },
    },
  });

  interface Props {
    children?: Snippet;
    className?: string;
    description: Snippet;
    onClose?: () => void;
    title: Snippet;
    variant?: "modal" | "panel";
  }

  let {
    variant = "modal",
    children,
    title,
    description,
    className = "",
    onClose,
    ...rest
  }: Props = $props();

  const modalStyles = $derived(modalRecipe({ variant }));

  let dialogEl = $state<HTMLDialogElement | undefined>();

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === dialogEl) {
      onClose?.();
    }
  };

  const handleDialogClose = () => {
    onClose?.();
  };
</script>

<dialog
  class={cx(modalStyles.dialog, className)}
  onclick={handleBackdropClick}
  onclose={handleDialogClose}
  {...rest}
  {@attach (el) => {
    dialogEl = el;
    return () => {
      dialogEl = undefined;
    };
  }}
>
  <div class={modalStyles.content}>
    {@render title()}
    {@render description()}
    {@render children?.()}
  </div>
  <Button
    aria-label="Close dialog"
    class={css({
      _active: { scale: "0.95" },
      insetBlockStart: 4,
      insetInlineEnd: 4,
      position: "absolute",
      rounded: "md",
    })}
    onclick={onClose}
    size="sm"
    variant="ghost"><Cancel /></Button
  >
</dialog>
