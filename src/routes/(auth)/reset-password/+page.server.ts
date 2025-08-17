import { fail, redirect } from '@sveltejs/kit'
import { auth } from '$lib/auth'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const password = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const token = formData.get('token') as string

    if (!password) {
      return fail(400, { password, missing: true })
    }
    if (!confirmPassword) {
      return fail(400, { confirmPassword, missing: true })
    }

    if (password !== confirmPassword) {
      return fail(400, { error: "Passwords don't match" })
    }

    try {
      const result = await auth.api.resetPassword({
        password,
        token,
        headers: request.headers,
      })

      if (result.error) {
        return fail(400, { error: result.error.message })
      }

      throw redirect(303, '/invoices')
    } catch (error) {
      console.error('Reset password error:', error)
      return fail(400, { error: 'Failed to reset password' })
    }
  }
}
