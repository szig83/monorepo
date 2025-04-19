import { jsonb, timestamp, serial } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations, InferSelectModel } from 'drizzle-orm'
import { userGroups } from './user_groups'
import { authSchema as schema } from '../schema'

import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { localizedTextSchema, type LocalizedText } from '@repo/utils/common'

const groups = schema.table('groups', {
	id: serial('id').primaryKey(),
	name: jsonb('name').notNull().$type<LocalizedText>(), // Többnyelvű név
	description: jsonb('description').$type<Partial<LocalizedText>>(), // Opcionális többnyelvű leírás
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

const relations = drizzleRelations(groups, ({ many }) => ({
	userGroups: many(userGroups),
}))

const groupSchema = createInsertSchema(groups, {
	name: localizedTextSchema,
	description: localizedTextSchema.partial().optional(),
})

export { groups, relations as groupsRelations, groupSchema }
export type GroupSchema = z.infer<typeof groupSchema>
export type GroupSelectModel = InferSelectModel<typeof groups>
