import { useEffect, useState } from 'react';
import { ClosingView } from './ClosingView.tsx';

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [view, setView] = useState<'sale' | 'closing'>('sale');
  useEffect(() => {
    const controller = new AbortController();
    fetch('http://127.0.0.1:3333/health', { signal: controller.signal })
      .then((response) => setApiOnline(response.ok))
      .catch(() => setApiOnline(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="pdv-app">
      <aside className="pdv-rail">
        <a className="pdv-brand" href="http://127.0.0.1:3000" aria-label="Voltar ao ERP">
          <span>E</span>
          <strong>EXPERT</strong>
          <small>PDV</small>
        </a>
        <nav className="rail-nav" aria-label="Navegação do PDV">
          <button
            className={`rail-item ${view === 'sale' ? 'selected' : ''}`}
            onClick={() => setView('sale')}
            title="Venda"
          >
            ▣<span>Venda</span>
          </button>
          <button
            className={`rail-item ${view === 'closing' ? 'selected' : ''}`}
            onClick={() => setView('closing')}
            title="Fechamento"
          >
            ▤<span>Fechamento</span>
          </button>
        </nav>
        <div className="rail-foot">RN</div>
      </aside>
      <div className="pdv-main">
        <header className="pdv-topbar">
          <div>
            <span className="pdv-overline">COMPREMAI$ ESTIVAS</span>
            <h1>{view === 'sale' ? 'Frente de caixa' : 'Conferência do caixa'}</h1>
          </div>
          <div className="top-right">
            <span className={`connection ${apiOnline ? 'online' : ''}`}>
              <i />
              {apiOnline ? 'API conectada' : 'API desconectada'}
            </span>
            <span className="user-badge">Piloto RN</span>
          </div>
        </header>
        {view === 'closing' ? (
          <ClosingView />
        ) : (
          <div className="pdv-body">
            <section className="sale-area">
              <div className="sale-heading">
                <div>
                  <p className="section-overline">NOVA VENDA</p>
                  <h2>Itens da venda</h2>
                </div>
                <span className="draft-tag">Caixa não aberto</span>
              </div>
              <div className="search-row">
                <label className="search-field">
                  <span>⌕</span>
                  <input
                    aria-label="Buscar produto"
                    placeholder="Leia o código ou busque um produto"
                    disabled
                  />
                </label>
                <button disabled className="secondary-button">
                  Adicionar item
                </button>
              </div>
              <div className="items-header">
                <span>PRODUTO</span>
                <span>QTD.</span>
                <span>VALOR</span>
              </div>
              <div className="items-empty">
                <div className="items-empty-icon">▦</div>
                <h3>Aguardando catálogo real</h3>
                <p>
                  Os produtos do CompreMai$ Estivas aparecerão aqui depois do cadastro e da
                  integração com a API.
                </p>
              </div>
              <div className="sale-footer">
                <span>
                  Esta tela é a base visual do PDV. Nenhuma venda pode ser concluída nesta fase.
                </span>
                <span>0 itens</span>
              </div>
            </section>
            <aside className="checkout-area">
              <div className="checkout-title">
                <p className="section-overline">RESUMO</p>
                <h2>Venda atual</h2>
              </div>
              <div className="total-box">
                <span>Total a pagar</span>
                <strong>{money(0)}</strong>
                <small>Sem itens na venda</small>
              </div>
              <div className="totals-line">
                <span>Subtotal</span>
                <strong>{money(0)}</strong>
              </div>
              <div className="totals-line">
                <span>Descontos</span>
                <strong>{money(0)}</strong>
              </div>
              <div className="totals-line total">
                <span>Total</span>
                <strong>{money(0)}</strong>
              </div>
              <div className="payment-heading">PAGAMENTO</div>
              <div className="payment-grid">
                <button disabled>Dinheiro</button>
                <button disabled>Débito</button>
                <button disabled>Crédito</button>
                <button disabled>PIX</button>
                <button disabled>Convênio</button>
                <button disabled>Troca</button>
                <button disabled>Outros</button>
              </div>
              <button disabled className="checkout-button">
                Concluir venda
              </button>
              <p className="checkout-note">
                TEF, Convênio, Troca e emissão fiscal serão habilitados após integração e testes da
                operação real.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
