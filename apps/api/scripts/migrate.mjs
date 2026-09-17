import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('Defina DATABASE_URL para um banco PostgreSQL dedicado ao projeto.');
}

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');
const files = (await fs.readdir(directory)).filter((file) => file.endsWith('.sql')).sort();

await client.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  for (const filename of files) {
    const alreadyApplied = await client.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [filename],
    );
    if (alreadyApplied.rowCount) continue;
    const sql = await fs.readFile(path.join(directory, filename), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(filename) VALUES($1)', [filename]);
      await client.query('COMMIT');
      console.log(`Aplicada: ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
} finally {
  await client.end();
}
