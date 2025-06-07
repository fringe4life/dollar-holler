import { getInvoiceById } from '$lib/stores/InvoiceStore'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
export const load: PageLoad = ({ params }) => {
  const { id } = params
  const invoice = getInvoiceById(id)
  if (!invoice) {
    error(404, {
      message: 'Invoice not found'
    })
  }
  return { invoice }
}
