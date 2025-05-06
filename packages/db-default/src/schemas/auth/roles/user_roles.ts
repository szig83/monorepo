import { relations as drizzleRelations } from 'drizzle-orm';
import { integer, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { users } from '../users/users';
import { roles } from './roles';

const userRoles = schema.table(
	'user_roles',
	{
		userId: integer('user_id').references(() => users.id),
		roleId: integer('role_id').references(() => roles.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

const relations = drizzleRelations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id],
	}),
}));

export { userRoles, relations };
