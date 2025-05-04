import chalk from 'chalk'
import { client } from './index'
import {
	deleteSchemas,
	getSchemasFromOrm,
	getSchemasFromDB,
	getLatestBackupFile,
	createSnapshot,
	restore,
} from '@/lib/utils'
import * as cm from '@/lib/consoleMessage'

async function start() {
	let isSuccess = false
	const stopOnError = false // Leállítsa-e a teljes folyamat futását hiba esetén (process.exit(1))

	cm.startScript('Adatbázis inicializálás indítása')
	cm.subProcess('Adatbázis kapcsolat létrehozva', 'success', '', 0, true)

	// Backup fájl keresése
	const backupFile = await getLatestBackupFile(stopOnError)

	if (backupFile) {
		// Sémák keresése (orm séma szerkezetből)
		const schemas = getSchemasFromOrm(stopOnError)

		if (schemas.length > 0) {
			// Biztonsági mentés készítése a meglévő adatbázisról
			const databaseSnapshot = await createSnapshot(stopOnError)

			if (databaseSnapshot) {
				// Sémák törlése az adatbázisból
				const deleteSchemaResult = await deleteSchemas(schemas)

				let needToRestoreSnapshot = false

				if (deleteSchemaResult.isSuccess) {
					// Maradék séma lekérése az adatbázisból
					const dbSchemas = (await getSchemasFromDB(stopOnError, 'Maradék séma lekérése'))
						.schemas
					if (dbSchemas.length > 0) {
						if (
							(await deleteSchemas(dbSchemas, stopOnError, 'Maradék séma törlése'))
								.deletedSchemas.length > 0
						) {
							needToRestoreSnapshot = true
						}
					}
					// Adatbázis betöltése a backup fájlból
					const loadDatabase: boolean = await restore(backupFile, stopOnError)

					if (loadDatabase) {
						isSuccess = true
					} else {
						needToRestoreSnapshot = true
					}
				} else if (deleteSchemaResult.deletedSchemas.length > 0) {
					needToRestoreSnapshot = true
				}

				// Ha a betöltés sikertelen volt (vagy részlegesen törlődtek sémák), akkor visszaállítjuk a snapshotot
				if (needToRestoreSnapshot) {
					await restore(databaseSnapshot, stopOnError, true)
				}
			}
		}
	}

	await client.end()
	cm.subProcess('Adatbázis kapcsolat bontva', 'success', '', 0, true)

	if (isSuccess) {
		console.log(chalk.underline('\n✨ ADATBÁZIS VISSZAÁLLÍTÁSA SIKERESEN BEFEJEZVE!') + '\n')
		process.exit(0)
	} else {
		console.error(chalk.underline('\n🔥 ADATBÁZIS VISSZAÁLLÍTÁSA SIKERTELEN') + '\n')
		process.exit(1)
	}
}

start().catch((e) => {
	console.error(chalk.red('\n🔥 Váratlan hiba történt a visszaállítási folyamat során:'), e)
	process.exit(1)
})
