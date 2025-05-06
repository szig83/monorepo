import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { sql } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { client } from './index';

import config from '@/../drizzle.config';
import * as cm from '@/lib/consoleMessage';
import { env } from '@/lib/env';
import {
	createSnapshot,
	deleteSchemas,
	getSchemasFromDB,
	getSchemasFromOrm,
	restore,
} from '@/lib/utils';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import db from './index';
import * as schema from './schemas';
import * as seeds from './seeds';

type SeedOptions = {
	tableReset: boolean;
	storedProcedures: boolean;
	publicUserCount: number;
};

const seedOptions: SeedOptions = {
	tableReset: true,
	storedProcedures: true,
	publicUserCount: env.SEED_PUBLIC_USER_COUNT,
};

function getSchemaTableNames(): string[] {
	// Összegyűjti az összes tábla objektumot a sémából
	const allTables = Object.values(schema).filter((obj) => {
		const isObject = typeof obj === 'object' && obj !== null;
		if (!isObject) return false;

		// Szűrés a Drizzle táblákra az IsDrizzleTable szimbólum alapján
		// biome-ignore lint/suspicious/noExplicitAny: Need to access internal Drizzle property
		return (obj as any)[Symbol.for('drizzle:IsDrizzleTable')] === true;
	});

	// Lekérdezi a táblák neveit (opcionális)
	// biome-ignore lint/suspicious/noExplicitAny: Need to access internal Drizzle property
	return allTables.map((table) => getTableConfig(table as any).name);
}

/**
 * Kiüríti az összes táblát fordított függőségi sorrendben.
 */
async function resetTables(stopOnError: boolean): Promise<boolean> {
	let isSuccess = false;
	cm.startProcess('Táblák kiürítése');
	if (!seedOptions.tableReset) {
		cm.subProcess('Táblák kiürítése - KIHAGYVA', 'info');
		cm.endProcess('Táblák kiürítése', 'success');
		return true;
	}

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
	];

	const schemaTables = getSchemaTableNames();

	for (const table of tablesToReset) {
		const tableConfig = getTableConfig(table);
		try {
			await db.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);

			// Eltávolítjuk a kiürített táblát a schemaTables listából
			const index = schemaTables.indexOf(tableConfig.name);
			if (index > -1) {
				schemaTables.splice(index, 1);
			}

			cm.subProcess('Sikeresen kiürítve:', 'success', tableConfig.name);
		} catch (error: unknown) {
			// Check if the error is a PostgreSQL 'table does not exist' error (code 42P01)
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				error.code === '42P01'
			) {
				cm.subProcess('Tábla nem létezik:', 'warning', tableConfig.name);
			} else {
				// Log other errors
				cm.subProcess('Hiba a tábla kiürítése közben', 'error', tableConfig.name);
				const errorMessage = error instanceof Error ? error.message : String(error);
				cm.consoleMessage(errorMessage, 'error', 1);
				if (stopOnError) {
					cm.endProcess('Táblák kiürítése', 'error');
					process.exit(1);
				}
			}
		}
	}

	if (schemaTables.length > 0) {
		cm.subProcess('Hiányzó táblák:', 'warning', schemaTables.join(', '));
	} else {
		isSuccess = true;
	}

	cm.endProcess('Táblák kiürítése', isSuccess ? 'success' : 'error');

	return isSuccess;
}

/**
 * Kiindulási tábla adatok betöltése.
 */
