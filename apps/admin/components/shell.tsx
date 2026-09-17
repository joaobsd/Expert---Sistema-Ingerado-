import Link from 'next/link';

type Page = 'inicio' | 'produtos' | 'relatorios' | 'fechamentos';

const navigation: { href: string; label: string; icon: string; page: Page }[] = [
  { href: '/', label: 'Visão geral', icon: '◫', page: 'inicio' },
  { href: '/produtos', label: 'Produtos', icon: '▦', page: 'produtos' },
  { href: '/relatorios', label: 'Relatórios', icon: '▥', page: 'relatorios' },
  { href: '/fechamentos', label: 'Fechamentos', icon: '▤', page: 'fechamentos' },
];

export function Shell({
  page,
  title,
  eyebrow,
  children,
}: {
  page: Page;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="EXPERT ERP, início">
          <span className="brand-mark">E</span>
          <span>
            <strong>EXPERT</strong>
            <small>ERP + PDV WEB</small>
          </span>
        </Link>
        <div className="sidebar-section">WORKSPACE</div>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${page === item.page ? 'active' : ''}`}
              aria-current={page === item.page ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="pilot-dot" /> CompreMai$ Estivas · RN
          <small>Fundação em desenvolvimento</small>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span>EXPERT / {title}</span>
          <span className="topbar-tag">Ambiente local</span>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
            </div>
            <span className="phase-pill">FASE 1 · FUNDAÇÃO</span>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
