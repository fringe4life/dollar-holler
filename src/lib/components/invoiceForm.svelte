<script lang="ts">
  import Trash from '$lib/icon/Trash.svelte'
  import type { LineItem } from '../../global'
  import LineItemRows from '../../routes/(dashboard)/invoices/LineItemRows.svelte'
  import Button from './ui/button/button.svelte'

  const blankLineItem: LineItem[] = [
    {
      id: '1',
      description: 'big job',
      amount: 30,
      quantity: 5
    },
    {
      id: '2',
      description: 'little job',
      amount: 30000,
      quantity: 5
    },
    {
      id: '3',
      description: 'just right job',
      amount: 300000,
      quantity: 50
    }
  ]
</script>

<form class="grid grid-cols-6 gap-x-5">
  <!-- client -->

  <div class="field col-span-2">
    <label for="client">Client</label>
    <select value="zeal" name="client">Zeal</select>
  </div>
  <div class="field col-span-2 flex items-end gap-x-4">
    <p class="text-monsoon text-base leading-14 font-bold">or</p>
    <Button variant="outline">+ Client</Button>
  </div>

  <!-- invoiceid -->
  <div class="field col-span-2">
    <label for="id">InvoiceId</label>
    <input type="number" name="id" />
  </div>
  <!-- duedate -->
  <div class="field col-span-2">
    <label for="dueDate"></label>
    <input type="date" name="dueDate" />
  </div>
  <!-- issue date -->
  <div class="field col-span-2 col-start-5">
    <label for="issueDate"></label>
    <input type="date" name="issueDate" />
  </div>
  <!-- subject -->
  <div class="field col-span-6">
    <label for="subject">Subject</label>
    <input type="text" name="subject" />
  </div>
  <!-- line items -->
  <div class="field col-span-6">
    <LineItemRows lineItems={blankLineItem} />
  </div>

  <!-- notes -->
  <div class="field col-span-6">
    <label for="notes"
      >Notes <span class="font-normal">(optional, displayed on invoice)</span></label
    >
    <textarea name="notes" id="notes"></textarea>
  </div>
  <!-- terms -->
  <div class="field col-span-6">
    <label for="terms"
      >Terms <span class="font-normal">(optional, displayed on invoice)</span></label
    >
    <textarea name="terms" id="terms"></textarea>
    <p class="text-xs text-gray-400">Formatting tips: <strong>*bold*</strong>, <em>_italic_</em></p>
  </div>
  <!-- buttons -->
  <div class="field col-span-2">
    <!-- delete button only visible if editing -->
    <Button variant="textOnlyDestructive"><Trash />Delete</Button>
  </div>
  <div class="field col-span-4 flex justify-end gap-x-5">
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </div>
</form>
