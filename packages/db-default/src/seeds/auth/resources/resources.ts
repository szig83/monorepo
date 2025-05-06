import type { DB } from '@/index';
import { resources as resourcesSeedConfig } from '@/lib/seedConfig';
import { resources } from '@/schemas';

const initData = Object.values(resourcesSeedConfig);

/**
 * Inicializálja az erőforrások táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(resources).values(initData);
}
