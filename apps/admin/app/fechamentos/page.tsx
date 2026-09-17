import { Shell } from '../../components/shell';

export default function ClosingsPage() {
  return (
    <Shell page="fechamentos" eyebrow="PDV / CONTROLE" title="Fechamento dos PDVs">
      <div className="info-banner">
        <strong>Relatório em preparação</strong>
        <span>
          Os fechamentos aparecerão quando vendas, pagamentos, sessões de caixa e usuários estiverem
          integrados à API. Nenhum valor fictício é exibido.
        </span>
      </div>
      <section className="closings-panel">
        <div className="closings-panel-head">
          <div>
            <p className="eyebrow">CONSULTA DA RETAGUARDA</p>
            <h2>Conferências por check-out</h2>
          </div>
          <span className="panel-tag">FASE 2 · PDV</span>
        </div>
        <div className="closings-filters" aria-label="Filtros previstos para o relatório">
          <label>
            De
            <input type="date" disabled aria-label="Data inicial indisponível" />
          </label>
          <label>
            Até
            <input type="date" disabled aria-label="Data final indisponível" />
          </label>
          <label>
            Filial
            <select disabled aria-label="Filial indisponível">
              <option>CompreMai$ Estivas · RN</option>
            </select>
          </label>
          <label>
            Check-out
            <select disabled aria-label="Check-out indisponível">
              <option>Todos os caixas</option>
            </select>
          </label>
          <label>
            Operador
            <select disabled aria-label="Operador indisponível">
              <option>Todos os operadores</option>
            </select>
          </label>
          <label>
            Situação
            <select disabled aria-label="Situação indisponível">
              <option>Todas</option>
            </select>
          </label>
        </div>
        <div className="closings-metrics">
          <div>
            <span>Fechamentos</span>
            <strong>—</strong>
          </div>
          <div>
            <span>Vendas líquidas</span>
            <strong>—</strong>
          </div>
          <div>
            <span>Dinheiro previsto</span>
            <strong>—</strong>
          </div>
          <div>
            <span>Diferença total</span>
            <strong>—</strong>
          </div>
        </div>
        <div className="closings-table-wrap">
          <table className="closings-table">
            <thead>
              <tr>
                <th>Fechamento</th>
                <th>Filial / check-out</th>
                <th>Operador</th>
                <th>Vendas líquidas</th>
                <th>Previsto</th>
                <th>Conferido</th>
                <th>Diferença</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="closings-empty">
                  Nenhum fechamento real registrado. A consulta será liberada após a integração do
                  PDV.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="closings-notes">
        <h2>Detalhe de cada fechamento</h2>
        <p>
          Ao selecionar um turno, a retaguarda mostrará abertura, suprimentos, sangrias, vendas,
          estornos, previsto e conferido por dinheiro, débito, crédito, PIX, Convênio, Troca e
          outros; diferença por meio e total, observação e identificação do operador. O comprovante
          poderá ser reimpresso com a identificação do fechamento original.
        </p>
      </section>
    </Shell>
  );
}
