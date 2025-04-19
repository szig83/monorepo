import { serial, varchar, timestamp, integer, boolean, text } from 'drizzle-orm/pg-core'
import { relations as drizzleRelations } from 'drizzle-orm'
import { users } from '../users/users'
import { providers } from './providers'
import { authSchema as schema } from '../schema'

const accounts = schema.table('accounts', {
	id: serial('id').primaryKey() /*Unique identifier for each account*/,
	userId: integer('user_id')
		.notNull()
		.references(() => users.id) /*The id of the user*/,
	providerAccountId:
		text(
			'provider_account_id',
		).notNull() /*The id of the account as provided by the SSO or equal to userId for credential accounts*/,
	providerId: text('provider_id').notNull() /*The id of the provider*/,
	accessToken: text('access_token') /*The access token for the account. Returned by the provider*/,
	refreshToken:
		text('refresh_token') /*The refresh token for the account. Returned by the provider*/,
	accessTokenExpiresAt: timestamp('access_token_expires_at', {
		withTimezone: true,
	}) /*The expiration time of the access token*/,
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
		withTimezone: true,
	}) /*The expiration time of the refresh token*/,
	scope: varchar('scope', { length: 255 }) /*The scope of the account. Returned by the provider*/,
	idToken: text('id_token') /*The id token returned from the provider*/,
	isActive: boolean('is_active').default(true) /*Indicates if the account is active*/,
	password: varchar('password', { length: 255 }) /*The password for the account*/,
	failedLoginAttempts:
		integer('failed_login_attempts').default(0) /*The number of failed login attempts*/,
	lastLoginAt: timestamp('last_login_at', { withTimezone: true }) /*The last login time*/,
	passwordChangedAt: timestamp('password_changed_at', {
		withTimezone: true,
	}) /*The time the password was last changed*/,
	createdAt: timestamp('created_at', {
		withTimezone: true,
	}).defaultNow() /*The time the account was created*/,
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
	}).defaultNow() /*The time the account was last updated*/,
})

const relations = drizzleRelations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
	provider: one(providers, {
		fields: [accounts.providerId],
		references: [providers.id],
	}),
}))

export { accounts, relations }
