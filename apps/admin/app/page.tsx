import Link from 'next/link';
import { Shell } from '../components/shell';

async function apiConnected() {
  try {
    const response = await fetch('http://127.0.0.1:3333/health', {
      cache: 'no-store',
      signal: AbortSignal.timeout(1800),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const connected = await apiConnected();
  return (
    <Shell page="inicio" eyebrow="PAINEL DE CONTROLE" title="Visão geral">
      <section className="hero-card">
        <div>
          <span className="hero-kicker">BEM-VINDO AO EXPERT</span>
          <h2>CompreMai$ Estivas começa aqui.</h2>
          <p>
            O projeto começou pelo piloto supermercadista do Rio Grande do Norte. O catálogo real
            será definido com você antes dos primeiros cadastros.
          </p>
        </div>
        <Link href="/produtos" className="primary-button">
          Ver estrutura de produtos <span aria-hidden="true">→</span>
        </Link>
      </section>
      <div className="status-row">
        <span className={`status-dot ${connected ? 'online' : ''}`} />
        <strong>API {connected ? 'conectada' : 'desconectada'}</strong>
        <span>
          {connected
            ? 'Serviço local respondendo normalmente.'
            : 'Inicie a API para conectar o painel.'}
        </span>
      </div>
      <section className="section-heading">
        <div>
          <p className="eyebrow">OPERAÇÃO</p>
          <h2>Indicadores</h2>
        </div>
        <small>Os valores aparecem após as operações reais.</small>
      </section>
      <div className="metric-grid">
        {[
          ['Vendas no período', 'Ainda sem vendas'],
          ['Produtos cadastrados', 'Catálogo a definir'],
          ['Check-outs ativos', 'Caixas não configurados'],
          ['Documentos fiscais', 'Homologação futura'],
        ].map(([label, note]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>—</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>
      <section className="section-heading">
        <div>
          <p className="eyebrow">PRÓXIMOS PASSOS</p>
          <h2>Implantação do piloto</h2>
        </div>
      </section>
      <div className="step-grid">
        <article className="step-card">
          <span className="step-number">01</span>
          <h3>Estruturar cadastros</h3>
          <p>Empresa, filial, departamentos e campos dos produtos. Sem itens fictícios.</p>
          <span className="step-label current">EM ANDAMENTO</span>
        </article>
        <article className="step-card">
          <span className="step-number">02</span>
          <h3>Integrar o PDV</h3>
          <p>Produtos, preços, caixa e venda passam a compartilhar a mesma API.</p>
          <span className="step-label">PLANEJADO</span>
        </article>
        <article className="step-card">
          <span className="step-number">03</span>
          <h3>Homologar o fiscal</h3>
          <p>NF-e e NFC-e seguem as regras da operação e da UF após validação.</p>
          <span className="step-label">PLANEJADO</span>
        </article>
      </div>
    </Shell>
  );
}
