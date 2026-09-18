import Link from 'next/link';
import { Shell } from '../../components/shell';

const reports = [
  {
    name: 'Vendas NF-e e NFC-e',
    detail:
      'Visões sintética e analítica por período, departamento e curva ABC, com venda e custo históricos.',
    phase: 'FASE 3',
  },
  {
    name: 'Cadastro de produtos',
    detail: 'Consulta ao banco por data de cadastro, empresa, departamento e situação.',
    phase: 'FASE 1',
    href: '/relatorios/cadastro-produtos',
  },
  {
    name: 'Entradas de mercadorias',
    detail: 'Fornecedores, departamentos, quantidades e custos por período de recebimento.',
    phase: 'FASE 6',
  },
  {
    name: 'Vendas do PDV',
    detail: 'Desempenho e ticket médio por check-out, operador e turno.',
    phase: 'FASE 2',
  },
  {
    name: 'Fechamento dos PDVs',
    detail:
      'Conferência por turno e check-out: valor previsto, valor físico e diferença por meio de recebimento, com comprovante para impressora térmica.',
    phase: 'FASE 2',
  },
];

export default function ReportsPage() {
  return (
    <Shell page="relatorios" eyebrow="GESTÃO" title="Relatórios">
      <div className="info-banner">
        <strong>Relatórios do Expert</strong>
        <span>
          O relatório de cadastro de produtos já consulta o PostgreSQL. Os demais receberão dados
          conforme cada módulo operacional entrar em funcionamento.
        </span>
      </div>
      <div className="report-grid">
        {reports.map((report) => (
          <article className="report-card" key={report.name}>
            <div className="report-icon">▥</div>
            <span className="panel-tag">{report.phase}</span>
            <h2>{report.name}</h2>
            <p>{report.detail}</p>
            {report.href ? (
              <Link className="catalog-action" href={report.href}>
                Abrir relatório
              </Link>
            ) : (
              <span className="step-label">AGUARDANDO DADOS</span>
            )}
          </article>
        ))}
      </div>
    </Shell>
  );
}
