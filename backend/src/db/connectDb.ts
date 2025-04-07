import { Pool, PoolClient } from "pg";

class PostgresConnection {
  config: any;
  pool: Pool;

  constructor(config = {}) {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: false, // local doesn't require SSL
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ...config
    };

    this.pool = new Pool(this.config);
  }

  async connect() {
    try {
      this.pool.on('error', (err: any) => {
        console.error('Unexpected database error', err);
        process.exit(-1);
      });

      return this;
    } catch (error) {
      console.error('Database connection initialization failed:', error);
      throw error;
    }
  }

  async query(
    text: string,
    params?: Array<string | number | boolean | null | Date>,
    options?: { timeout?: number }
  ) {
    if (!this.pool) {
      await this.connect();
    }

    const queryOptions = {
      text,
      values: params,
      timeout: options?.timeout || 15000
    };

    try {
      const start = Date.now();
      const res = await this.pool.query(queryOptions);
      const duration = Date.now() - start;

      console.log('Executed query', {
        text,
        params,
        duration,
        rows: res.rowCount
      });

      return res;
    } catch (error: any) {
      console.error('Query execution error:', {
        query: text,
        params,
        error: error.message
      });
      throw error;
    }
  }

  async getClient() {
    if (!this.pool) {
      await this.connect();
    }

    try {
      return await this.pool.connect();
    } catch (error) {
      console.error('Failed to get database client:', error);
      throw error;
    }
  }

  async transaction(callback: (client: PoolClient) => Promise<any>): Promise<any> {
    const client = await this.getClient();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async closeConnection() {
    if (this.pool) {
      try {
        await this.pool.end();
        console.log('Database connection pool closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }

  async ping() {
    try {
      const result = await this.query('SELECT NOW()');
      return result.rows[0];
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }
}

const db = new PostgresConnection();

async function connectDb() {
  try {
    await db.connect();
    console.log("Connected to local Postgres!");
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

connectDb();

export default db;
