import { relations as drizzleRelations } from 'drizzle-orm';
import { jsonb, serial, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-valibot';
import type { LocalizedText } from '@repo/utils/common';
import * as v from 'valibot';
import { authSchema as schema } from '../schema';
import { userGroups } from './user_groups';
import { localizedTextSchema } from '@repo/utils/common';

/**
 * Tábla struktúra
 */
const groups = schema.table('groups', {
	id: serial('id').primaryKey(),
	name: jsonb('name').notNull().$type<LocalizedText>(), // Többnyelvű név
	description: jsonb('description').$type<Partial<LocalizedText>>(), // Opcionális többnyelvű leírás
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

/**
 * Tábla relációk
 */
const relations = drizzleRelations(groups, ({ many }) => ({
	userGroups: many(userGroups),
}));

/**
 * Tábla select séma
 */
const groupSelectSchema = createSelectSchema(groups);

/**
 * Tábla insert séma
 */
const groupInsertSchema = createInsertSchema(groups, {
	name: localizedTextSchema,
	description: v.optional(localizedTextSchema),
});

/**
 * Tábla update séma
 */
const groupUpdateSchema = createUpdateSchema(groups);

/**
 * Exportálás
 */
export {
	groups,
	relations as groupsRelations,
	groupInsertSchema,
	groupSelectSchema,
	groupUpdateSchema,
};
export type GroupInsertSchema = v.InferOutput<typeof groupInsertSchema>;
export type GroupSelectSchema = v.InferOutput<typeof groupSelectSchema>;
export type GroupUpdateSchema = v.InferOutput<typeof groupUpdateSchema>;
