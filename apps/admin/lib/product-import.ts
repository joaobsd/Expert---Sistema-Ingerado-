export const productHeaders = [
  'sku',
  'descricao',
  'departamento',
  'unidade_venda',
  'gtin',
  'ncm',
  'cest',
  'preco_venda',
  'custo_unitario',
] as const;

export type ProductIssue = { line: number; level: 'error' | 'warning'; message: string };
export type ProductDraft = {
  line: number;
  sku: string;
  description: string;
  department: string;
  unit: string;
  gtin: string;
  ncm: string;
  cest: string;
  priceCents: number | null;
  costCents: number | null;
  issues: ProductIssue[];
};
export type ProductReview = {
  rows: ProductDraft[];
  issues: ProductIssue[];
  departments: string[];
};

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function parseRows(text: string): { line: number; cells: string[] }[] {
  const rows: { line: number; cells: string[] }[] = [];
  let cells: string[] = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let rowLine = 1;

  function finishRow() {
    cells.push(field);
    if (cells.some((cell) => cell.trim())) rows.push({ line: rowLine, cells });
    cells = [];
    field = '';
    rowLine = line + 1;
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (quoted) {
        quoted = false;
      } else if (!field) {
        quoted = true;
      } else {
        throw new Error(`Aspas fora do início do campo na linha ${line}.`);
      }
    } else if (char === ';' && !quoted) {
      cells.push(field);
      field = '';
    } else if ((char === '\r' || char === '\n') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      finishRow();
      line++;
    } else {
      field += char;
      if (char === '\n') line++;
    }
  }
  if (quoted) throw new Error(`Campo entre aspas não foi fechado na linha ${rowLine}.`);
  if (field || cells.length) finishRow();
  return rows;
}

function parseMoney(value: string): number | null | 'invalid' {
  const clean = value.trim();
  if (!clean) return null;
  if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(clean)) return 'invalid';
  const cents = Math.round(Number(clean.replace(/\./g, '').replace(',', '.')) * 100);
  return Number.isSafeInteger(cents) && cents >= 0 ? cents : 'invalid';
}

function validGtin(value: string): boolean {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return false;
  const body = value.slice(0, -1);
  let sum = 0;
  for (let i = body.length - 1, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) {
    sum += Number(body[i]) * weight;
  }
  return (10 - (sum % 10)) % 10 === Number(value.at(-1));
}

export function reviewProductCsv(text: string): ProductReview {
  const parsed = parseRows(text);
  if (!parsed.length) throw new Error('O arquivo está vazio.');
  if (parsed.length > 5001) throw new Error('O arquivo excede 5.000 produtos. Divida em lotes.');
  const headers = parsed[0].cells.map(normalizeHeader);
  if (new Set(headers).size !== headers.length)
    throw new Error('Há colunas repetidas no cabeçalho.');
  const missing = productHeaders.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Colunas ausentes: ${missing.join(', ')}.`);

  const issues: ProductIssue[] = [];
  const rows: ProductDraft[] = [];
  const seenSku = new Map<string, number>();
  const seenGtin = new Map<string, number>();
  const col = (cells: string[], header: (typeof productHeaders)[number]) =>
    (cells[headers.indexOf(header)] ?? '').trim();

  for (const source of parsed.slice(1)) {
    const rowIssues: ProductIssue[] = [];
    const add = (level: ProductIssue['level'], message: string) => {
      const issue = { line: source.line, level, message };
      rowIssues.push(issue);
      issues.push(issue);
    };
    if (source.cells.length !== headers.length)
      add('error', 'Número de colunas diferente do cabeçalho.');
    const sku = col(source.cells, 'sku');
    const description = col(source.cells, 'descricao');
    const department = col(source.cells, 'departamento');
    const unit = col(source.cells, 'unidade_venda').toUpperCase();
    const gtin = col(source.cells, 'gtin');
    const ncm = col(source.cells, 'ncm');
    const cest = col(source.cells, 'cest');
    const priceCents = parseMoney(col(source.cells, 'preco_venda'));
    const costCents = parseMoney(col(source.cells, 'custo_unitario'));

    if (!sku) add('error', 'SKU obrigatório.');
    else if (sku.length > 64) add('error', 'SKU acima de 64 caracteres.');
    else if (seenSku.has(sku.toLocaleLowerCase('pt-BR')))
      add('error', `SKU repetido (linha ${seenSku.get(sku.toLocaleLowerCase('pt-BR'))}).`);
    else seenSku.set(sku.toLocaleLowerCase('pt-BR'), source.line);
    if (!description) add('error', 'Descrição obrigatória.');
    if (!department) add('error', 'Departamento obrigatório.');
    if (!unit) add('error', 'Unidade de venda obrigatória.');
    if (gtin && !validGtin(gtin)) add('error', 'GTIN com tamanho ou dígito verificador inválido.');
    if (gtin && seenGtin.has(gtin)) add('error', `GTIN repetido (linha ${seenGtin.get(gtin)}).`);
    else if (gtin) seenGtin.set(gtin, source.line);
    if (ncm && !/^\d{8}$/.test(ncm)) add('error', 'NCM deve ter 8 dígitos.');
    if (cest && !/^\d{7}$/.test(cest)) add('error', 'CEST deve ter 7 dígitos.');
    if (priceCents === 'invalid') add('error', 'Preço de venda inválido. Use 12,34.');
    else if (priceCents === null || priceCents === 0)
      add('warning', 'Preço de venda não informado ou zerado.');
    if (costCents === 'invalid') add('error', 'Custo unitário inválido. Use 12,34.');
    if (!ncm) add('warning', 'NCM pendente de revisão fiscal.');

    rows.push({
      line: source.line,
      sku,
      description,
      department,
      unit,
      gtin,
      ncm,
      cest,
      priceCents: typeof priceCents === 'number' ? priceCents : null,
      costCents: typeof costCents === 'number' ? costCents : null,
      issues: rowIssues,
    });
  }
  return {
    rows,
    issues,
    departments: [...new Set(rows.map((row) => row.department).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    ),
  };
}
