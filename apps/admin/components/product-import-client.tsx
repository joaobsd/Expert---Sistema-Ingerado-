'use client';

import { useState, type ChangeEvent } from 'react';
import { reviewProductCsv, type ProductReview } from '../lib/product-import';
const money = (value: number | null) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

export function ProductImportClient() {
  const [fileName, setFileName] = useState('');
  const [review, setReview] = useState<ProductReview | null>(null);
  const [error, setError] = useState('');
  const [onlyIssues, setOnlyIssues] = useState(false);
  const errorCount = review?.issues.filter((issue) => issue.level === 'error').length ?? 0;
  const warningCount = review?.issues.filter((issue) => issue.level === 'warning').length ?? 0;
  const visibleRows = (
    onlyIssues ? review?.rows.filter((row) => row.issues.length) : review?.rows
  )?.slice(0, 50);

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setReview(null);
    setError('');
    setFileName(file?.name ?? '');
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Selecione um arquivo CSV separado por ponto e vírgula.');
      return;
    }
    if (file.size > 2_000_000) {
      setError('O arquivo excede 2 MB. Divida a lista em lotes menores.');
      return;
    }
    try {
      setReview(reviewProductCsv(await file.text()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler o arquivo.');
    }
  }

  return (
    <div className="catalog-import">
      <div className="info-banner">
        <strong>Lista ainda não cadastrada</strong>
        <span>
          Esta etapa lê o CSV apenas no navegador para conferir os dados. Nenhum produto é enviado à
          API ou gravado no banco.
        </span>
      </div>
      <div className="catalog-step-grid">
        <section className="catalog-step-card">
          <span className="catalog-step-number">01</span>
          <h2>Baixe o modelo</h2>
          <p>
            Uma linha por produto. Preencha SKU, descrição, departamento e unidade de venda. Seção,
            grupo e subgrupo são opcionais nesta prévia. GTIN, NCM, CEST, preço e custo podem ser
            revisados antes da ativação.
          </p>
          <a
            className="catalog-action"
            href="/modelo-produtos.csv"
            download="modelo_produtos_compremais.csv"
          >
            Baixar modelo CSV
          </a>
        </section>
        <section className="catalog-step-card">
          <span className="catalog-step-number">02</span>
          <h2>Preencha no Excel</h2>
          <p>
            Mantenha SKU, GTIN, NCM e CEST como texto para preservar zeros à esquerda. Salve como
            CSV UTF-8 separado por ponto e vírgula. Valores monetários usam vírgula, como 12,34.
          </p>
          <span className="catalog-muted-action">Sem produtos de exemplo</span>
        </section>
        <section className="catalog-step-card">
          <span className="catalog-step-number">03</span>
          <h2>Confira a lista</h2>
          <p>
            A prévia aponta campos ausentes, SKU ou GTIN repetido e códigos com formato inválido. A
            classificação fiscal ainda precisa de conferência específica.
          </p>
          <label className="catalog-action upload-action">
            Selecionar CSV
            <input type="file" accept=".csv,text/csv" onChange={readFile} />
          </label>
        </section>
      </div>

      {error && (
        <div className="catalog-error" role="alert">
          {error}
        </div>
      )}
      {review && (
        <section className="catalog-review">
          <div className="catalog-review-head">
            <div>
              <p className="eyebrow">PRÉVIA LOCAL</p>
              <h2>{fileName}</h2>
              <p>Conferência concluída no navegador. Revise os alertas antes de cadastrar.</p>
            </div>
            <label className="catalog-filter">
              <input
                type="checkbox"
                checked={onlyIssues}
                onChange={(event) => setOnlyIssues(event.target.checked)}
              />
              Mostrar só linhas com apontamentos
            </label>
          </div>
          <div className="catalog-summary">
            <div>
              <span>Produtos lidos</span>
              <strong>{review.rows.length}</strong>
            </div>
            <div>
              <span>Departamentos</span>
              <strong>{review.departments.length}</strong>
            </div>
            <div>
              <span>Erros</span>
              <strong className={errorCount ? 'catalog-count-error' : ''}>{errorCount}</strong>
            </div>
            <div>
              <span>Avisos</span>
              <strong>{warningCount}</strong>
            </div>
          </div>
          {review.departments.length > 0 && (
            <p className="catalog-departments">
              <strong>Departamentos encontrados:</strong> {review.departments.join(', ')}
            </p>
          )}
          {review.unmappedColumns.length > 0 && (
            <p className="catalog-unmapped" role="status">
              <strong>Colunas ainda sem mapeamento:</strong> {review.unmappedColumns.join(', ')}.
              Elas não entram nesta prévia. Os campos tributários serão mapeados quando recebermos a
              lista real.
            </p>
          )}
          <div className="catalog-table-wrap">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>Linha</th>
                  <th>SKU</th>
                  <th>Descrição</th>
                  <th>Classificação</th>
                  <th>Unid.</th>
                  <th>GTIN</th>
                  <th>NCM</th>
                  <th>Preço</th>
                  <th>Apontamentos</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows?.map((row) => (
                  <tr key={row.line}>
                    <td>{row.line}</td>
                    <td>{row.sku || '—'}</td>
                    <td>{row.description || '—'}</td>
                    <td className="catalog-hierarchy">
                      {[row.department, row.section, row.group, row.subgroup]
                        .filter(Boolean)
                        .join(' › ') || '—'}
                    </td>
                    <td>{row.unit || '—'}</td>
                    <td>{row.gtin || '—'}</td>
                    <td>{row.ncm || '—'}</td>
                    <td>{money(row.priceCents)}</td>
                    <td>
                      {row.issues.length ? (
                        row.issues.map((issue) => (
                          <span key={issue.message} className={`catalog-issue ${issue.level}`}>
                            {issue.message}
                          </span>
                        ))
                      ) : (
                        <span className="catalog-ok">Sem apontamentos de formato</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!visibleRows?.length && (
                  <tr>
                    <td colSpan={9} className="catalog-no-rows">
                      {review.rows.length === 0
                        ? 'Arquivo ainda sem produtos. Preencha o modelo e selecione novamente.'
                        : 'Nenhuma linha corresponde ao filtro.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {(onlyIssues
            ? review.rows.filter((row) => row.issues.length).length
            : review.rows.length) > 50 && (
            <p className="catalog-limit">
              Exibindo as primeiras 50 linhas. Todos os registros foram verificados.
            </p>
          )}
          <p className="catalog-review-note">
            Esta revisão verifica formato e duplicidade dentro do arquivo. Ela não confirma preço,
            tributação, existência do GTIN na GS1 ou disponibilidade para venda.
          </p>
        </section>
      )}
    </div>
  );
}
