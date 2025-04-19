import { type DB } from '@/index'
import { permissions } from '@/schemas'
import { permissions as permissionsSeedConfig } from '@/seedConfig'

const initData = Object.values(permissionsSeedConfig)

/**
 * Inicializálja a jogosultságok táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(permissions).values(initData)
}
