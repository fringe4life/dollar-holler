import type { Invoice } from '$lib/db/schema'
import data from '../../seed.json'
export default class Invoices {
  invoices = $state<Invoice[]>([])

  loadInvoices() {
    this.invoices = data.invoices
  }
}
