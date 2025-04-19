import { type DB } from '@/index'
import { userRoles } from '@/schemas'
import { userRoles as userRolesSeedConfig } from '@/seedConfig'

/**
 * Inicializálja a felhasználó-szerepkör kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(userRoles).values(userRolesSeedConfig)
}
