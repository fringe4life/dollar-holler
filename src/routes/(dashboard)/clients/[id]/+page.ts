import { getClientById } from '$lib/stores/clientsStore.svelte'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const { id } = params
  const client = await getClientById(id)

  if (!client) {
    error(404, {
      message: 'Client not found',
    })
  }

  return { client }
}
