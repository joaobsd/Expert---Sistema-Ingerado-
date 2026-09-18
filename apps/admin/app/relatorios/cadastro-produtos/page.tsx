import Link from 'next/link';
import { Shell } from '../../../components/shell';

type Tenant = { id: string; name: string };
type Department = { id: string; tenant_id: string; name: string };
type Options = { tenants: Tenant[]; departments: Department[] };
type ProductRow = {
  id: string;
  registered_at: string;
  sku: string;
  description: string;
  gtin: string | null;
  unit_code: string;
  ncm: string | null;
  status: 'active' | 'inactive';
  department: string;
  section: string | null;
  product_group: string | null;
  subgroup: string | null;
};
type Report = { total: number; pageSize: number; rows: ProductRow[] };
type Search = Record<string, string | string[] | undefined>;

const api = process.env.EXPERT_API_ORIGIN ?? 'http://127.0.0.1:3333';

function first(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

function dateInPilot(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (name: string) => parts.find((item) => item.type === name)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${api}${path}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    if (response.status === 400) {
      const problem = (await response.json()) as { message?: string };
      throw new Error(problem.message ?? 'Confira os filtros informados.');
    }
    throw new Error('A API ou o banco de dados não respondeu.');
  }
  return (await response.json()) as T;
}

function reportLink(values: Record<string, string>): string {
  return `/relatorios/cadastro-produtos?${new URLSearchParams(values).toString()}`;
}

export default async function ProductRegistrationReportPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const today = dateInPilot(new Date());
  const from = first(params.from) || `${today.slice(0, 7)}-01`;
  const to = first(params.to) || today;
  const status = first(params.status) || 'all';
  const requestedTenantId = first(params.tenantId);
  const requestedDepartmentId = first(params.departmentId);
  const page = first(params.page) || '1';
  let options: Options = { tenants: [], departments: [] };
  let report: Report | null = null;
  let error = '';

  try {
    options = await getJson<Options>('/v1/reports/product-registrations/options');
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Falha ao carregar as empresas.';
  }

  const tenantId = options.tenants.some((tenant) => tenant.id === requestedTenantId)
    ? requestedTenantId
    : (options.tenants[0]?.id ?? '');
  const departments = options.departments.filter((item) => item.tenant_id === tenantId);
  const departmentId = departments.some((item) => item.id === requestedDepartmentId)
    ? requestedDepartmentId
    : '';

  if (!error && tenantId) {
    const query = new URLSearchParams({ tenantId, from, to, status, page });
    if (departmentId) query.set('departmentId', departmentId);
    try {
      report = await getJson<Report>(`/v1/reports/product-registrations?${query}`);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Falha ao consultar o relatório.';
    }
  }

  const pageNumber = Number(page);
  const pages = report ? Math.max(1, Math.ceil(report.total / report.pageSize)) : 1;
  const baseQuery = { tenantId, from, to, status, ...(departmentId ? { departmentId } : {}) };
  const dateTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Shell page="relatorios" eyebrow="GESTÃO / PRODUTOS" title="Cadastro de produtos por período">
      <div className="report-back">
        <Link href="/relatorios">← Voltar aos relatórios</Link>
      </div>
      <div className="info-banner">
        <strong>Dados do PostgreSQL</strong>
        <span>
          Consulta pela data de cadastro no fuso do Rio Grande do Norte. Produtos ainda não foram
          importados; a lista aparecerá quando o cadastro real estiver disponível.
        </span>
      </div>

      <form className="registration-filters panel" method="get">
        <label>
          Empresa
          <select name="tenantId" defaultValue={tenantId} disabled={!options.tenants.length}>
            {options.tenants.length === 0 && <option value="">Nenhuma empresa cadastrada</option>}
            {options.tenants.map((tenant) => (
              <option value={tenant.id} key={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data inicial
          <input type="date" name="from" defaultValue={from} required />
        </label>
        <label>
          Data final
          <input type="date" name="to" defaultValue={to} required />
        </label>
        <label>
          Departamento
          <select name="departmentId" defaultValue={departmentId}>
            <option value="">Todos</option>
            {departments.map((department) => (
              <option value={department.id} key={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Situação
          <select name="status" defaultValue={status}>
            <option value="all">Todas</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </label>
        <button type="submit" disabled={!tenantId}>
          Consultar
        </button>
      </form>

      {error && (
        <div className="catalog-error" role="alert">
          {error}
        </div>
      )}

      {!error && !tenantId && (
        <section className="panel registration-empty">
          <h2>Empresa ainda não cadastrada</h2>
          <p>
            O banco está preparado, mas a empresa e a lista de produtos ainda não foram gravadas.
            Quando o cadastro for concluído, este relatório mostrará os produtos reais.
          </p>
        </section>
      )}

      {report && (
        <section className="panel registration-results">
          <div className="registration-heading">
            <div>
              <p className="eyebrow">RESULTADO</p>
              <h2>Produtos cadastrados</h2>
            </div>
            <strong>{report.total.toLocaleString('pt-BR')} produto(s)</strong>
          </div>
          <div className="registration-table-wrap">
            <table className="registration-table">
              <thead>
                <tr>
                  <th>Data de cadastro</th>
                  <th>SKU</th>
                  <th>Descrição</th>
                  <th>Classificação</th>
                  <th>Unidade</th>
                  <th>GTIN</th>
                  <th>NCM</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((product) => (
                  <tr key={product.id}>
                    <td>{dateTime.format(new Date(product.registered_at))}</td>
                    <td>{product.sku}</td>
                    <td>{product.description}</td>
                    <td>
                      {[
                        product.department,
                        product.section,
                        product.product_group,
                        product.subgroup,
                      ]
                        .filter(Boolean)
                        .join(' › ')}
                    </td>
                    <td>{product.unit_code}</td>
                    <td>{product.gtin || '—'}</td>
                    <td>{product.ncm || '—'}</td>
                    <td>{product.status === 'active' ? 'Ativo' : 'Inativo'}</td>
                  </tr>
                ))}
                {report.rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="registration-empty-cell">
                      Nenhum produto encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <nav className="registration-pages" aria-label="Páginas do relatório">
              {pageNumber > 1 && (
                <Link href={reportLink({ ...baseQuery, page: String(pageNumber - 1) })}>
                  ← Anterior
                </Link>
              )}
              <span>
                Página {pageNumber} de {pages}
              </span>
              {pageNumber < pages && (
                <Link href={reportLink({ ...baseQuery, page: String(pageNumber + 1) })}>
                  Próxima →
                </Link>
              )}
            </nav>
          )}
        </section>
      )}
    </Shell>
  );
}
