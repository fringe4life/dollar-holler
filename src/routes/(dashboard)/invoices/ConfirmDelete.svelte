<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import { Button } from "$lib/components/ui/button";
  import { invoicesStore } from "$lib/stores/invoicesStore.svelte";
  import type { BitsButton } from "$lib/types";
  import { toast } from "svelte-sonner";

  type Props = {
    open: boolean;
    invoiceId: string;
    clientName: string;
    totalDisplay: string;
  };

  const handleDelete: BitsButton = async () => {
    open = false;
    if (!invoiceId) {
      toast.error("Invoice not found");
      return;
    }
    await invoicesStore.deleteInvoice(invoiceId);
  };

  let {
    invoiceId,
    clientName,
    totalDisplay,
    open = $bindable(),
  }: Props = $props();
</script>

<Modal bind:open buttonText="" className="z-450">
  {#snippet title()}
    <h2 class="text-daisyBush text-center text-xl font-bold">
      Are you sure you want to delete this invoice?
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="text-daisyBush text-center text-lg font-medium">
      This will delete the invoice to <span class="text-scarlet"
        >{clientName}</span
      >
      for
      <span class="text-scarlet">{totalDisplay}</span>
    </h2>
  {/snippet}

  <div class="flex justify-center gap-4">
    <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
    <Button variant="destructive" onclick={handleDelete}>Yes, Delete It.</Button
    >
  </div>
</Modal>
