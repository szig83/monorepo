import { defineConfig } from 'drizzle-kit'
import { env } from './src/env'

const DATABASE_URL = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
console.log(DATABASE_URL)
export default defineConfig({
	out: './src/drizzle',
	schema: './src/schemas/index.ts',
	dialect: 'postgresql',
	schemaFilter: ['public', 'auth'],
	dbCredentials: {
		url: DATABASE_URL,
	},
})
