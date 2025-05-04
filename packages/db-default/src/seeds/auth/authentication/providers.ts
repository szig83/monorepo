import { type DB } from '@/index'
import { providers } from '@/schemas'
import { providers as providersSeedConfig } from '@/lib/seedConfig'

/**
 * Konvertálja a seedConfig szolgáltató adatokat a séma formátumára.
 * Az id mező string helyett number típusú a sémában, illetve elhagyjuk
 * mert a serial típus automatikusan generálódik.
 */
const initData = Object.values(providersSeedConfig).map((provider) => ({
	name: provider.name,
	enabled: provider.enabled,
	config: provider.config,
}))

/**
 * Inicializálja a szolgáltatók táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(providers).values(initData)
}
