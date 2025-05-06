/**
 * Típusdefiníciók a get_groups SQL procedúrához
 * Ez a procedúra csoportokat kérdez le azonosító alapján vagy az összeset
 */

// A procedúra által visszaadott csoport típusa
export interface Group {
	id: number;
	name: Record<string, string>; // JSONB a többnyelvű névnek
	description: Record<string, string>; // JSONB a többnyelvű leírásnak
	created_at: Date;
	updated_at: Date;
}

/**
 * Lekérdezi a csoportot azonosító alapján, vagy az összes csoportot ha nincs megadva azonosító
 * @param id - Opcionális csoport azonosító
 * @returns - A csoportadatok listája
 */
export declare function getGroups(id?: number): Promise<Group[]>;
