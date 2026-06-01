import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const MODULES = [
  { key: 'alunos',      label: 'Alunos',           icon: '◉', path: '/alunos',      to: '/alunos' },
  { key: 'instrutores', label: 'Instrutores',       icon: '◈', path: '/instrutores', to: '/instrutores' },
  { key: 'planos',      label: 'Planos ativos',     icon: '◧', path: '/planos',      to: '/planos' },
  { key: 'matriculas',  label: 'Matrículas',        icon: '◫', path: '/matriculas',  to: '/matriculas' },
  { key: 'pagamentos',  label: 'Pagamentos',        icon: '◬', path: '/pagamentos',  to: '/pagamentos' },
  { key: 'avaliacoes',  label: 'Avaliações',        icon: '◭', path: '/avaliacoes',  to: '/avaliacoes' },
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(MODULES.map(m => api.get(m.path).then(r => [m.key, r.data.length])))
      .then(entries => setCounts(Object.fromEntries(entries)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Visão geral</h2>
          <p>Resumo de todos os módulos do sistema</p>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Carregando...</div>
      ) : (
        <div className="stats-grid">
          {MODULES.map(m => (
            <Link
              key={m.key}
              to={m.to}
              style={{ textDecoration: 'none' }}
            >
              <div className="stat-card">
                <div className="stat-icon">
                  <span style={{ fontSize: 16 }}>{m.icon}</span>
                </div>
                <div className="stat-info">
                  <h3>{counts[m.key] ?? 0}</h3>
                  <p>{m.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="welcome-card">
        <h3>Bem-vindo ao FitAcademia</h3>
        <p>
          Gerencie alunos, instrutores, planos, matrículas, pagamentos e avaliações físicas.
          Use o menu lateral para navegar entre os módulos ou clique nos cards acima.
        </p>
      </div>
    </div>
  );
}
