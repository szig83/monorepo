import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import chalk from 'chalk'

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { sql } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/pg-core'

import db from '@/index'
import * as schema from '@/schemas'
import * as seeds from '@/seeds'
import { env } from './env'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import config from '@/../drizzle.config'

type SeedOptions = {
	tableReset: boolean
	storedProcedures: boolean
	publicUserCount: number
}

const seedOptions: SeedOptions = {
	tableReset: true,
	storedProcedures: true,
	publicUserCount: env.SEED_USER_COUNT,
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
	const allTableNames = allTables.map((table) => getTableConfig(table as any).name)

	return allTableNames
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

			console.log(`   ${chalk.green('✔')} ${chalk.cyan(tableConfig.name)} sikeresen kiürítve`)
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
	// Seed adatok betöltése a függőségi sorrend figyelembevételével

	console.log(chalk.blue.bold('[Tábla adatok betöltése - START]'))

	// 1. Alap entitások (nincs külső kulcs függőségük)
	console.log(
		chalk.gray('  ↳ Alapentitások betöltése (Erőforrások, Szolgáltatók, Csoportok, Szerepkörök)...'),
	)
	await seeds.resources(db) // Erőforrások
	await seeds.providers(db) // Hitelesítési szolgáltatók
	await seeds.groups(db) // Csoportok
	await seeds.roles(db) // Szerepkörök

	// 2. Jogosultságok (függenek az erőforrásoktól)
	console.log(chalk.gray('  ↳ Jogosultságok betöltése...'))
	await seeds.permissions(db) // Jogosultságok

	// 3. Kapcsolatok az entitások között
	console.log(chalk.gray('  ↳ Entitás kapcsolatok betöltése...'))
	await seeds.rolePermissions(db) // Szerepkör-jogosultság kapcsolatok
	await seeds.groupPermissions(db) // Csoport-jogosultság kapcsolatok

	// 4. Felhasználók és kapcsolataik
	console.log(chalk.gray('  ↳ Felhasználók és kapcsolataik betöltése...'))
	await seeds.users(db, seedOptions.publicUserCount) // Felhasználók
	await seeds.userRoles(db) // Felhasználó-szerepkör kapcsolatok
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
	console.log(chalk.green.bold('[Tárolt eljárások betöltése - VÉGE | 🟢 Sikeresen betöltve]') + '\n')
}

/**
 * Create specified schemas if they don't exist.
 */
async function createSchemas() {
	const schemasDir = path.resolve(__dirname, 'schemas')
	let schemasToCreate: string[] = []

	try {
		console.log(chalk.blue.bold(`[Sémák keresése: ${chalk.magenta(schemasDir)}]`))
		const dirents = fs.readdirSync(schemasDir, { withFileTypes: true })
		schemasToCreate = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)

		if (schemasToCreate.length > 0) {
			console.log(`   ${chalk.gray('Talált sémák:')} ${chalk.cyan(schemasToCreate.join(', '))}`)
		} else {
			console.log(
				`   ${chalk.gray('Nem található alkönyvtár (séma) a(z) ')} ${chalk.magenta(schemasDir)}`,
			)
		}
	} catch (error: unknown) {
		// Type guard to safely access error.code
		if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
			console.warn(
				`   ${chalk.yellow('⚠️')} A(z) '${chalk.magenta(schemasDir)}' séma könyvtár nem található. Sémák létrehozása kihagyva.`,
			)
		} else {
			console.error(
				`   ${chalk.red('❌')} Hiba a(z) '${chalk.magenta(schemasDir)}' könyvtár olvasása közben:`,
				error,
			)
		}
		// If directory read fails, proceed without creating schemas
		console.log(chalk.yellow.bold('[Sémák létrehozása - VÉGE | 🟡 Kihagyva (hiba/üres)]') + '\n')
		return // Exit the function early
	}

	// If no schemas found, exit early
	if (schemasToCreate.length === 0) {
		console.log(chalk.green.bold('[Sémák létrehozása - VÉGE | ✅ Nincs tennivaló]') + '\n')
		return
	}

	console.log(chalk.blue.bold('[Sémák létrehozása - START]'))
	for (const schemaName of schemasToCreate) {
		try {
			// Use 'CREATE SCHEMA IF NOT EXISTS' to avoid errors if the schema already exists.
			await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`))
			console.log(`   ${chalk.green('✔')} Séma '${chalk.cyan(schemaName)}' létrehozva vagy már létezik.`)
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
	console.log(chalk.inverse('🌱 Adatbázis seedelés indítása... 🌱'))

	// Sémák létrehozása
	await createSchemas()

	// Migrációk futtatása
	console.log(chalk.blue.bold('[Migrációk futtatása - START]'))
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

	console.log(chalk.inverse('✅ Adatbázis seedelés befejezve! ✅'))
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
