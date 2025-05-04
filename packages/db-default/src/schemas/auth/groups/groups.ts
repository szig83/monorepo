import { jsonb, serial, timestamp } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations, InferSelectModel } from 'drizzle-orm'
import { userGroups } from './user_groups'
import { authSchema as schema } from '../schema'
import { createInsertSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { type LocalizedText } from '@repo/utils/common'

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
	name: v.intersect([
		v.object({
			hu: v.string(),
			en: v.string(),
		}),
		v.record(v.string(), v.optional(v.string())),
	]),
})

export { groups, relations as groupsRelations, groupSchema }
export type GroupSchema = v.InferOutput<typeof groupSchema>
export type GroupSelectModel = InferSelectModel<typeof groups>
