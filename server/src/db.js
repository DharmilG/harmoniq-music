import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })
const { Pool } = pg

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})

export async function query(text, params){
  console.log('query:', text, params)
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } finally {
    client.release()
  }
}

export default pool;
