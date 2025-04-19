import { serial, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations } from 'drizzle-orm'
import { roles } from './roles'
import { permissions } from '../permissions/permissions'
import { authSchema as schema } from '../schema'

const rolePermissions = schema.table(
	'role_permissions',
	{
		roleId: serial('role_id').references(() => roles.id),
		permissionId: integer('permission_id').references(() => permissions.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
)

const relations = drizzleRelations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id],
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id],
	}),
}))

export { rolePermissions, relations }
