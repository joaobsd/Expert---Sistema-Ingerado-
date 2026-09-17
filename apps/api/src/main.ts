import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Pool } from 'pg';

const pilot = Object.freeze({
  storeName: 'CompreMai$ Estivas',
  segment: 'Varejo supermercadista',
  state: 'RN',
  country: 'BR',
  phase: 'fundacao',
});

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'expert-api', phase: pilot.phase };
  }

  @Get('health/db')
  async database() {
    if (!process.env.DATABASE_URL) return { status: 'not_configured' };
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
    });
    try {
      await pool.query('SELECT 1');
      return { status: 'ok' };
    } catch {
      return { status: 'unavailable' };
    } finally {
      await pool.end();
    }
  }
}

@Controller('v1')
class PilotController {
  @Get('pilot')
  getPilot() {
    return pilot;
  }
}

@Module({ controllers: [HealthController, PilotController] })
class AppModule {}

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Implantação bloqueada: autenticação e autorização ainda não foram implementadas.',
    );
  }

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  });
  const port = Number(process.env.PORT ?? 3333);
  await app.listen(port, '127.0.0.1');
  console.log(`EXPERT API local: http://127.0.0.1:${port}`);
}

void bootstrap();
