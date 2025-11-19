import { createAuthClient } from 'better-auth/svelte'

export const authClient = createAuthClient({
  baseURL: process.env.PUBLIC_BASE_URL || 'http://localhost:5173',
})
