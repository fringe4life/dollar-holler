import type { Invoice } from '../../global'
import data from '../../seed.json'
export default class Invoices {
  invoices = $state<Invoice[]>([])

  loadInvoices() {
    this.invoices = data.invoices
  }
}
