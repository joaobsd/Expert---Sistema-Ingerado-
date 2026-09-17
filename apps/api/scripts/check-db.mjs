import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('Defina DATABASE_URL em apps/api/.env antes de verificar a conexão.');
}

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
});

await client.connect();
try {
  const result = await client.query(`
    SELECT current_database() AS database, current_user AS role,
           current_setting('server_version') AS version
  `);
  const { database, role, version } = result.rows[0];
  if (process.env.DATABASE_EXPECTED_NAME && database !== process.env.DATABASE_EXPECTED_NAME) {
    throw new Error(
      `Banco diferente do esperado: ${database} (esperado: ${process.env.DATABASE_EXPECTED_NAME}).`,
    );
  }
  console.log(JSON.stringify({ status: 'ok', database, role, version }, null, 2));
} finally {
  await client.end();
}
