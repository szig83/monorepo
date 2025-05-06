import { relations as drizzleRelations } from 'drizzle-orm';
import { serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { rolePermissions } from './role_permissions';
import { userRoles } from './user_roles';

const roles = schema.table('roles', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

const relations = drizzleRelations(roles, ({ many }) => ({
	userRoles: many(userRoles),
	rolePermissions: many(rolePermissions),
}));

export { roles, relations };
