import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgres://ezclip:ezclip@localhost:5432/ezclip',
    },
    verbose: true,
    strict: true,
});
