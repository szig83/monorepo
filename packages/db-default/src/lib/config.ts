import { env } from './env'

export const config = {
	...env,
	SCHEMAS: ['public', 'auth'],
	BACKUP_DIR: 'backups',
}

export type Config = typeof config
