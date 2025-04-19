import { serial, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations } from 'drizzle-orm'
import { groups } from './groups'
import { permissions } from '../permissions/permissions'
import { authSchema as schema } from '../schema'

const groupPermissions = schema.table(
	'group_permissions',
	{
		groupId: serial('group_id').references(() => groups.id),
		permissionId: integer('permission_id').references(() => permissions.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.groupId, table.permissionId] })],
)

const relations = drizzleRelations(groupPermissions, ({ one }) => ({
	group: one(groups, {
		fields: [groupPermissions.groupId],
		references: [groups.id],
	}),
	permission: one(permissions, {
		fields: [groupPermissions.permissionId],
		references: [permissions.id],
	}),
}))

export { groupPermissions, relations }
