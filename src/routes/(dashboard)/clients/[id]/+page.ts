import { getClientById } from '$lib/stores/clientStore'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
export const load: PageLoad = ({ params }) => {
  const { id } = params
  const client = getClientById(id)
  if (!client) {
    error(404, {
      message: 'Client not found'
    })
  }
  return { client }
}
