import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '@/lib/env'
import * as schema from './schemas'

const pool = new Pool({
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	host: env.DB_HOST,
	port: env.DB_PORT,
	database: env.DB_NAME,
	max: env.DB_MIGRATING ? 1 : undefined,
})

const db = drizzle(pool, {
	schema,
})

export default db
export { pool as client }
export type DB = typeof db