async function seedTableData(stopOnError: boolean): Promise<boolean> {
	async function seedData(step: string, text: string): Promise<boolean> {
		let isSuccess = false;
		cm.startProcess(text);
		try {
			switch (step) {
				case 'baseEntities': {
					await seeds.resources(db);
					await seeds.providers(db);
					await seeds.groups(db);
					await seeds.roles(db);
					cm.subProcess(
						'Erőforrások, Szolgáltatók, Csoportok, Szerepkörök betöltése...',
						'success',
					);
					break;
				}
				case 'permissions': {
					await seeds.permissions(db);
					cm.subProcess('Jogosultságok betöltése...', 'success');
					break;
				}
				case 'connections': {
					await seeds.rolePermissions(db); // Szerepkör-jogosultság kapcsolatok
					await seeds.groupPermissions(db); // Csoport-jogosultság kapcsolatok
					cm.subProcess(
						'Szerepkör-jogosultság és Csoport-jogosultság kapcsolatok betöltése...',
						'success',
					);
					break;
				}
				case 'users': {
					await seeds.users(db, seedOptions.publicUserCount); // Felhasználók
					await seeds.userRoles(db); // Felhasználó-szerepkör kapcsolatok
					cm.subProcess(
						'Felhasználók és Felhasználó-szerepkör kapcsolatok betöltése...',
						'success',
					);
					break;
				}
			}
			isSuccess = true;
		} catch (error) {
			isSuccess = false;
			cm.subProcess('Hiba a betöltés során', 'error', text);
			const errorMessage = error instanceof Error ? error.message : String(error);
			cm.consoleMessage(errorMessage, 'error', 1);
			if (stopOnError) {
				cm.endProcess(text, 'error');
				process.exit(1);
			}
		}
		cm.endProcess(text, isSuccess ? 'success' : 'error');
		return isSuccess;
	}

	let isSuccess = false;
	cm.startProcess('Tábla adatok betöltése');

	isSuccess = await seedData('baseEntities', 'Alapentitások');
	isSuccess = isSuccess && (await seedData('permissions', 'Jogosultságok'));
	isSuccess = isSuccess && (await seedData('connections', 'Kapcsolatok'));
	isSuccess = isSuccess && (await seedData('users', 'Felhasználók'));

	cm.endProcess('Tábla adatok betöltése', isSuccess ? 'success' : 'error');
	return isSuccess;
}

/**
 * Betölti a tárolt eljárásokat.
 */
async function seedStoredProcedures(stopOnError: boolean): Promise<boolean> {
	let isSuccess = false;
	cm.startProcess('Tárolt eljárások betöltése');

	if (!seedOptions.storedProcedures) {
		cm.subProcess('Tárolt eljárások betöltése - KIHAGYVA', 'info');
		cm.endProcess('Tárolt eljárások betöltése', 'success');
		return true;
	}

	const proceduresDir = path.join(__dirname, 'procedures');
	// Recursive function to find all SQL files in a directory and its subdirectories
	function findSqlFiles(dir: string): string[] {
		let sqlFiles: string[] = [];
		const items = fs.readdirSync(dir);

		for (const item of items) {
			const itemPath = path.join(dir, item);
			const stats = fs.statSync(itemPath);

			if (stats.isDirectory()) {
				// If directory, recursively search inside it
				sqlFiles = sqlFiles.concat(findSqlFiles(itemPath));
			} else if (stats.isFile() && item.endsWith('.sql')) {
				// If SQL file, add to the list
				sqlFiles.push(itemPath);
			}
		}

		return sqlFiles;
	}

	const sqlFilePaths = findSqlFiles(proceduresDir);

	for (const filePath of sqlFilePaths) {
		try {
			const procedureSQL = fs.readFileSync(filePath, 'utf8');
			await db.execute(sql.raw(procedureSQL));

			// Check if there is a corresponding .d.ts file
			const basePath = filePath.slice(0, -4); // Remove '.sql' extension
			const dtsPath = `${basePath}.d.ts`;
			const hasDtsFile = fs.existsSync(dtsPath);

			cm.subProcess('Tárolt eljárás betöltése:', 'success', path.relative(proceduresDir, filePath));
			if (hasDtsFile) {
				cm.subProcess('Típus fájl megtalálva', 'success', '', 2);
			} else {
				cm.subProcess('Hiányzó típus fájl', 'error', path.relative(proceduresDir, dtsPath), 2);
			}
			isSuccess = true;
		} catch (error) {
			isSuccess = false;
			cm.subProcess('Hiba a betöltés során', 'error', path.relative(proceduresDir, filePath));
			const errorMessage = error instanceof Error ? error.message : String(error);
			cm.consoleMessage(errorMessage, 'error', 1);
			if (stopOnError) {
				cm.endProcess('Tárolt eljárások betöltése', 'error');
				process.exit(1);
			}
		}
	}
	cm.endProcess('Tárolt eljárások betöltése', isSuccess ? 'success' : 'error');

	return isSuccess;
}

/**
 * Create specified schemas if they don't exist.
 */
