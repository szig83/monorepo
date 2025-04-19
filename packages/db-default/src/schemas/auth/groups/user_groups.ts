import { integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations, InferSelectModel } from 'drizzle-orm'
import { users } from '../users/users'
import { groups } from './groups'
import { authSchema as schema } from '../schema'

import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

const userGroups = schema.table(
	'user_groups',
	{
		userId: integer('user_id').references(() => users.id),
		groupId: integer('group_id').references(() => groups.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.groupId] })],
)

const relations = drizzleRelations(userGroups, ({ one }) => ({
	user: one(users, {
		fields: [userGroups.userId],
		references: [users.id],
	}),
	group: one(groups, {
		fields: [userGroups.groupId],
		references: [groups.id],
	}),
}))

const userGroupsSchema = createInsertSchema(userGroups)

export { userGroups, relations as userGroupsRelations, userGroupsSchema }
export type UserGroupSchema = z.infer<typeof userGroupsSchema>
export type UserGroupSelectModel = InferSelectModel<typeof userGroups>
