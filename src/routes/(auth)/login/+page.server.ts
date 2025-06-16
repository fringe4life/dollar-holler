import { fail, redirect } from '@sveltejs/kit'

import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email) {
      return fail(400, { email })
    }

    if (!password) {
      return fail(400, { error: 'Your password was missing' })
    }
    console.log(email, password)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('hello')
      return fail(400, { error: error.message })
    } else {
      redirect(303, '/invoices')
    }
  }
}
