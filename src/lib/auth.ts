import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { sveltekitCookies } from 'better-auth/svelte-kit'
import { getRequestEvent } from '$app/server'
import { db } from '$lib/db'

export const auth = betterAuth({
  appName: 'Dollar Holler',
  baseURL: process.env.PUBLIC_BASE_URL || 'http://localhost:5173',
  database: drizzleAdapter(db, {
    provider: 'pg', // PostgreSQL
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [sveltekitCookies(getRequestEvent)],
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.PUBLIC_BASE_URL,
  ].filter(Boolean) as string[],
})
