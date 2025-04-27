// First load environment variables from various possible locations
//import './loadEnv'
import { z, ZodError } from 'zod'

const envSchema = z.object({
	DB_HOST: z.string(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	DB_PORT: z.coerce.number(),
	SCHEMA_DIR: z.string().optional().default('schemas'),
	DB_MIGRATING: z
		.string()
		.refine((s) => s === 'true' || s === 'false')
		.transform((s) => s === 'true')
		.optional(),
	SEED_PUBLIC_USER_COUNT: z.coerce.number().optional().default(0),
})

// Típus generálása a schemából
type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
	try {
		return envSchema.parse({
			DB_HOST: process.env.DB_HOST,
			DB_USER: process.env.DB_USER,
			DB_PASSWORD: process.env.DB_PASSWORD,
			DB_NAME: process.env.DB_NAME,
			DB_PORT: process.env.DB_PORT,
			SCHEMA_DIR: process.env.SCHEMA_DIR,
			DB_MIGRATING: process.env.DB_MIGRATING,
			SEED_PUBLIC_USER_COUNT: process.env.SEED_PUBLIC_USER_COUNT,
		})
	} catch (error) {
		if (error instanceof ZodError) {
			throw new Error(`Invalid environment variables:\n${z.prettifyError(error)}`)
		}
		throw error
	}
}

export const env = validateEnv()
