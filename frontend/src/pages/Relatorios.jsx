import { useEffect, useState } from 'react';
import api from '../api/api';
import { IconEmptyBox } from '../components/Icons';

const TABS = [
  { key: 'alunos-ativos',     label: 'Alunos Ativos',     view: 'vw_alunos_ativos' },
  { key: 'inadimplentes',     label: 'Inadimplentes',     view: 'vw_inadimplentes' },
  { key: 'faturamento-mensal', label: 'Faturamento Mensal', view: 'vw_faturamento_mensal' },
  { key: 'total-pago',        label: 'Total Pago por Aluno', view: 'fn_total_pago_aluno' },
];

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatCurrency(v) {
  if (v == null) return '-';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Relatorios() {
  const [tab, setTab] = useState(TABS[0].key);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [totalPago, setTotalPago] = useState(null);
  const [totalLoading, setTotalLoading] = useState(false);
  const [totalError, setTotalError] = useState('');

  useEffect(() => {
    if (tab === 'total-pago') return;
    setLoading(true);
    api.get(`/relatorios/${tab}`)
      .then(r => setRows(r.data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    api.get('/alunos/select').then(r => setAlunos(r.data)).catch(() => setAlunos([]));
  }, []);

  function handleConsultarTotal() {
    if (!alunoId) return;
    setTotalLoading(true);
    setTotalError('');
    setTotalPago(null);
    api.get(`/relatorios/total-pago/${alunoId}`)
      .then(r => setTotalPago(r.data.total_pago))
      .catch(err => setTotalError(err.response?.data?.error || 'Erro ao consultar'))
      .finally(() => setTotalLoading(false));
  }

  const current = TABS.find(t => t.key === tab);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Relatórios</h2>
          <p>// dados das views do banco (somente leitura)</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-400)' }}>
            {tab === 'total-pago' ? `SELECT ${current.view}(id_aluno)` : `SELECT * FROM ${current.view}`}
          </span>
          {tab !== 'total-pago' && (
            <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>{rows.length} registro(s)</span>
          )}
        </div>

        {tab === 'total-pago' ? (
          <div style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Aluno</label>
                <select value={alunoId} onChange={e => { setAlunoId(e.target.value); setTotalPago(null); setTotalError(''); }}>
                  <option value="">— Selecione um aluno —</option>
                  {alunos.map(a => (
                    <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" disabled={!alunoId || totalLoading} onClick={handleConsultarTotal} style={{ marginTop: 12 }}>
              {totalLoading ? 'Consultando...' : 'Consultar'}
            </button>

            {totalError && <div className="alert alert-error" style={{ marginTop: 16 }}>{totalError}</div>}

            {totalPago !== null && !totalError && (
              <div className="stat-card" style={{ marginTop: 20, maxWidth: 280 }}>
                <div className="stat-info">
                  <h3>{formatCurrency(totalPago)}</h3>
                  <p>Total pago pelo aluno</p>
                </div>
              </div>
            )}
          </div>
        ) : (
        <div className="table-wrapper">
          {loading ? (
            <div className="loading"><div className="spinner" /> Carregando...</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><IconEmptyBox /></div>
              <p>Nenhum registro encontrado</p>
            </div>
          ) : tab === 'alunos-ativos' ? (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Aluno</th><th>Email</th><th>Plano</th>
                  <th>Mensalidade</th><th>Início</th><th>Fim</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id_aluno}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_aluno}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome_aluno}</td>
                    <td>{r.email}</td>
                    <td>{r.plano}</td>
                    <td style={{ fontWeight: 600, color: 'var(--purple-700)' }}>{formatCurrency(r.valor_mensal)}</td>
                    <td>{formatDate(r.data_inicio)}</td>
                    <td>{formatDate(r.data_fim)}</td>
                    <td><span className="badge badge-green">{r.status_matricula}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'inadimplentes' ? (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Aluno</th><th>Telefone</th><th>Valor</th>
                  <th>Vencimento</th><th>Forma</th><th>Dias em atraso</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id_pagamento}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_pagamento}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome_aluno}</td>
                    <td>{r.telefone}</td>
                    <td style={{ fontWeight: 600, color: 'var(--purple-700)' }}>{formatCurrency(r.valor)}</td>
                    <td>{formatDate(r.data_vencimento)}</td>
                    <td>{r.forma_pagamento}</td>
                    <td><span className="badge badge-red">{r.dias_atraso} dia(s)</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ano</th><th>Mês</th><th>Total de pagamentos</th><th>Total arrecadado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.ano}</td>
                    <td>{MESES[r.mes]}</td>
                    <td>{r.total_pagamentos}</td>
                    <td style={{ fontWeight: 600, color: 'var(--purple-700)' }}>{formatCurrency(r.total_arrecadado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
