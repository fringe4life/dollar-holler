<script lang="ts">
  import { css, cx, sva } from "styled-system/css";
  import type { Snippet } from "svelte";
  import Cancel from "$lib/components/icons/Cancel.svelte";
  import Button from "./ui/button/button.svelte";

  const modalRecipe = sva({
    slots: ["dialog", "content"],
    base: {
      dialog: {
        border: "none",
        padding: 0,
        margin: 0,
        overflowY: "auto",
        outlineStyle: "none",
        transitionProperty: "scale, translate, opacity, overlay, display",
        transitionDuration: "slow",
        transitionTimingFunction: {
          base: "anticipate",
          _supportsLinear: "glide",
        },
        transitionBehavior: "allow-discrete",
        _backdrop: {
          background: "blueGem/60",
          opacity: "0",
          transitionProperty: "opacity, overlay, display",
          transitionDuration: "slow",
          transitionBehavior: "allow-discrete",
        },
        _open: {
          _backdrop: {
            opacity: "1",
          },
        },
        _starting: {
          _open: {
            _backdrop: {
              opacity: "0",
            },
          },
        },
      },
    },
    variants: {
      variant: {
        modal: {
          dialog: {
            position: "fixed",
            insetBlockStart: "50%",
            insetInlineStart: "50%",
            inlineSize: "full",
            maxInlineSize: { base: "calc(100% - 2rem)", sm: "30.625rem" },
            minBlockSize: 57.5,
            borderRadius: "lg",
            backgroundColor: "white",
            boxShadow: "md",
            scale: "0.95",
            translate: "-50% -50%",
            opacity: "0",
            _open: {
              translate: "-50% -50%",
              scale: "1",
              opacity: "1",
              _starting: {
                scale: "0.95",
                translate: "-50% -50%",
                opacity: "0",
              },
            },
          },
          content: {
            display: "grid",
            alignContent: "space-between",
            blockSize: "full",
            paddingInline: 10,
            paddingBlock: 7,
          },
        },
        panel: {
          dialog: {
            position: "fixed",
            insetInlineStart: "auto",
            insetInlineEnd: 0,
            insetBlockStart: 0,
            minBlockSize: "100dvh",
            inlineSize: { base: "full", lg: "3/4" },
            overflowY: "scroll",
            backgroundColor: "white",
            boxShadow: "addInvoice",
            translate: "100% 0",
            _open: {
              translate: "0 0",
              _starting: {
                translate: "100% 0",
              },
            },
          },
          content: {
            paddingInline: { base: 2, lg: 15 },
            paddingBlock: { base: 2, lg: 12 },
          },
        },
      },
    },
    defaultVariants: {
      variant: "modal",
    },
  });

  interface Props {
    children?: Snippet;
    className?: string;
    description: Snippet;
    dialogEl: HTMLDialogElement | undefined;
    onClose?: () => void;
    title: Snippet;
    variant?: "modal" | "panel";
  }

  let {
    dialogEl = $bindable<HTMLDialogElement | undefined>(),
    variant = "modal",
    children,
    title,
    description,
    className = "",
    onClose,
  }: Props = $props();

  const modalStyles = $derived(modalRecipe({ variant }));

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === dialogEl) {
      // open = false;
      onClose?.();
    }
  };

  const handleDialogClose = () => {
    onClose?.();
  };
</script>

<dialog
  bind:this={dialogEl}
  class={cx(modalStyles.dialog, className)}
  onclick={handleBackdropClick}
  onclose={handleDialogClose}
>
  <div class={modalStyles.content}>
    {@render title()}
    {@render description()}
    {@render children?.()}
  </div>
  <Button
    variant="ghost"
    size="sm"
    onclick={onClose}
    class={css({
    position: "absolute",
    insetInlineEnd: 4,
    insetBlockStart: 4,
    rounded: "md",
    _active: { scale: "0.95" },
  })}
    aria-label="Close dialog"
    ><Cancel /></Button
  >
</dialog>
