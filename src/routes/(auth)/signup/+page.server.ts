import { fail, redirect } from '@sveltejs/kit'
import { auth } from '$lib/auth'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' })
    }

    try {
      const result = await auth.api.signUpEmail({
        email,
        password,
        name: fullName,
        headers: request.headers,
      })

      if (result.error) {
        return fail(400, { error: result.error.message })
      }

      throw redirect(303, '/login')
    } catch (error) {
      console.error('Signup error:', error)
      return fail(400, { error: 'Signup failed' })
    }
  }
}
