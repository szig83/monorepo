import chalk from 'chalk'
import { is, sql } from 'drizzle-orm'
import db from '@/index'
import * as path from 'path'
import * as fs from 'fs'
import { execSync } from 'child_process'
import { config } from '@/lib/config'
import * as cm from '@/lib/consoleMessage'
import { format } from 'date-fns'

/**
 * Törli a megadott sémákat az adatbázisból.
 * @param schemasToDelete A törlendő sémák neveinek tömbje.
 * @param stopOnError Ha igaz, akkor a hiba esetén leállítja a folyamatot.
 */
export async function deleteSchemas(
	schemasToDelete: string[],
	stopOnError = true,
): Promise<{ isSuccess: boolean; deletedSchemas: string[] }> {
	const processText = 'Sémák törlése'
	let isSuccess = true
	const deletedSchemas: string[] = []
	const silentDeleteSchemas = ['drizzle']

	schemasToDelete.push('drizzle')
	if (!schemasToDelete.includes('public')) {
		schemasToDelete.push('public')
	}

	cm.startProcess(processText)

	for (const schemaName of schemasToDelete) {
		try {
			await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE;`))
			if (!silentDeleteSchemas.includes(schemaName)) {
				deletedSchemas.push(schemaName)
				cm.subProcess('Sikeresen törölve', 'success', schemaName)
			}
		} catch (error) {
			if (!silentDeleteSchemas.includes(schemaName)) {
				isSuccess = false
				cm.subProcess('Sikertelen törlés', 'error', schemaName)
				if (stopOnError) {
					cm.consoleMessage(error, 'error')
					cm.endProcess(processText, 'error')
					process.exit(1)
				} else {
					break
				}
			}
		}
	}

	if (isSuccess) {
		cm.endProcess(processText, 'success')
	} else {
		cm.endProcess(processText, 'error')
	}

	return {
		isSuccess,
		deletedSchemas,
	}
}

/**
 * Megkeresi a legújabb SQL backup fájlt a megadott könyvtárban.
 * @param stopOnError Ha igaz, akkor a hiba esetén leállítja a folyamatot.
 */
export async function getLatestBackupFile(stopOnError = true): Promise<string> {
	const processText = 'Legújabb backup fájl keresése'
	let isSuccess = true
	cm.startProcess(processText)

	const backupDir = path.join(__dirname, '..', config.BACKUP_DIR)
	cm.subProcess('Backup könyvtár', 'info', backupDir)
	let files: string[] = []

	try {
		files = fs.readdirSync(backupDir)
	} catch (error) {
		isSuccess = false
		cm.subProcess('Hiányzó backup könyvtár', 'error')
		if (stopOnError) {
			cm.consoleMessage(error, 'error')
			cm.endProcess(processText, 'error')
			process.exit(1)
		}
		cm.endProcess(processText, 'error')
	}

	if (isSuccess) {
		const sqlFiles = files
			.filter((file) => path.extname(file) === '.sql')
			.map((file) => ({
				name: file,
				time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
			}))
			.sort((a, b) => b.time - a.time)

		const latestBackup = sqlFiles[0]

		if (!latestBackup) {
			cm.subProcess('Nem található SQL backup fájl a könyvtárban', 'error')
			cm.endProcess(processText, 'error')
			if (stopOnError) {
				process.exit(1)
			}
		} else {
			const latestBackupFile = latestBackup.name
			const filePath = path.join(backupDir, latestBackupFile)
			cm.subProcess('Legújabb backup fájl:', 'success', latestBackupFile)
			cm.endProcess(processText, 'success')
			return filePath
		}
	} else {
		cm.endProcess(processText, 'error')
	}

	return ''
}

/**
 * Készít egy pillanatképet az adatbázisról és elmenti a megadott könyvtárba.
 * @param stopOnError Ha igaz, akkor a hiba esetén leállítja a folyamatot.
 */
export async function createSnapshot(stopOnError = true): Promise<string> {
	const processText = 'Pillanatkép készítés'
	let isSuccess = false
	cm.startProcess(processText)

	const snapshotDir = path.join(__dirname, '..', config.BACKUP_DIR, 'snapshots')
	if (!fs.existsSync(snapshotDir)) {
		fs.mkdirSync(snapshotDir, { recursive: true })
	}

	cm.subProcess('Snapshot könyvtár', 'info', snapshotDir)
	const filename = `${format(new Date(), 'yyyyMMdd_HHmmss')}.sql`
	const snapshotFile = path.join(snapshotDir, filename)
	try {
		execSync(
			`docker exec ${config.DB_NAME}-db-container pg_dump -U ${config.DB_USER} --no-owner --no-privileges --inserts --encoding=UTF-8 --format=p ${config.DB_NAME} > ${snapshotFile}`,
		)
		if (fs.existsSync(snapshotFile)) {
			isSuccess = true
			cm.subProcess('A pillanatkép elkészült:', 'success', filename)
		} else {
			cm.subProcess('Hiba a pillanatkép készítése közben', 'error')
		}
	} catch (error) {
		cm.subProcess('Hiba a pillanatkép készítése közben', 'error')
		if (stopOnError) {
			cm.consoleMessage(error, 'error')
			cm.endProcess(processText, 'error')
			process.exit(1)
		}
	}

	cm.endProcess(processText, isSuccess ? 'success' : 'error')

	return isSuccess ? snapshotFile : ''
}

export function findSchemas(stopOnError = true): string[] {
	const processText = 'Sémák ellenőrzése'
	let isSuccess = false
	let schemas: string[] = []

	cm.startProcess(processText)
	const schemasDir = path.resolve(__dirname, '..', config.SCHEMA_DIR)
	cm.subProcess('Séma könyvtár', 'info', schemasDir)

	try {
		const dirents = fs.readdirSync(schemasDir, { withFileTypes: true })
		schemas = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)

		if (schemas.length > 0) {
			const expectedSchemas = [...config.SCHEMAS].sort()
			const foundSchemasSorted = [...schemas].sort()

			cm.subProcess('Szükséges sémák:', 'info', expectedSchemas.join(', '))
			cm.subProcess('Talált sémák:', 'success', foundSchemasSorted.join(', '))

			const missingSchemas = expectedSchemas.filter((s) => !foundSchemasSorted.includes(s))
			const unexpectedSchemas = foundSchemasSorted.filter((s) => !expectedSchemas.includes(s))

			if (missingSchemas.length > 0 || unexpectedSchemas.length > 0) {
				isSuccess = false
				if (missingSchemas.length > 0) {
					cm.subProcess('Hiányzó séma:', 'error', missingSchemas.join(', '))
				}
				if (unexpectedSchemas.length > 0) {
					cm.subProcess('Nem várt séma:', 'error', unexpectedSchemas.join(', '))
				}
			} else {
				isSuccess = true // Mark as success
			}
		} else {
			cm.subProcess('Nem található séma a könyvtárban', 'error')
		}
	} catch (error: unknown) {
		if (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			error.code === 'ENOENT'
		) {
			cm.subProcess('A séma könyvtár nem található', 'error')
		} else {
			cm.subProcess('Hiba a séma könyvtár olvasása közben', 'error')
		}
	}

	if (isSuccess) {
		cm.endProcess(processText, 'success')
	} else {
		cm.endProcess(processText, 'error')
		if (stopOnError) {
			process.exit(1)
		}
	}

	return isSuccess ? schemas : []
}

export async function restore(
	sqlFile: string,
	stopOnError = true,
	isSnapshot = false,
): Promise<boolean> {
	let isSuccess = false
	const processText = isSnapshot ? 'Adatbázis visszaállítás' : 'Adatbázis betöltés'
	cm.startProcess(processText)
	cm.subProcess('SQL fájl:', 'info', sqlFile)
	try {
		const backupSQL = fs.readFileSync(sqlFile, 'utf8')
		if (backupSQL) {
			cm.subProcess('SQL fájl tartalmának beolvasása', 'success')
		}
		await db.execute(sql.raw(backupSQL))
		isSuccess = true
	} catch (error) {
		if (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			error.code === 'ENOENT'
		) {
			cm.subProcess('Hiba az SQL fájl olvasása közben', 'error')
		} else {
			cm.subProcess('Hiba az SQL fájl futtatása közben', 'error')
		}

		const errorMessage = error instanceof Error ? error.message : String(error)

		cm.consoleMessage(errorMessage, 'error', 1)
		if (stopOnError) {
			cm.endProcess(processText, 'error')
			process.exit(1)
		}
	}

	if (isSuccess) {
		cm.endProcess(processText, 'success')
	} else {
		cm.endProcess(processText, 'error')
	}
	return isSuccess
}

export async function dropDatabase(stopOnError = true): Promise<boolean> {
	const processText = 'Adatbázis törlése'
	let isSuccess = false
	cm.startProcess(processText)
	try {
		await db.execute(sql.raw(`DROP DATABASE IF EXISTS ${config.DB_NAME};`))
		cm.subProcess('Adatbázis törlése', 'success')
		isSuccess = true
	} catch (error) {
		cm.subProcess('Hiba az adatbázis törlésekor', 'error')
		const errorMessage = error instanceof Error ? error.message : String(error)
		cm.consoleMessage(errorMessage, 'error', 1)
		if (stopOnError) {
			cm.endProcess(processText, 'error')
			process.exit(1)
		}
	}
	return isSuccess
}

export async function createDatabase(stopOnError = true): Promise<boolean> {
	const processText = 'Adatbázis létrehozása'
	let isSuccess = false
	cm.startProcess(processText)
	try {
		await db.execute(sql.raw(`CREATE DATABASE IF NOT EXISTS ${config.DB_NAME};`))
		cm.subProcess('Adatbázis létrehozva:', 'success', config.DB_NAME)
		isSuccess = true
	} catch (error) {
		cm.subProcess('Hiba az adatbázis létrehozásakor', 'error')
		const errorMessage = error instanceof Error ? error.message : String(error)
		cm.consoleMessage(errorMessage, 'error', 1)
		if (stopOnError) {
			cm.endProcess(processText, 'error')
			process.exit(1)
		}
	}
	return isSuccess
}
