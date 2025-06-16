import { fail } from '@sveltejs/kit'
import { PUBLIC_BASE_URL } from '$env/static/public'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string

    if (!email) {
      return fail(400, { email, missing: true })
    }
    console.log({ email })
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${PUBLIC_BASE_URL}/reset-password`
    })
    if (error) {
      return fail(400, { error: error.message, email})
    } else {
      console.log('succees')
      return { success: true }
    }
  }
}
