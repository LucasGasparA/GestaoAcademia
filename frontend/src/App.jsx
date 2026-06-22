import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Alunos from './pages/Alunos';
import Instrutores from './pages/Instrutores';
import Planos from './pages/Planos';
import Matriculas from './pages/Matriculas';
import Pagamentos from './pages/Pagamentos';
import AvaliacoesFisicas from './pages/AvaliacoesFisicas';
import { IconGrid, IconUser, IconBadge, IconLayers, IconClipboard, IconCoin, IconActivity } from './components/Icons';
import LogConsole from './components/LogConsole';

const navItems = [
  { to: '/',            label: 'Dashboard',         Icon: IconGrid,      end: true },
  { to: '/alunos',      label: 'Alunos',            Icon: IconUser },
  { to: '/instrutores', label: 'Instrutores',       Icon: IconBadge },
  { to: '/planos',      label: 'Planos',            Icon: IconLayers },
  { to: '/matriculas',  label: 'Matrículas',        Icon: IconClipboard },
  { to: '/pagamentos',  label: 'Pagamentos',        Icon: IconCoin },
  { to: '/avaliacoes',  label: 'Avaliações',        Icon: IconActivity },
];

function Topbar() {
  const loc = useLocation();
  const current = navItems.find(n =>
    n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)
  );
  return (
    <div className="topbar">
      <div className="topbar-breadcrumb">
        <span>FIT//ACADEMIA</span>
        <span style={{ color: 'var(--t3)' }}>/</span>
        <span className="current">{current?.label ?? '—'}</span>
      </div>
      <div className="topbar-status">
        <span className="dot" />
        SISTEMA ONLINE
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>FIT//ACADEMIA</h1>
          <p>Console de Gestão</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="nav-icon"><item.Icon /></span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>FIT//ACADEMIA © 2026</span>
          <span className="status-dot" />
        </div>
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

      <LogConsole />
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
