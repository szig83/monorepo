import { type DB } from '@/index'
import { roles } from '@/schemas'
import { roles as rolesSeedConfig } from '@/seedConfig'

const initData = Object.values(rolesSeedConfig)

/**
 * Inicializálja a szerepkörök táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(roles).values(initData)
}
