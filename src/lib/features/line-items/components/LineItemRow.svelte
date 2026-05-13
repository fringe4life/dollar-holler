<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { gridItem } from "styled-system/patterns";
  import type { FocusEventHandler, FormEventHandler } from "svelte/elements";
  import type {
    LineItemRowProps,
    LineItemUpdate,
  } from "$features/line-items/types";
  import Trash from "$lib/components/icons/Trash.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { invoiceLineItem } from "../styles";
  import { lineItemFieldRecipe } from "./LineItemRecipe";

  let props: LineItemRowProps = $props();

  const isEditable = $derived(props.mode !== "view");
  const quantity = $derived(props?.lineItem?.quantity ?? 0);

  const displayUnitPrice = $derived(
    quantity > 0 ? (props?.lineItem?.amount / quantity).toFixed(2) : "0.00"
  );

  let unitPrice = $derived(
    quantity > 0 ? (props?.lineItem?.amount / quantity).toFixed(2) : "0.00"
  );

  const amount = $derived((quantity * Number(unitPrice)).toFixed(2));

  function patch(update: LineItemUpdate) {
    if (props.mode === "view") {
      return;
    }
    props.updateLineItem(props.lineItem.id, update);
  }

  const onDescriptionInput: FormEventHandler<HTMLInputElement> = (e) => {
    patch({ description: e.currentTarget.value });
  };

  const onQuantityInput: FormEventHandler<HTMLInputElement> = (e) => {
    const q = Number(e.currentTarget.value);
    patch({
      quantity: q,
      amount: q * Number(unitPrice),
    });
  };

  const onUnitPriceInput: FormEventHandler<HTMLInputElement> = (e) => {
    unitPrice = e.currentTarget.value;
    patch({
      amount: quantity * Number(unitPrice),
    });
  };

  const formatUnitPrice: FocusEventHandler<HTMLInputElement> = () => {
    unitPrice = Number(unitPrice).toFixed(2);
    patch({
      amount: quantity * Number(unitPrice),
    });
  };

  const lineItemLabel = css({
    display: { base: "none", sm: "block", _print: "none" },
  });

  const qtyStyles = lineItemFieldRecipe({
    inputType: "number",
    align: "center",
  });
  const priceStyles = lineItemFieldRecipe({
    inputType: "number",
    align: "right",
  });
  const amountStyles = lineItemFieldRecipe({
    inputType: "text",
    align: "right",
  });
</script>

<div
  class={cx(invoiceLineItem, css({ borderColor: "fog", borderBottomWidth: 2, paddingBlock: { base: 4, sm: 2 } }))}
>
  <div class={gridItem({ gridArea: "description", position: "relative" })}>
    <label for="description-{props.lineItem.id}" class={lineItemLabel}
      >Description</label
    >
    <input
      value={props.lineItem.description}
      oninput={isEditable ? onDescriptionInput : undefined}
      class="line-item"
      type="text"
      name="description"
      id="description-{props.lineItem.id}"
      required={props.isRequired}
      disabled={!isEditable}
    >
    <span aria-hidden="true" class={priceStyles.border}></span>
  </div>

  <div class={gridItem({ position: "relative", gridArea: "unitPrice" })}>
    <label for="unitPrice-{props.lineItem.id}" class={priceStyles.label}
      >Unit Price</label
    >
    <input
      class={priceStyles.input}
      type={isEditable ? "number" : "text"}
      name="unitPrice"
      id="unitPrice-{props.lineItem.id}"
      value={isEditable ? unitPrice : displayUnitPrice}
      oninput={isEditable ? onUnitPriceInput : undefined}
      onblur={isEditable ? formatUnitPrice : undefined}
      step={isEditable ? "0.01" : undefined}
      min={isEditable ? "0" : undefined}
      required={props.isRequired}
      disabled={!isEditable}
    >
    <!-- "border-lavenderIndigo ease-anticipate pointer-events-none absolute inset-x-0 inset-be-0 origin-left scale-x-90 border-b-2 border-solid opacity-0 transition-[opacity,scale] duration-200" -->
    <span aria-hidden="true" class={priceStyles.border}></span>
  </div>
  <div class={gridItem({ gridArea: "quantity", position: "relative" })}>
    <label for="quantity-{props.lineItem.id}" class={qtyStyles.label}
      >Qty</label
    >
    <input
      value={props.lineItem.quantity}
      oninput={isEditable ? onQuantityInput : undefined}
      class={qtyStyles.input}
      type="number"
      name="quantity"
      id="quantity-{props.lineItem.id}"
      min="0"
      required={props.isRequired}
      disabled={!isEditable}
    >
    <span aria-hidden="true" class={qtyStyles.border}></span>
  </div>
  <div class={gridItem({ gridArea: "amount" })}>
    <label for="amount-{props.lineItem.id}" class={amountStyles.label}
      >Amount</label
    >
    <input
      value={isEditable ? amount : props.lineItem.amount.toFixed(2)}
      class={amountStyles.input}
      type="text"
      name="amount"
      id="amount-{props.lineItem.id}"
      disabled
    >
  </div>

  <div
    class={gridItem({ gridArea: "trash", placeSelf: "center", position: { base: "absolute", sm: "static" }, insetInlineEnd: "0", insetBlockStart: "0" })}
  >
    {#if props.canDelete && isEditable}
      <Button
        onclick={() => {
          if (props.mode !== "view") {
            props.removeLineItem(props.lineItem.id);
          }
        }}
        variant="ghost"
        class={css({ textAlign: "center", blockSize: "10", inlineSize: "full" })}
        ><Trash /></Button
      >
    {/if}
  </div>
</div>
