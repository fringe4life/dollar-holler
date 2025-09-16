import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
export const load: PageLoad = async ({ params, fetch }) => {
  const { id } = params
  const response = await fetch(`/api/invoices/${id}`)

  if (!response.ok) {
    error(404, {
      message: 'Invoice not found',
    })
  }

  const invoice = await response.json()
  return { invoice }
}
