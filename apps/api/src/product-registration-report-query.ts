export type ProductRegistrationFilters = {
  tenantId: string;
  from: string;
  to: string;
  departmentId?: string;
  status: 'all' | 'active' | 'inactive';
  page: number;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function single(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new Error(`${name} deve ser informado uma vez.`);
  return value.trim();
}

function calendarDate(value: string | undefined, name: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${name} deve estar no formato AAAA-MM-DD.`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`${name} não é uma data válida.`);
  }
  return value;
}

export function parseProductRegistrationFilters(
  input: Record<string, unknown>,
): ProductRegistrationFilters {
  const tenantId = single(input.tenantId, 'tenantId');
  if (!tenantId || !uuid.test(tenantId)) throw new Error('tenantId deve ser um UUID válido.');

  const from = calendarDate(single(input.from, 'from'), 'from');
  const to = calendarDate(single(input.to, 'to'), 'to');
  if (from > to) throw new Error('A data inicial deve ser anterior ou igual à final.');

  const departmentId = single(input.departmentId, 'departmentId') || undefined;
  if (departmentId && !uuid.test(departmentId)) {
    throw new Error('departmentId deve ser um UUID válido.');
  }

  const status = single(input.status, 'status') || 'all';
  if (status !== 'all' && status !== 'active' && status !== 'inactive') {
    throw new Error('status deve ser all, active ou inactive.');
  }

  const pageText = single(input.page, 'page') || '1';
  if (!/^[1-9]\d{0,3}$/.test(pageText)) throw new Error('page deve estar entre 1 e 9999.');

  return { tenantId, from, to, departmentId, status, page: Number(pageText) };
}
