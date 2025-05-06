import type { DB } from '@/index';
import { groups as groupSeedConfig } from '@/lib/seedConfig';
import { type GroupSchema, groups } from '@/schemas';

const initData: GroupSchema[] = Object.values(groupSeedConfig);

/**
 * Inicializálja a csoportok táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(groups).values(initData);
}
