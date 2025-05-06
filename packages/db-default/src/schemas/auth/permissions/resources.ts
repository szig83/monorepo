import { relations as drizzleRelations } from 'drizzle-orm';
import { serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { permissions } from './permissions';

const resources = schema.table('resources', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

const relations = drizzleRelations(resources, ({ many }) => ({
	permissions: many(permissions),
}));

export { resources, relations };
