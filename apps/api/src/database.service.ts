import { Injectable, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool?: Pool;

  getPool(): Pool {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException('Banco de dados não configurado.');
    }
    this.pool ??= new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
      max: 10,
    });
    return this.pool;
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}
