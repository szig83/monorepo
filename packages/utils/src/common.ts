/**
 * @packageDocumentation
 * Szerver és kliens oldalon is használható segéd függvények, típusok
 */

import { z } from 'zod'
import crypto from 'crypto'
/**
 * A bemeneti string első karakterét nagybetűsre alakítja.
 * @param input Átalakítandó string
 * @returns Átalakított string
 */
export function capitalizeFirstLetter(input: string): string {
	if (input.length === 0) return input
	return input.charAt(0).toUpperCase() + input.slice(1)
}

/**
 * Nyelvi lokalizációhoz szükséges típus
 */
export type LocalizedText = {
	hu: string
	en: string
	[key: string]: string // További nyelvek
}

/**
 * Nyelvi lokalizációhoz szükséges validációs zod schema
 */
export const localizedTextSchema = z
	.object({
		hu: z.string().min(1),
		en: z.string().min(1),
	})
	.catchall(z.string()) // Bármilyen további nyelv is megengedett

/**
 * Hash a password using scrypt algorithm to match Better Auth's hashing implementation
 * @param {string} password - The plaintext password to hash
 * @returns {string} - The hashed password
 */
export function hashPassword(password: string): string {
	// Using crypto's scrypt implementation, which is the same algorithm used by Better Auth
	// We use a random salt for each password
	const salt = crypto.randomBytes(16).toString('hex')
	// Generate a 64-byte key (512 bits) using scrypt with salt
	const derivedKey = crypto.scryptSync(password, salt, 64)
	// Return the salt and derived key as a combined string
	return `${salt}:${derivedKey.toString('hex')}`
}
