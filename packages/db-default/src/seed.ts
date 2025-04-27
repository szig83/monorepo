import * as path from 'path'
import * as fs from 'fs'
import chalk from 'chalk'
import { sql } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/pg-core'

import db from './index'
import * as schema from './schemas'
import * as seeds from './seeds'
import { env } from './env'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import config from '@/../drizzle.config'
import { deleteSchemas, findSchemas } from './utils'

type SeedOptions = {
	tableReset: boolean
	storedProcedures: boolean
	publicUserCount: number
}

const seedOptions: SeedOptions = {
	tableReset: true,
	storedProcedures: true,
	publicUserCount: env.SEED_PUBLIC_USER_COUNT,
}

function getSchemaTableNames(): string[] {
	// Összegyűjti az összes tábla objektumot a sémából
	const allTables = Object.values(schema).filter((obj) => {
		const isObject = typeof obj === 'object' && obj !== null
		if (!isObject) return false

		// Szűrés a Drizzle táblákra az IsDrizzleTable szimbólum alapján
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (obj as any)[Symbol.for('drizzle:IsDrizzleTable')] === true
	})

	// Lekérdezi a táblák neveit (opcionális)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return allTables.map((table) => getTableConfig(table as any).name)
}

/**
 * Kiüríti az összes táblát fordított függőségi sorrendben.
 */
async function resetTables() {
	// Az összes tábla kiürítése fordított függőségi sorrendben
	const tablesToReset = [
		// Kapcsolótáblák (junction tables) - először ezeket kell törölni
		schema.userRoles,
		schema.rolePermissions,
		schema.groupPermissions,
		schema.userGroups,

		// Autentikációs táblák
		schema.verifications,
		schema.sessions,
		schema.accounts,

		// Audit táblák
		schema.auditLogs,

		// Entitás táblák
		schema.users,
		schema.permissions,
		schema.roles,
		schema.groups,
		schema.resources,
		schema.providers,
	]

	const schemaTables = getSchemaTableNames()

	console.log(chalk.blue.bold('[Táblák kiürítése - START]'))
	for (const table of tablesToReset) {
		const tableConfig = getTableConfig(table)
		try {
			await db.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`)

			// Eltávolítjuk a kiürített táblát a schemaTables listából
			const index = schemaTables.indexOf(tableConfig.name)
			if (index > -1) {
				schemaTables.splice(index, 1)
			}

			console.log(
				`   ${chalk.green('✔')} ${chalk.cyan(tableConfig.name)} sikeresen kiürítve`,
			)
		} catch (error: unknown) {
			// Check if the error is a PostgreSQL 'table does not exist' error (code 42P01)
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				error.code === '42P01'
			) {
				console.warn(
					`   ${chalk.yellow('⚠️')} A(z) '${chalk.cyan(tableConfig.name)}' tábla nem létezik, a kiürítés kihagyva.`,
				)
			} else {
				// Log other errors
				console.error(
					`   ${chalk.red('❌')} Hiba a(z) '${chalk.cyan(tableConfig.name)}' tábla kiürítése közben:`,
					error,
				)
				// Optionally re-throw or handle differently if seeding should stop on other errors
			}
		}
	}

	if (schemaTables.length > 0) {
		console.log(
			chalk.red.bold('🔴 A következő táblák hiányoznak a kiürítési folyamatból:'),
			chalk.red(schemaTables.join(', ')),
		)
		console.log(chalk.yellow.bold('[Táblák kiürítése - VÉGE | 🟡 Részlegesen kiürítve]') + '\n')
	} else {
		console.log(chalk.green.bold('[Táblák kiürítése - VÉGE | 🟢 Sikeresen kiürítve]') + '\n')
	}
}

/**
 * Kiindulási tábla adatok betöltése.
 */
async function seedTableData() {
	console.log(chalk.blue.bold('[Tábla adatok betöltése - START]'))

	console.group(chalk.cyan('1. Alapentitások'))
	console.log(chalk.gray('Erőforrások, Szolgáltatók, Csoportok, Szerepkörök betöltése...'))
	await seeds.resources(db) // Erőforrások
	await seeds.providers(db) // Hitelesítési szolgáltatók
	await seeds.groups(db) // Csoportok
	await seeds.roles(db) // Szerepkörök
	console.log(chalk.green('✔ Kész'))
	console.groupEnd()

	console.group(chalk.cyan('2. Jogosultságok'))
	console.log(chalk.gray('Jogosultságok betöltése...'))
	await seeds.permissions(db) // Jogosultságok
	console.log(chalk.green('✔ Kész'))
	console.groupEnd()

	console.group(chalk.cyan('3. Kapcsolatok'))
	console.log(chalk.gray('Szerepkör-jogosultság és Csoport-jogosultság kapcsolatok betöltése...'))
	await seeds.rolePermissions(db) // Szerepkör-jogosultság kapcsolatok
	await seeds.groupPermissions(db) // Csoport-jogosultság kapcsolatok
	console.log(chalk.green('✔ Kész'))
	console.groupEnd()

	console.group(chalk.cyan('4. Felhasználók és kapcsolataik'))
	console.log(chalk.gray('Felhasználók és Felhasználó-szerepkör kapcsolatok betöltése...'))
	await seeds.users(db, seedOptions.publicUserCount) // Felhasználók
	await seeds.userRoles(db) // Felhasználó-szerepkör kapcsolatok
	console.log(chalk.green('✔ Kész'))
	console.groupEnd()

	console.log(chalk.green.bold('[Tábla adatok betöltése - VÉGE | 🟢 Sikeresen betöltve]') + '\n')
}

/**
 * Betölti a tárolt eljárásokat.
 */
async function seedStoredProcedures() {
	console.log(chalk.blue.bold('[Tárolt eljárások betöltése - START]'))
	const proceduresDir = path.join(__dirname, 'procedures')
	// Recursive function to find all SQL files in a directory and its subdirectories
	function findSqlFiles(dir: string): string[] {
		let sqlFiles: string[] = []
		const items = fs.readdirSync(dir)

		for (const item of items) {
			const itemPath = path.join(dir, item)
			const stats = fs.statSync(itemPath)

			if (stats.isDirectory()) {
				// If directory, recursively search inside it
				sqlFiles = sqlFiles.concat(findSqlFiles(itemPath))
			} else if (stats.isFile() && item.endsWith('.sql')) {
				// If SQL file, add to the list
				sqlFiles.push(itemPath)
			}
		}

		return sqlFiles
	}

	const sqlFilePaths = findSqlFiles(proceduresDir)

	for (const filePath of sqlFilePaths) {
		const procedureSQL = fs.readFileSync(filePath, 'utf8')
		await db.execute(sql.raw(procedureSQL))

		// Check if there is a corresponding .d.ts file
		const basePath = filePath.slice(0, -4) // Remove '.sql' extension
		const dtsPath = `${basePath}.d.ts`
		const hasDtsFile = fs.existsSync(dtsPath)

		console.log(
			`   ${chalk.green('✔')} ${chalk.cyan(path.relative(proceduresDir, filePath))} ${hasDtsFile ? chalk.green(' (d.ts OK)') : chalk.red.bold(' (d.ts HIÁNYZIK: ' + path.relative(proceduresDir, dtsPath) + ')')}`,
		)
	}
	console.log(
		chalk.green.bold('[Tárolt eljárások betöltése - VÉGE | 🟢 Sikeresen betöltve]') + '\n',
	)
}

/**
 * Create specified schemas if they don't exist.
 */
async function createSchemas() {
	const schemas = findSchemas()

	// --- Sémák törlése ---
	await deleteSchemas(schemas)

	console.log(chalk.blue.bold('[Sémák létrehozása - START]'))
	for (const schemaName of schemas) {
		try {
			// Use 'CREATE SCHEMA IF NOT EXISTS' to avoid errors if the schema already exists.
			await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`))
			console.log(
				`   ${chalk.green('✔')} Séma '${chalk.cyan(schemaName)}' létrehozva vagy már létezik.`,
			)
		} catch (error) {
			console.error(
				`   ${chalk.red('❌')} Hiba a(z) '${chalk.cyan(schemaName)}' séma létrehozása közben:`,
				error,
			)
			// Decide if we should stop execution or continue
			// For now, let's log the error and continue
		}
	}
	console.log(chalk.green.bold('[Sémák létrehozása - VÉGE | 🟢 Sikeresen létrehozva]') + '\n')
}

