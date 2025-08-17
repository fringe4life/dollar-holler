import { fail } from '@sveltejs/kit'
import { auth } from '$lib/auth'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string

    if (!email) {
      return fail(400, { email, missing: true })
    }

    try {
      const result = await auth.api.forgetPassword({
        body: { email },
        headers: request.headers,
      })

      if (!result.status) {
        return fail(400, { error: 'Failed to send reset email', email })
      }

      return { success: true }
    } catch (error) {
      console.error('Forgot password error:', error)
      return fail(400, { error: 'Failed to send reset email' })
    }
  }
}
