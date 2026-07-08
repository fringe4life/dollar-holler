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
      amount: q * Number(unitPrice),
      quantity: q,
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
    display: { _print: "none", base: "none", sm: "block" },
  });

  const qtyStyles = lineItemFieldRecipe({
    align: "center",
    inputType: "number",
  });
  const priceStyles = lineItemFieldRecipe({
    align: "right",
    inputType: "number",
  });
  const amountStyles = lineItemFieldRecipe({
    align: "right",
    inputType: "text",
  });
</script>

<div
  class={cx(invoiceLineItem, css({ borderColor: "fog", borderBottomWidth: 2, paddingBlock: { base: 4, sm: 2 } }))}
>
  <div class={gridItem({ gridArea: "description", position: "relative" })}>
    <label class={lineItemLabel} for="description-{props.lineItem.id}"
      >Description</label
    >
    <input
      class="line-item"
      disabled={!isEditable}
      id="description-{props.lineItem.id}"
      name="description"
      oninput={isEditable ? onDescriptionInput : undefined}
      required={props.isRequired}
      type="text"
      value={props.lineItem.description}
    >
    <span aria-hidden="true" class={priceStyles.border}></span>
  </div>

  <div class={gridItem({ position: "relative", gridArea: "unitPrice" })}>
    <label class={priceStyles.label} for="unitPrice-{props.lineItem.id}"
      >Unit Price</label
    >
    <input
      class={priceStyles.input}
      disabled={!isEditable}
      id="unitPrice-{props.lineItem.id}"
      min={isEditable ? "0" : undefined}
      name="unitPrice"
      onblur={isEditable ? formatUnitPrice : undefined}
      oninput={isEditable ? onUnitPriceInput : undefined}
      required={props.isRequired}
      step={isEditable ? "0.01" : undefined}
      type={isEditable ? "number" : "text"}
      value={isEditable ? unitPrice : displayUnitPrice}
    >
    <!-- "border-lavenderIndigo ease-anticipate pointer-events-none absolute inset-x-0 inset-be-0 origin-left scale-x-90 border-b-2 border-solid opacity-0 transition-[opacity,scale] duration-200" -->
    <span aria-hidden="true" class={priceStyles.border}></span>
  </div>
  <div class={gridItem({ gridArea: "quantity", position: "relative" })}>
    <label class={qtyStyles.label} for="quantity-{props.lineItem.id}"
      >Qty</label
    >
    <input
      class={qtyStyles.input}
      disabled={!isEditable}
      id="quantity-{props.lineItem.id}"
      min="0"
      name="quantity"
      oninput={isEditable ? onQuantityInput : undefined}
      required={props.isRequired}
      type="number"
      value={props.lineItem.quantity}
    >
    <span aria-hidden="true" class={qtyStyles.border}></span>
  </div>
  <div class={gridItem({ gridArea: "amount" })}>
    <label class={amountStyles.label} for="amount-{props.lineItem.id}"
      >Amount</label
    >
    <input
      class={amountStyles.input}
      disabled
      id="amount-{props.lineItem.id}"
      name="amount"
      type="text"
      value={isEditable ? amount : props.lineItem.amount.toFixed(2)}
    >
  </div>

  <div
    class={gridItem({ gridArea: "trash", placeSelf: "center", position: { base: "absolute", sm: "static" }, insetInlineEnd: "0", insetBlockStart: "0" })}
  >
    {#if props.canDelete && isEditable}
      <Button
        class={css({ textAlign: "center", blockSize: "10", inlineSize: "full" })}
        onclick={() => {
          if (props.mode !== "view") {
            props.removeLineItem(props.lineItem.id);
          }
        }}
        variant="ghost"
        ><Trash /></Button
      >
    {/if}
  </div>
</div>
