import { varchar, boolean, timestamp, serial } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations, InferSelectModel } from 'drizzle-orm'
import { accounts } from '../authentication/accounts'
import { sessions } from '../authentication/sessions'
import { userGroups } from '../groups/user_groups'
import { userRoles } from '../roles/user_roles'
import { auditLogs } from '../audit/audit_logs'
import { verifications } from '../authentication/verifications'

import { authSchema as schema } from '../schema'

import { createInsertSchema } from 'drizzle-valibot'
import * as v from 'valibot'

const users = schema.table('users', {
	id: serial('id').primaryKey() /*Unique identifier for each user*/,
	name: varchar('full_name', { length: 100 }).notNull() /*Full name of the user*/,
	email: varchar('email', { length: 255 }).notNull().unique() /*Email address of the user*/,
	emailVerified:
		boolean('email_verified').default(
			false,
		) /*Indicates if the user's email has been verified*/,
	username: varchar('username', { length: 50 }).unique() /*Username of the user*/,
	image: varchar('image', { length: 255 }) /*Profile image URL of the user*/,
	createdAt: timestamp('created_at', {
		withTimezone: true,
	}).defaultNow() /*Timestamp of user creation*/,
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
	}).defaultNow() /*Timestamp of last user update*/,
	deletedAt: timestamp('deleted_at', { withTimezone: true }) /*Timestamp of user deletion*/,
})

const relations = drizzleRelations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	userGroups: many(userGroups),
	userRoles: many(userRoles),
	auditLogs: many(auditLogs),
	verifications: many(verifications),
}))

const baseSchema = createInsertSchema(users, {
	name: v.pipe(v.string(), v.minLength(1)),
	email: v.pipe(v.string(), v.email(), v.minLength(5)),
	emailVerified: v.optional(v.boolean()),
	username: v.optional(v.string()),
	image: v.optional(v.string()),
})
//.pick({ fullName: true, email: true, image: true })

const userSchema = v.union([
	v.object({
		mode: v.literal('signUp'),
		email: baseSchema.entries.email,
		password: v.pipe(v.string(), v.minLength(6)),
		name: baseSchema.entries.name,
	}),
	v.object({
		mode: v.literal('signIn'),
		email: baseSchema.entries.email,
		password: v.pipe(v.string(), v.minLength(6)),
	}),
	v.object({
		mode: v.literal('update'),
		name: baseSchema.entries.name,
		image: baseSchema.entries.image,
		id: v.pipe(v.number(), v.minValue(1)),
	}),
])

export { users, relations as usersRelations, userSchema }
export type UserSchema = v.InferOutput<typeof userSchema>
export type UserSelectModel = InferSelectModel<typeof users>
