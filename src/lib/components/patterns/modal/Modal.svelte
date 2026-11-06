<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import type { Snippet } from "svelte";
  import Cancel from "#lib/components/primitives/icons/Cancel.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  type ModalVariant = "modal" | "panel";

  /**
   * Workaround: top-level `css()` maps instead of `sva` so hashed class names do
   * not force the full recipe runtime into the client bundle.
   *
   * @remarks
   * Still required on `@pandacss/vite@2.5.0` / `@pandacss/dev@2.5.0` with
   * `hash: true`. Drop when Panda folds hashed local `cva`/`sva` to string
   * lookups; re-verify no client chunk with `compoundVariants` / `__cva__`
   * after clean build.
   *
   * @see https://github.com/chakra-ui/panda/issues/3853 — related transform diagnostics
   * @see https://github.com/fringe4life/van-life/issues/471 — established pattern
   * @see https://github.com/fringe4life/dollar-holler/issues/109 — tracking
   */
  const modalDialogBase = css({
    _backdrop: {
      background: "backdrop/60",
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
  });

  const modalDialogByVariant = {
    modal: css({
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
      backgroundColor: "surface",
      borderRadius: "2xl",
      boxShadow: "md",
      cornerShape: CORNER_SHAPE,
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
    }),
    panel: css({
      _open: {
        _starting: {
          translate: "100% 0",
        },
        translate: "0 0",
      },
      backgroundColor: "surface",
      // Pinned to the viewport edge: the edge-side corners stay square, the
      // free side takes the softest corner in the system.
      borderEndEndRadius: 0,
      borderEndStartRadius: { base: 0, lg: "3xl" },
      borderStartEndRadius: 0,
      borderStartStartRadius: { base: 0, lg: "3xl" },
      boxShadow: "addInvoice",
      cornerShape: CORNER_SHAPE,
      inlineSize: { base: "full", lg: "3/4" },
      insetBlockStart: 0,
      insetInlineEnd: 0,
      insetInlineStart: "auto",
      minBlockSize: "100dvh",
      overflowY: "scroll",
      position: "fixed",
      translate: "100% 0",
    }),
  } as const satisfies Record<ModalVariant, string>;

  const modalContentByVariant = {
    modal: css({
      display: "flex",
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
      paddingBlock: 7,
      paddingInline: 10,
    }),
    panel: css({
      paddingBlock: { base: 2, lg: 12 },
      paddingInline: { base: 2, lg: 15 },
    }),
  } as const satisfies Record<ModalVariant, string>;

  function modalRecipe({ variant = "modal" }: { variant?: ModalVariant } = {}) {
    return {
      content: modalContentByVariant[variant],
      dialog: cx(modalDialogBase, modalDialogByVariant[variant]),
    };
  }

  interface Props {
    children?: Snippet;
    className?: string;
    description: Snippet;
    onClose?: () => void;
    title: Snippet;
    variant?: ModalVariant;
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
    })}
    onclick={onClose}
    size="sm"
    variant="ghost"><Cancel /></Button
  >
</dialog>
