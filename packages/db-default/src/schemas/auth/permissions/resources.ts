import { serial, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations } from 'drizzle-orm'
import { permissions } from './permissions'
import { authSchema as schema } from '../schema'

const resources = schema.table('resources', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

const relations = drizzleRelations(resources, ({ many }) => ({
	permissions: many(permissions),
}))

export { resources, relations }
