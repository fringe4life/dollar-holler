import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const password = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string
    if (!password) {
      return fail(400, { password, missing: true })
    }
    if (!confirmPassword) {
      return fail(400, { confirmPassword, missing: true })
    }

    if (password !== confirmPassword) {
      return fail(400, { error: "Passwords don't match" })
    }

    const { error } = await supabase.auth.updateUser({
      password
    })
    if (error) {
      return fail(400, { error: error.message })
    } else {
      throw redirect(303, '/invoices')
    }
  }
}
