import { relations as drizzleRelations } from 'drizzle-orm';
import { inet, integer, jsonb, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { users } from '../users/users';

const auditLogs = schema.table('audit_logs', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id),
	eventType: varchar('event_type', { length: 50 }).notNull(),
	resourceType: varchar('resource_type', { length: 50 }),
	resourceId: integer('resource_id'),
	oldValues: jsonb('old_values'),
	newValues: jsonb('new_values'),
	ipAddress: inet('ip_address'),
	userAgent: text('user_agent'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

const relations = drizzleRelations(auditLogs, ({ one }) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id],
	}),
}));

export { auditLogs, relations };
