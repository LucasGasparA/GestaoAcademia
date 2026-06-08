import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Alunos from './pages/Alunos';
import Instrutores from './pages/Instrutores';
import Planos from './pages/Planos';
import Matriculas from './pages/Matriculas';
import Pagamentos from './pages/Pagamentos';
import AvaliacoesFisicas from './pages/AvaliacoesFisicas';

const navItems = [
  { to: '/',            label: 'Dashboard',         icon: '▦',  end: true },
  { to: '/alunos',      label: 'Alunos',             icon: '◉' },
  { to: '/instrutores', label: 'Instrutores',        icon: '◈' },
  { to: '/planos',      label: 'Planos',             icon: '◧' },
  { to: '/matriculas',  label: 'Matrículas',         icon: '◫' },
  { to: '/pagamentos',  label: 'Pagamentos',         icon: '◬' },
  { to: '/avaliacoes',  label: 'Avaliações Físicas', icon: '◭' },
];

function Topbar() {
  const loc = useLocation();
  const current = navItems.find(n =>
    n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)
  );
  return (
    <div className="topbar">
      <div className="topbar-breadcrumb">
        <span>FitAcademia</span>
        <span style={{ color: 'var(--t3)' }}>/</span>
        <span className="current">{current?.label ?? '—'}</span>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🏆 FitAcademia</h1>
          <p>Sistema de Gestão</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon" style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">FitAcademia © 2026</div>
      </aside>

      <main className="main-content">
        <Topbar />
        <div className="page-body">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/alunos"      element={<Alunos />} />
            <Route path="/instrutores" element={<Instrutores />} />
            <Route path="/planos"      element={<Planos />} />
            <Route path="/matriculas"  element={<Matriculas />} />
            <Route path="/pagamentos"  element={<Pagamentos />} />
            <Route path="/avaliacoes"  element={<AvaliacoesFisicas />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
