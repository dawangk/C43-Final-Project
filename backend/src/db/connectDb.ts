import { Pool, PoolClient } from "pg";
import { GoogleAuth } from "google-auth-library"; 

class PostgresConnection {
  config: any;
  pool: Pool;

  constructor(config = {}) {
    this.config = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // maximum number of clients in the pool
      idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
      connectionTimeoutMillis: 15000, // maximum time to wait for a connection
      ...config
    };
    
    this.pool = new Pool(this.config);
  }

  async connect() {
    try {
      // For GCP Cloud SQL, use specific connection method
      if (process.env.NODE_ENV === 'production' && process.env.CLOUD_SQL_INSTANCE_CONNECTION_NAME) {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();

        this.config = {
          ...this.config,
          host: `/cloudsql/${process.env.CLOUD_SQL_INSTANCE_CONNECTION_NAME}`,
          socketPath: `/cloudsql/${process.env.CLOUD_SQL_INSTANCE_CONNECTION_NAME}`
        };
      }

      // Error handling for pool
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

  async query(  text: string, params?: Array<string | number | boolean | null | Date>, options?: {timeout?: number}) {
    if (!this.pool) {
      await this.connect();
    }

    const queryOptions = {
      text,
      values: params,
      timeout: options?.timeout || 15000 // 15 seconds default query timeout
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

  // Utility method for health check
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
    console.log("Connected to Postgres!");
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

connectDb();

export default db;