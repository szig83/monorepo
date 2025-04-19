import { z, ZodError } from 'zod'

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production']),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	BETTER_AUTH_SECRET: z.string().optional(),
	BETTER_AUTH_URL: z.string().optional(),
})

// Típus generálása a schemából
type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
	try {
		return envSchema.parse({
			NODE_ENV: process.env.NODE_ENV,
			GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
			BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
			BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		})
	} catch (error) {
		if (error instanceof ZodError) {
			throw new Error(`Invalid environment variables:\n${z.prettifyError(error)}`)
		}
		throw error
	}
}

// Használat
export const env = validateEnv()
