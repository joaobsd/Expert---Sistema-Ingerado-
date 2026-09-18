import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from './database.service.js';
import { parseProductRegistrationFilters } from './product-registration-report-query.js';

const pageSize = 100;

@Controller('v1/reports/product-registrations')
export class ProductRegistrationReportController {
  constructor(private readonly database: DatabaseService) {}

  @Get('options')
  async options() {
    const pool = this.database.getPool();
    const [tenants, departments] = await Promise.all([
      pool.query('SELECT id, legal_name AS name FROM tenants ORDER BY legal_name, id'),
      pool.query('SELECT id, tenant_id, name FROM departments ORDER BY name, id'),
    ]);
    return { tenants: tenants.rows, departments: departments.rows };
  }

  @Get()
  async list(@Query() input: Record<string, unknown>) {
    let filters;
    try {
      filters = parseProductRegistrationFilters(input);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Filtros inválidos.');
    }

    const values: unknown[] = [filters.tenantId, filters.from, filters.to];
    const clauses = [
      'p.tenant_id = $1::uuid',
      "p.registered_at >= ($2::date::timestamp AT TIME ZONE 'America/Fortaleza')",
      "p.registered_at < (($3::date + INTERVAL '1 day') AT TIME ZONE 'America/Fortaleza')",
    ];
    if (filters.departmentId) {
      values.push(filters.departmentId);
      clauses.push(`p.department_id = $${values.length}::uuid`);
    }
    if (filters.status !== 'all') {
      values.push(filters.status);
      clauses.push(`p.status = $${values.length}`);
    }
    const where = clauses.join(' AND ');
    const client = await this.database.getPool().connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const countResult = await client.query<{ total: string }>(
        `SELECT count(*) AS total FROM products p WHERE ${where}`,
        values,
      );
      const total = Number(countResult.rows[0]?.total ?? 0);
      const rows = await client.query(
        `SELECT p.id, p.registered_at, p.sku, p.description, p.gtin, p.unit_code,
                p.ncm, p.cest, p.status,
                d.name AS department, s.name AS section, g.name AS product_group,
                sg.name AS subgroup
           FROM products p
           JOIN departments d ON d.id = p.department_id AND d.tenant_id = p.tenant_id
           LEFT JOIN product_sections s ON s.id = p.section_id AND s.tenant_id = p.tenant_id
           LEFT JOIN product_groups g ON g.id = p.group_id AND g.tenant_id = p.tenant_id
           LEFT JOIN product_subgroups sg ON sg.id = p.subgroup_id AND sg.tenant_id = p.tenant_id
          WHERE ${where}
          ORDER BY p.registered_at DESC, p.id DESC
          LIMIT ${pageSize} OFFSET $${values.length + 1}`,
        [...values, (filters.page - 1) * pageSize],
      );
      await client.query('COMMIT');
      return {
        filters,
        timeZone: 'America/Fortaleza',
        total,
        pageSize,
        rows: rows.rows,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
