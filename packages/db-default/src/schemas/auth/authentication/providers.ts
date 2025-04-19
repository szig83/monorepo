import { serial, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations } from 'drizzle-orm'
import { accounts } from './accounts'
import { authSchema as schema } from '../schema'

const providers = schema.table('providers', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	enabled: boolean('enabled').default(true),
	config: jsonb('config'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

const relations = drizzleRelations(providers, ({ many }) => ({
	accounts: many(accounts),
}))

export { providers, relations }
