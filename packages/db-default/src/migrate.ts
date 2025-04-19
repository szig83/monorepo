import { migrate } from 'drizzle-orm/node-postgres/migrator'

import config from '@/../drizzle.config'
import { env } from '@/lib/env'

import db, { client } from './index'

if (!env.DB_MIGRATING) {
	throw new Error('You must set DB_MIGRATING to true.')
}

console.log('Migrating...')

await migrate(db, { migrationsFolder: config.out! })

await client.end()
