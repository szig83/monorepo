import type { DB } from '@/index';
import { permissions as permissionsSeedConfig } from '@/lib/seedConfig';
import { permissions } from '@/schemas';

const initData = Object.values(permissionsSeedConfig);

/**
 * Inicializálja a jogosultságok táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(permissions).values(initData);
}
