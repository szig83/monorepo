import { config } from '@/lib/config';
import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = `postgresql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;

export default defineConfig({
	out: './src/drizzle',
	schema: `./src/${config.SCHEMA_DIR}/index.ts`,
	dialect: 'postgresql',
	schemaFilter: config.SCHEMAS,
	dbCredentials: {
		url: DATABASE_URL,
	},
});
