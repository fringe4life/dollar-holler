<script lang="ts">
  import { Portal } from "@ark-ui/svelte/portal";
  import { Toaster as ArkToaster, Toast } from "@ark-ui/svelte/toast";
  import { sva } from "styled-system/css";
  import { toaster } from "$lib/utils/toast.svelte";

  const toastRootRecipe = sva({
    base: {
      closeTrigger: {
        _hover: { backgroundColor: "black/5" },
        alignItems: "center",
        blockSize: 6,
        borderRadius: "sm",
        color: "currentColor",
        display: "inline-flex",
        inlineSize: 6,
        justifyContent: "center",
      },
      description: {
        color: "monsoon",
        fontSize: "sm",
        gridColumn: "1 / -1",
      },
      root: {
        _closed: {
          transitionDuration: "400ms, 400ms, 200ms, 400ms, 200ms",
          transitionTimingFunction: "cubic-bezier(0.06, 0.71, 0.55, 1)",
        },
        alignItems: "start",
        backgroundColor: "white",
        borderRadius: "md",
        borderWidth: "1px",
        boxShadow: "md",
        columnGap: 3,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        height: "var(--height)",
        inlineSize: "sm",
        opacity: "var(--opacity)",
        paddingBlock: 3,
        paddingInline: 4,
        rowGap: 1,
        scale: "var(--scale)",
        transitionDuration: "400ms, 400ms, 400ms, 400ms, 200ms",
        transitionProperty: "translate, scale, opacity, height, box-shadow",
        transitionTimingFunction: "cubic-bezier(0.21, 1.02, 0.73, 1)",
        translate: "var(--x) var(--y)",
        willChange: "translate, opacity, scale",
        zIndex: "var(--z-index)",
      },
      title: {
        fontWeight: "bold",
        lineHeight: "short",
      },
    },
    defaultVariants: {
      type: "info",
    },
    slots: ["root", "title", "description", "closeTrigger"],
    variants: {
      type: {
        error: { root: { borderColor: "scarlet", color: "scarlet" } },
        info: { root: { borderColor: "lavenderIndigo", color: "daisyBush" } },
        success: {
          root: { borderColor: "caribbeanGreen", color: "daisyBush" },
        },
        warning: { root: { borderColor: "goldenFizz", color: "daisyBush" } },
      },
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
          aria-label="Close notification"
          class={toastRootRecipe({
            type: getToastVariant(_toastValue().type),
          }).closeTrigger}
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
