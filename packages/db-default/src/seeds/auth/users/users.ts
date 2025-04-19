import { type DB } from '@/index'
//import { type UserSchema, users, userGroups, accounts } from '@/schemas'
import * as schema from '@/schemas'
import { type PgDatabase } from 'drizzle-orm/pg-core'
import { type NodePgQueryResultHKT } from 'drizzle-orm/node-postgres'
import { seedConfig } from '@/seedConfig'
import { hashPassword } from '@repo/utils/common'
import { faker } from '@faker-js/faker'

type mockUser = Omit<Extract<schema.UserSchema, { mode: 'signUp' }>, 'mode'>
type UserConfig = {
	groupId: number
	name: string
	email: string
	password: string
}

/**
 * Véletlenszerű nevekkel, jelszavakkal és e-mail címekkel rendelkező publikus felhasználók listáját generálja.
 *
 * @param count - A generált publikus felhasználók száma.
 * @returns {mockUser[]} Publikus felhasználói objektumok tömbje.
 */
const mock = (count: number): mockUser[] => {
	const data: mockUser[] = []

	for (let i = 0; i < count; i++) {
		data.push({
			name: faker.person.fullName(),
			password: faker.internet.password({ memorable: true, length: 10 }),
			email: faker.internet.email().toLowerCase(),
		})
	}

	return data
}

/**
 * Hozzárendeli a felhasználót egy csoporthoz.
 *
 * @param db - Az adatbázis példány.
 * @param userId - A frissítendő felhasználó azonosítója.
 * @param groupId - A csoport azonosítója, amelyhez a felhasználót hozzá kell rendelni.
 */
const updateUserAndAssignGroup = async (
	db: PgDatabase<NodePgQueryResultHKT, typeof schema>,
	userId: number,
	groupId: number,
) => {
	await db.insert(schema.userGroups).values({
		userId,
		groupId,
	})
}

/**
 * Létrehoz egy felhasználót és hozzárendeli a csoporthoz.
 *
 * @param db - Az adatbázis példány.
 * @param userConfig - A felhasználó konfigurációja.
 * @returns {Promise<{ user?: { id: number } }>} A beszúrt felhasználó azonosítója.
 */
const addUser = async (
	db: DB,
	userConfig: UserConfig,
): Promise<{
	user?: { id: number; email: string; name: string; password: string }
}> => {
	return db.transaction(async (tx) => {
		// User beszúrása
		const userResult = await tx
			.insert(schema.users)
			.values({
				name: userConfig.name,
				email: userConfig.email,
				emailVerified: true,
			})
			.returning({ id: schema.users.id, email: schema.users.email, name: schema.users.name, password: schema.users.name })

		const insertedUser = userResult[0]
		if (!insertedUser) {
			// Ha a felhasználó beszúrása sikertelen, a tranzakció automatikusan visszagörgeti.
			// Dobjunk egy hibát, hogy jelezzük a problémát.
			throw new Error('Failed to insert user.')
		}

		// Accounts táblába beszúrás
		const accountResult = await tx
			.insert(schema.accounts)
			.values({
				userId: insertedUser.id,
				providerAccountId: insertedUser.id.toString(), // Ugyanaz mint a user id string formában
				providerId: 'credential', // Az email/jelszavas providert használjuk
				password: hashPassword(userConfig.password),
				isActive: true,
			})
			.returning({ id: schema.accounts.id, password: schema.accounts.password })

		const insertedAccount = accountResult[0]
		if (!insertedAccount) {
			// Ha az account beszúrása sikertelen, a tranzakció automatikusan visszagörgeti.
			// Dobjunk egy hibát, hogy jelezzük a problémát.
			throw new Error('Failed to insert account.')
		}
		insertedUser.password = userConfig.password

		// Felhasználó hozzárendelése a csoporthoz
		await updateUserAndAssignGroup(tx, insertedUser.id, userConfig.groupId)

		// Ha minden sikeres, a tranzakció commitálódik és visszaadjuk a felhasználó ID-ját.
		return { user: insertedUser }
	})
}

/**
 * Feltölti az adatbázist felhasználókkal.
 *
 * A feltöltési folyamat a következőképpen működik:
 *  1. Létrehoz egy rendszergazda felhasználót és hozzárendeli a rendszergazda csoporthoz.
 *  2. Létrehoz egy admin felhasználót és hozzárendeli az admin csoporthoz.
 *  3. Létrehoz egy tartalomszerkesztő felhasználót és hozzárendeli a tartalomszerkesztő csoporthoz.
 *  4. Ha a darabszám nagyobb mint 0, létrehozza a megadott számú nyilvános felhasználót és hozzárendeli őket a nyilvános felhasználói csoporthoz.
 *
 * @param db - Az adatbázis példány.
 * @param publicUserCount - A létrehozandó nyilvános felhasználók száma.
 */
export async function seed(db: DB, publicUserCount: number = 0) {
	const sysAdminUser = await addUser(db, seedConfig.users.sysadmin)
	console.log('Rendszergazda felhasználó:', sysAdminUser.user)

	if (sysAdminUser.user) {
		const adminUser = await addUser(db, seedConfig.users.admin)
		console.log('Admin felhasználó:', adminUser.user)
		const contentEditorUser = await addUser(db, seedConfig.users.content_editor)
		console.log('Tartalomszerkesztő felhasználó:', contentEditorUser.user)

		if (publicUserCount > 0) {
			const mockUsers = mock(publicUserCount)
			for (const user of mockUsers) {
				const publicUser = await addUser(db, { ...seedConfig.users.public_user, ...user })
				console.log('Nyilvános felhasználó:', publicUser.user)
			}
		}
	}
}
