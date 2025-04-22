import chalk from 'chalk'
import { sql } from 'drizzle-orm'
import db from './index'
import * as path from 'path'
import * as fs from 'fs'
/**
 * Törli a megadott sémákat az adatbázisból.
 * @param schemasToDelete A törlendő sémák neveinek tömbje.
 */
export async function deleteSchemas(schemasToDelete: string[]): Promise<void> {
	schemasToDelete.push('drizzle')
	if (!schemasToDelete.includes('public')) {
		schemasToDelete.push('public')
	}

	console.log(chalk.blue.bold('\n[Meglévő sémák törlése - START]'))
	for (const schemaName of schemasToDelete) {
		try {
			await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE;`))
			console.log(`   ${chalk.green('✔')} ${chalk.cyan(schemaName)} sikeresen törölve`)
		} catch (error) {
			console.error(
				`   ${chalk.red('❌ Hiba a(z)')} ${chalk.cyan(schemaName)} ${chalk.red('séma törlése közben:')}`,
				error,
			)
			// Opcionális: Dönthetünk úgy, hogy hiba esetén megállunk, vagy folytatjuk a többi sémával.
			process.exit(1)
		}
	}
	console.log(chalk.green.bold('[Meglévő sémák törlése - VÉGE] | 🟢 Sikeresen törölve') + '\n')
}

export function findSchemas(): string[] {
	const schemasDir = path.resolve(__dirname, 'schemas')
	let schemas: string[] = []

	try {
		console.log(chalk.blue.bold(`[Sémák keresése: ${chalk.magenta(schemasDir)}]`))
		const dirents = fs.readdirSync(schemasDir, { withFileTypes: true })
		schemas = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)

		if (schemas.length > 0) {
			console.log(`   ${chalk.gray('Talált sémák:')} ${chalk.cyan(schemas.join(', '))}`)
		} else {
			console.log(
				`   ${chalk.gray('Nem található alkönyvtár (séma) a(z) ')} ${chalk.magenta(schemasDir)}`,
			)
		}
	} catch (error: unknown) {
		// Type guard to safely access error.code
		if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
			console.warn(
				`   ${chalk.yellow('⚠️')} A(z) '${chalk.magenta(schemasDir)}' séma könyvtár nem található.`,
			)
		} else {
			console.error(
				`   ${chalk.red('❌')} Hiba a(z) '${chalk.magenta(schemasDir)}' könyvtár olvasása közben:`,
				error,
			)
		}
	}

	return schemas
}
