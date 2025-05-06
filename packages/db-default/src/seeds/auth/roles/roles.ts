import type { DB } from '@/index';
import { roles as rolesSeedConfig } from '@/lib/seedConfig';
import { roles } from '@/schemas';

const initData = Object.values(rolesSeedConfig);

/**
 * Inicializálja a szerepkörök táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(roles).values(initData);
}
