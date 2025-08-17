import { fail, redirect } from '@sveltejs/kit'
import { auth } from '$lib/auth'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email) {
      return fail(400, { email })
    }

    if (!password) {
      return fail(400, { error: 'Your password was missing' })
    }

    try {
      const result = await auth.api.signInEmail({
        email,
        password,
        headers: request.headers,
      })

      if (result.error) {
        return fail(400, { error: result.error.message })
      }

      throw redirect(303, '/invoices')
    } catch (error) {
      console.error('Login error:', error)
      return fail(400, { error: 'Login failed' })
    }
  }
}
