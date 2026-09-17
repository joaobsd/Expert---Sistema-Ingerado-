import Link from 'next/link';
import { Shell } from '../../components/shell';

export default function ProductsPage() {
  return (
    <Shell page="produtos" eyebrow="CADASTROS" title="Produtos">
      <div className="info-banner">
        <strong>Catálogo do supermercado</strong>
        <span>
          A lista de produtos será montada com os dados reais da loja. Nenhum SKU foi criado
          automaticamente.
        </span>
      </div>
      <div className="two-column">
        <section className="panel">
          <div className="panel-heading">
            <h2>Estrutura prevista</h2>
            <span className="panel-tag">BASE DE DADOS</span>
          </div>
          <div className="field-list">
            <div>
              <strong>Identificação</strong>
              <span>SKU, descrição, GTIN e unidade</span>
            </div>
            <div>
              <strong>Organização</strong>
              <span>Departamento e status do produto</span>
            </div>
            <div>
              <strong>Fiscal</strong>
              <span>NCM e CEST, sujeitos à revisão fiscal</span>
            </div>
            <div>
              <strong>Histórico</strong>
              <span>Data de cadastro preservada para relatórios</span>
            </div>
          </div>
        </section>
        <section className="panel accent-panel">
          <div className="panel-heading">
            <h2>Para abrir o cadastro</h2>
          </div>
          <p>
            Precisamos definir os departamentos e os primeiros produtos do supermercado, incluindo
            como serão vendidos: unidade, peso ou outra unidade aplicável.
          </p>
          <ul>
            <li>Empresa e filial do piloto</li>
            <li>Departamentos usados na loja</li>
            <li>Lista inicial de produtos e códigos</li>
            <li>Revisão de tributação pelo responsável fiscal</li>
          </ul>
          <Link className="catalog-action" href="/produtos/importar">
            Preparar lista de produtos
          </Link>
        </section>
      </div>
      <section className="panel empty-panel">
        <div className="empty-icon">▦</div>
        <h2>Nenhum produto cadastrado</h2>
        <p>
          Os produtos aparecerão aqui quando o cadastro real e as permissões de acesso estiverem
          prontos.
        </p>
      </section>
    </Shell>
  );
}
