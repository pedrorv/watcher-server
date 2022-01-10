import { Pool, PoolClient } from 'pg';

const PgPool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DATABASE,
});

type IPgClient = Pool | PoolClient;

class PgClient {
  private client: IPgClient;

  constructor(client?: IPgClient) {
    this.client = client ?? PgPool;
  }

  async query(sqlQuery: string, parameters?: unknown[]): Promise<unknown[]> {
    return (await this.client.query(sqlQuery, parameters)).rows;
  }

  async close(): Promise<void> {
    return this.client instanceof Pool ? this.client.end() : this.client.release();
  }

  private async getClient(): Promise<PgClient> {
    return new PgClient(await PgPool.connect());
  }

  async transaction(queries: { query: string; args?: unknown[] }[]): Promise<void> {
    const transactionClient = await this.getClient();
    await transactionClient.query('BEGIN');
    let error;

    try {
      await Promise.all(queries.map((q) => transactionClient.query(q.query, q.args)));
      await transactionClient.query('COMMIT');
    } catch (e) {
      await transactionClient.query('ROLLBACK');
      error = e;
    } finally {
      await transactionClient.close();
    }
    if (error) throw error;
  }
}

export const client = new PgClient();

export { PgClient as IPgClient, client as PgClient };
