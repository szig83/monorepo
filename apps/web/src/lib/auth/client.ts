import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
	//you can pass client configuration here
})

export type AuthClient = typeof authClient
