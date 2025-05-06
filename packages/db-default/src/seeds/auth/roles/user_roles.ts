import type { DB } from '@/index';
import { userRoles as userRolesSeedConfig } from '@/lib/seedConfig';
import { userRoles } from '@/schemas';

/**
 * Inicializálja a felhasználó-szerepkör kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(userRoles).values(userRolesSeedConfig);
}
