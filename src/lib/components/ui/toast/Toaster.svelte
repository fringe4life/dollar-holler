<script lang="ts">
  import { Portal } from "@ark-ui/svelte/portal";
  import { Toaster as ArkToaster, Toast } from "@ark-ui/svelte/toast";
  import { sva } from "styled-system/css";
  import { toaster } from "$lib/utils/toast.svelte";

  const toastRootRecipe = sva({
    slots: ["root", "title", "description", "closeTrigger"],
    base: {
      root: {
        borderRadius: "md",
        borderWidth: "1px",
        boxShadow: "md",
        inlineSize: "sm",
        paddingInline: 4,
        paddingBlock: 3,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "start",
        columnGap: 3,
        rowGap: 1,
        backgroundColor: "white",
        translate: "var(--x) var(--y)",
        scale: "var(--scale)",
        zIndex: "var(--z-index)",
        height: "var(--height)",
        opacity: "var(--opacity)",
        willChange: "translate, opacity, scale",
        transitionProperty: "translate, scale, opacity, height, box-shadow",
        transitionDuration: "400ms, 400ms, 400ms, 400ms, 200ms",
        transitionTimingFunction: "cubic-bezier(0.21, 1.02, 0.73, 1)",
        _closed: {
          transitionDuration: "400ms, 400ms, 200ms, 400ms, 200ms",
          transitionTimingFunction: "cubic-bezier(0.06, 0.71, 0.55, 1)",
        },
      },
      title: {
        fontWeight: "bold",
        lineHeight: "short",
      },
      description: {
        color: "monsoon",
        fontSize: "sm",
        gridColumn: "1 / -1",
      },
      closeTrigger: {
        borderRadius: "sm",
        color: "currentColor",
        inlineSize: 6,
        blockSize: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        _hover: { backgroundColor: "black/5" },
      },
    },
    variants: {
      type: {
        success: {
          root: { borderColor: "caribbeanGreen", color: "daisyBush" },
        },
        error: { root: { borderColor: "scarlet", color: "scarlet" } },
        warning: { root: { borderColor: "goldenFizz", color: "daisyBush" } },
        info: { root: { borderColor: "lavenderIndigo", color: "daisyBush" } },
      },
    },
    defaultVariants: {
      type: "info",
    },
  });

  const toastVariants = ["success", "error", "warning", "info"] as const;
  type ToastVariant = (typeof toastVariants)[number];
  const getToastVariant = (type: string | undefined): ToastVariant =>
    toastVariants.includes(type as ToastVariant)
      ? (type as ToastVariant)
      : "info";
</script>

<Portal>
  <ArkToaster {toaster}>
    {#snippet children(_toastValue)}
      <Toast.Root
        class={toastRootRecipe({ type: getToastVariant(_toastValue().type) }).root}
      >
        <Toast.Title
          class={toastRootRecipe({ type: getToastVariant(_toastValue().type) }).title}
          >{_toastValue().title}</Toast.Title
        >
        <Toast.CloseTrigger
          class={toastRootRecipe({
            type: getToastVariant(_toastValue().type),
          }).closeTrigger}
          aria-label="Close notification"
        >
          x
        </Toast.CloseTrigger>
        {#if _toastValue().description}
          <Toast.Description
            class={toastRootRecipe({
              type: getToastVariant(_toastValue().type),
            }).description}
          >
            {_toastValue().description}
          </Toast.Description>
        {/if}
      </Toast.Root>
    {/snippet}
  </ArkToaster>
</Portal>