/**
 * Seed adatok betöltése.
 */
async function main() {
	console.log('\n' + chalk.bold.underline('🚀 ADATBÁZIS SEEDELÉS INDÍTÁSA') + '\n')

	// Sémák létrehozása
	await createSchemas()

	// Migrációk futtatása
	console.log(chalk.blue.bold('[Migrációk futtatása - START]'))
	console.log(chalk.gray(`Migrációs könyvtár: ${config.out}`))
	await migrate(db, { migrationsFolder: config.out! })
	console.log(chalk.green.bold('[Migrációk futtatása - VÉGE | 🟢 Sikeresen futtatva]') + '\n')

	// Táblák kiürítése
	if (seedOptions.tableReset) {
		await resetTables()
	} else {
		console.log(chalk.yellow.bold('[Táblák kiürítése - KIHAGYVA]') + '\n')
	}

	// Tárolt eljárások betöltése
	if (seedOptions.storedProcedures) {
		await seedStoredProcedures()
	} else {
		console.log(chalk.yellow.bold('[Tárolt eljárások betöltése - KIHAGYVA]') + '\n')
	}

	// Kiindulási tábla adatok betöltése
	await seedTableData()

	console.log(chalk.bold.underline('✨ ADATBÁZIS SEEDELÉS BEFEJEZVE!') + '\n')
}

main()
	.catch((e) => {
		console.error(chalk.red.bold('💥 Hiba a seedelés során:'), e)
		process.exit(1)
	})
	.finally(async () => {
		// A végső üzenet már a main()-ben van, itt nincs szükség további logolásra.
		// console.log('👌 Minden seed adat sikeresen betöltve!') // Ezt eltávolítjuk vagy kikommenteljük
		process.exit(0)
	})
