import { type InferSelectModel, relations as drizzleRelations } from 'drizzle-orm';
import { integer, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { users } from '../users/users';
import { groups } from './groups';

import { createInsertSchema } from 'drizzle-valibot';
import type * as v from 'valibot';

const userGroups = schema.table(
	'user_groups',
	{
		userId: integer('user_id').references(() => users.id),
		groupId: integer('group_id').references(() => groups.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.groupId] })],
);

const relations = drizzleRelations(userGroups, ({ one }) => ({
	user: one(users, {
		fields: [userGroups.userId],
		references: [users.id],
	}),
	group: one(groups, {
		fields: [userGroups.groupId],
		references: [groups.id],
	}),
}));

const userGroupsSchema = createInsertSchema(userGroups);

export { userGroups, relations as userGroupsRelations, userGroupsSchema };
export type UserGroupSchema = v.InferOutput<typeof userGroupsSchema>;
export type UserGroupSelectModel = InferSelectModel<typeof userGroups>;
