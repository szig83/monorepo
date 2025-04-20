import * as path from 'path'
import * as fs from 'fs'
import chalk from 'chalk'
import { sql } from 'drizzle-orm'

import db, { client } from './index'
import { deleteSchemas, findSchemas } from './utils'

async function restore() {
	console.log('\n' + chalk.bold.underline('🚀 ADATBÁZIS VISSZAÁLLÍTÁSA INDÍTÁSA') + '\n')

	// --- Backup fájl keresése ---
	console.log(chalk.blue.bold('[Legújabb backup fájl keresése - START]'))
	const backupDir = path.join(__dirname, 'backups')

	let files: string[] = []
	try {
		files = fs.readdirSync(backupDir)
	} catch (error) {
		console.error(chalk.red(`❌ Hiba a backup könyvtár olvasása közben: ${backupDir}`), error)
		process.exit(1)
	}

	const sqlFiles = files
		.filter((file) => path.extname(file) === '.sql')
		.map((file) => ({
			name: file,
			time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
		}))
		.sort((a, b) => b.time - a.time)

	const latestBackup = sqlFiles[0]

	if (!latestBackup) {
		console.error(chalk.red(`❌ Nem található SQL backup fájl itt: ${backupDir}`))
		process.exit(1)
	}

	const latestBackupFile = latestBackup.name
	const filePath = path.join(backupDir, latestBackupFile)
	console.log(`   ${chalk.green('✔')} Legújabb backup: ${chalk.cyan(latestBackupFile)}`)
	console.log(chalk.green.bold('[Legújabb backup fájl keresése - VÉGE]') + '\n')

	// --- Sémák olvasása ---
	const schemas = findSchemas()

	// --- Sémák törlése ---
	await deleteSchemas(schemas)

	// --- Visszaállítás backupból ---
	console.log(
		chalk.blue.bold(`[Adatbázis visszaállítása (${chalk.cyan(latestBackupFile)}) - START]`),
	)
	try {
		console.log(chalk.dim('   Backup fájl tartalmának olvasása...'))
		const backupSQL = fs.readFileSync(filePath, 'utf8')
		console.log(chalk.dim('   SQL parancsok végrehajtása...'))
		await db.execute(sql.raw(backupSQL))
		console.log(`   ${chalk.green('✔')} Adatbázis sikeresen visszaállítva.`)
	} catch (error) {
		console.error(chalk.red('❌ Hiba az adatbázis visszaállítása közben:'), error)
		process.exit(1)
	}
	console.log(chalk.green.bold('[Adatbázis visszaállítása - VÉGE]') + '\n')

	// --- Kapcsolat bontása ---
	console.log(chalk.blue.bold('[Adatbázis kapcsolat bontása - START]'))
	await client.end()
	console.log(`   ${chalk.green('✔')} Adatbázis kapcsolat bontva.`)
	console.log(chalk.green.bold('[Adatbázis kapcsolat bontása - VÉGE]') + '\n')

	console.log(chalk.bold.underline('\n✨ ADATBÁZIS VISSZAÁLLÍTÁSA BEFEJEZVE!') + '\n')
}

restore().catch((error) => {
	console.error(
		chalk.red.bold('\n🔥 Váratlan hiba történt a visszaállítási folyamat során:'),
		error,
	)
	process.exit(1)
})
