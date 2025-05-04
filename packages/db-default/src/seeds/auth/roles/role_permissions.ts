import { type DB } from '@/index'
import { rolePermissions } from '@/schemas'
import { rolePermissions as rolePermissionsSeedConfig } from '@/lib/seedConfig'

/**
 * Inicializálja a szerepkör-jogosultság kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(rolePermissions).values(rolePermissionsSeedConfig)
}
