import assert from 'node:assert/strict';
import test from 'node:test';
import { parseProductRegistrationFilters } from '../dist/product-registration-report-query.js';

const tenantId = 'f5e73c3f-05a1-4b84-a3e7-b3f9b6c82d49';

test('aceita período, empresa e filtros válidos', () => {
  assert.deepEqual(
    parseProductRegistrationFilters({
      tenantId,
      from: '2024-02-29',
      to: '2024-03-01',
      status: 'inactive',
      page: '2',
    }),
    {
      tenantId,
      from: '2024-02-29',
      to: '2024-03-01',
      departmentId: undefined,
      status: 'inactive',
      page: 2,
    },
  );
});

test('recusa data inexistente e período invertido', () => {
  assert.throws(() =>
    parseProductRegistrationFilters({ tenantId, from: '2025-02-29', to: '2025-03-01' }),
  );
  assert.throws(() =>
    parseProductRegistrationFilters({ tenantId, from: '2025-03-02', to: '2025-03-01' }),
  );
});

test('recusa empresa inválida, filtros repetidos e paginação incorreta', () => {
  assert.throws(() =>
    parseProductRegistrationFilters({ tenantId: 'x', from: '2025-01-01', to: '2025-01-31' }),
  );
  assert.throws(() =>
    parseProductRegistrationFilters({ tenantId, from: ['2025-01-01'], to: '2025-01-31' }),
  );
  assert.throws(() =>
    parseProductRegistrationFilters({ tenantId, from: '2025-01-01', to: '2025-01-31', page: '0' }),
  );
});
