import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })
const { Pool } = pg

const isProduction = process.env.NODE_ENV === 'production'

const connectionConfig = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {} // For local dev, pg will automatically use PGHOST, PGUSER, etc. from .env

export const pool = new Pool(connectionConfig)

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
