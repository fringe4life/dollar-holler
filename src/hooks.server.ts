import { auth } from '$lib/auth'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { building } from '$app/environment'
import { type Handle, redirect } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // Fetch current session from Better Auth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  // Make session and user available on server
  if (session) {
    event.locals.session = session.session
    event.locals.user = session.user
  }

  // Handle Better Auth routes
  const authResponse = await svelteKitHandler({
    event,
    resolve,
    auth,
    building,
  })
  if (authResponse) return authResponse

  // Auth guard for protected routes
  if (!event.locals.session && event.url.pathname.startsWith('/invoices')) {
    throw redirect(303, '/login')
  }

  if (!event.locals.session && event.url.pathname.startsWith('/clients')) {
    throw redirect(303, '/login')
  }

  if (!event.locals.session && event.url.pathname.startsWith('/settings')) {
    throw redirect(303, '/login')
  }

  if (
    event.locals.session &&
    (event.url.pathname === '/login' || event.url.pathname === '/signup')
  ) {
    throw redirect(303, '/invoices')
  }

  return resolve(event)
}
