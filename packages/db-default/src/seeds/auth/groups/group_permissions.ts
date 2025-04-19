import { type DB } from '@/index'
import { groupPermissions } from '@/schemas'
import { groupPermissions as groupPermissionsSeedConfig } from '@/seedConfig'

/**
 * Inicializálja a csoport-jogosultság kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(groupPermissions).values(groupPermissionsSeedConfig)
}