async function createSchemas(schemas: string[], stopOnError: boolean) {
	let isSuccess = false;
	cm.startProcess('Sémák létrehozása');

	for (const schemaName of schemas) {
		try {
			await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`));
			cm.subProcess('Séma létrehozva:', 'success', schemaName);
			isSuccess = true;
		} catch (error) {
			isSuccess = false;
			cm.subProcess(`Hiba a(z) '${schemaName}' séma létrehozása közben`, 'error');
			const errorMessage = error instanceof Error ? error.message : String(error);
			cm.consoleMessage(errorMessage, 'error', 1);
			if (stopOnError) {
				cm.endProcess('Sémák létrehozása', 'error');
				process.exit(1);
			}
		}
	}
	cm.endProcess('Sémák létrehozása', isSuccess ? 'success' : 'error');

	return isSuccess;
}

async function migrateSchemas(stopOnError: boolean) {
	let isSuccess = false;
	cm.startProcess('Migrációk futtatása');

	try {
		await migrate(db, { migrationsFolder: config.out ?? '' });
		cm.endProcess('Migrációk futtatása', 'success');
		isSuccess = true;
	} catch (error) {
		cm.endProcess('Migrációk futtatása', 'error');
		const errorMessage = error instanceof Error ? error.message : String(error);
		cm.consoleMessage(errorMessage, 'error', 1);
		if (stopOnError) {
			process.exit(1);
		}
	}

	return isSuccess;
}

/**
 * Seed adatok betöltése.
 */
async function start() {
	let isSuccess = false;
	const stopOnError = false; // Leállítsa-e a teljes folyamat futását hiba esetén (process.exit(1))

	cm.startScript('Adatbázis seedelés indítása');
	cm.subProcess('Adatbázis kapcsolat létrehozva', 'success', '', 0, true);

	const schemas = getSchemasFromOrm(stopOnError);

	if (schemas.length > 0) {
		// Biztonsági mentés készítése a meglévő adatbázisról
		const databaseSnapshot = await createSnapshot(stopOnError);
		if (databaseSnapshot) {
			// Sémák törlése az adatbázisból
			const deleteSchemaResult = await deleteSchemas(schemas);
			let needToRestoreSnapshot = false;
			if (deleteSchemaResult.isSuccess) {
				// Maradék séma lekérése az adatbázisból
				const dbSchemas = (await getSchemasFromDB(stopOnError, 'Maradék séma lekérése')).schemas;
				if (dbSchemas.length > 0) {
					if (
						(await deleteSchemas(dbSchemas, stopOnError, 'Maradék séma törlése')).deletedSchemas
							.length > 0
					) {
						needToRestoreSnapshot = true;
					}
				}
				// Sémák létrehozása
				const createSchemasResult = await createSchemas(schemas, stopOnError);
				if (createSchemasResult) {
					const migrateResult = await migrateSchemas(stopOnError);
					if (migrateResult) {
						// Táblák kiürítése
						const resetTablesResult = await resetTables(stopOnError);
						if (resetTablesResult) {
							// Tárolt eljárások betöltése

							const seedStoredProceduresResult = await seedStoredProcedures(stopOnError);
							if (seedStoredProceduresResult) {
								const seedTableDataResult = await seedTableData(stopOnError);
								if (seedTableDataResult) {
									needToRestoreSnapshot = false;
									isSuccess = true;
								}
							}
						}
					}
				}
			}

			// Ha a betöltés sikertelen volt (vagy részlegesen törlődtek sémák), akkor visszaállítjuk a snapshotot
			if (needToRestoreSnapshot) {
				await restore(databaseSnapshot, stopOnError, true);
			}
		}
	}

	await client.end();
	cm.subProcess('Adatbázis kapcsolat bontva', 'success', '', 0, true);
	if (isSuccess) {
		console.log(`${chalk.underline('\n✨ ADATBÁZIS SEEDELÉS SIKERESEN BEFEJEZVE!')}\n`);
		process.exit(0);
	} else {
		console.error(`${chalk.underline('\n🔥 ADATBÁZIS SEEDELÉS SIKERTELEN')}\n`);
		process.exit(1);
	}
}

start().catch((e) => {
	console.error(chalk.red.bold('\n🔥 Hiba a seedelés során:'), e);
	process.exit(1);
});
