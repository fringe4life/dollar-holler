<script lang="ts">
  import type { FocusEventHandler, FormEventHandler } from "svelte/elements";
  import type {
    LineItemRowProps,
    LineItemUpdate,
  } from "$features/line-items/types";
  import Trash from "$lib/components/icons/Trash.svelte";
  import { Button } from "$lib/components/ui/button";

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
</script>

<div class="invoice-line-item border-fog border-b-2 py-4 sm:py-2">
  <div class="description relative">
    <label for="description-{props.lineItem.id}" class="line-item-label"
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
    <span
      aria-hidden="true"
      class="border-lavenderIndigo ease-anticipate pointer-events-none absolute inset-x-0 inset-be-0 origin-left scale-x-90 border-b-2 border-solid opacity-0 transition-[opacity,scale] duration-200"
    ></span>
  </div>

  <div class="unitPrice relative">
    <label
      for="unitPrice-{props.lineItem.id}"
      class="line-item-label text-right"
      >Unit Price</label
    >
    <input
      class="line-item text-right"
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
    <span
      aria-hidden="true"
      class="border-lavenderIndigo ease-anticipate pointer-events-none absolute inset-x-0 inset-be-0 origin-left scale-x-90 border-b-2 border-solid opacity-0 transition-[opacity,scale] duration-200"
    ></span>
  </div>
  <div class="quantity relative">
    <label
      for="quantity-{props.lineItem.id}"
      class="line-item-label text-center"
      >Qty</label
    >
    <input
      value={props.lineItem.quantity}
      oninput={isEditable ? onQuantityInput : undefined}
      class="line-item text-center"
      type="number"
      name="quantity"
      id="quantity-{props.lineItem.id}"
      min="0"
      required={props.isRequired}
      disabled={!isEditable}
    >
    <span
      aria-hidden="true"
      class="border-lavenderIndigo ease-anticipate pointer-events-none absolute inset-x-0 inset-be-0 origin-left scale-x-90 border-b-2 border-solid opacity-0 transition-[opacity,scale] duration-200"
    ></span>
  </div>
  <div class="amount">
    <label for="amount-{props.lineItem.id}" class="line-item-label text-right"
      >Amount</label
    >
    <input
      value={isEditable ? amount : props.lineItem.amount.toFixed(2)}
      class="line-item text-right"
      type="text"
      name="amount"
      id="amount-{props.lineItem.id}"
      disabled
    >
  </div>
  <div class="trash place-self-center">
    {#if props.canDelete && isEditable}
      <Button
        onclick={() => {
          if (props.mode !== "view") {
            props.removeLineItem(props.lineItem.id);
          }
        }}
        variant="ghost"
        class="text-center block-10 inline-full"
        ><Trash /></Button
      >
    {/if}
  </div>
</div>

<style>
  @reference "#app.css";
  input:where([type="text"], [type="number"]) {
    @apply border-b-2 border-dashed border-stone-300 transition-colors duration-200 block-10 inline-full;
  }
  input[type="text"] {
    @apply font-sansserif text-xl font-bold block-10;
  }

  input[type="number"] {
    @apply font-mono text-base;
  }

  input:where([type="number"], [type="text"]):focus {
    /* @apply border-solid border-lavenderIndigo outline-none; */
    @apply outline-none;
  }

  input:where([type="number"], [type="text"]):disabled {
    @apply border-b-0 bg-transparent px-0;
  }

  .line-item-label {
    @apply block sm:hidden print:hidden;
  }

  :global {
    .invoice-line-item {
      grid-template-areas:
        "description description description"
        "unitPrice   quantity    amount";
      @apply relative grid gap-x-2 sm:grid-cols-[1fr_100px_100px_100px_65px] md:gap-x-5;

      @media screen and (width > 640px) {
        grid-template-areas: "description unitPrice quantity amount trash";
      }

      .description {
        grid-area: description;
      }
      .quantity {
        grid-area: quantity;
      }
      .unitPrice {
        grid-area: unitPrice;
      }
      .amount {
        grid-area: amount;
      }

      .trash {
        grid-area: trash;
        @apply absolute inset-e-0 inset-bs-0 sm:static;
      }

      .field {
        @apply mbe-6;
      }

      @media print {
        grid-template-areas: "description unitPrice quantity amount trash";
      }
    }
  }
</style>
