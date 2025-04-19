import { varchar, boolean, timestamp, serial } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations, InferSelectModel } from 'drizzle-orm'
import { accounts } from '../authentication/accounts'
import { sessions } from '../authentication/sessions'
import { userGroups } from '../groups/user_groups'
import { userRoles } from '../roles/user_roles'
import { auditLogs } from '../audit/audit_logs'
import { verifications } from '../authentication/verifications'

import { authSchema as schema } from '../schema'

import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

const users = schema.table('users', {
	id: serial('id').primaryKey() /*Unique identifier for each user*/,
	name: varchar('full_name', { length: 100 }).notNull() /*Full name of the user*/,
	email: varchar('email', { length: 255 }).notNull().unique() /*Email address of the user*/,
	emailVerified:
		boolean('email_verified').default(false) /*Indicates if the user's email has been verified*/,
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
	name: z.string().min(1),
	email: z.string().email().min(5),
	emailVerified: z.boolean().optional(),
	username: z.string().optional(),
	image: z.string().optional(),
})
//.pick({ fullName: true, email: true, image: true })

const userSchema = z.union([
	z.object({
		mode: z.literal('signUp'),
		email: baseSchema.shape.email,
		password: z.string().min(6),
		name: baseSchema.shape.name,
	}),
	z.object({
		mode: z.literal('signIn'),
		email: baseSchema.shape.email,
		password: z.string().min(6),
	}),
	z.object({
		mode: z.literal('update'),
		name: baseSchema.shape.name,
		image: baseSchema.shape.image,
		id: z.number().min(1),
	}),
])

export { users, relations as usersRelations, userSchema }
export type UserSchema = z.infer<typeof userSchema>
export type UserSelectModel = InferSelectModel<typeof users>
