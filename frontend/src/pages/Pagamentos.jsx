import { useEffect, useState } from 'react';
import api from '../api/api';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = {
  id_matricula: '', valor: '', data_vencimento: '',
  data_pagamento: '', forma_pagamento: '', status: 'pendente',
};
const PER_PAGE = 10;

const FORMAS = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto', 'Transferência'];

function validate(form) {
  const errs = {};
  if (!form.id_matricula) errs.id_matricula = 'Selecione uma matrícula';
  if (!form.valor || Number(form.valor) <= 0) errs.valor = 'Valor deve ser maior que zero';
  if (!form.data_vencimento) errs.data_vencimento = 'Data de vencimento é obrigatória';
  if (!form.forma_pagamento) errs.forma_pagamento = 'Forma de pagamento é obrigatória';
  return errs;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatCurrency(v) {
  if (v == null) return '-';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const statusBadge = {
  pago: 'badge-green',
  pendente: 'badge-yellow',
  atrasado: 'badge-red',
  cancelado: 'badge-gray',
};

export default function Pagamentos() {
  const [rows, setRows] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/pagamentos'),
      api.get('/matriculas/select'),
    ]).then(([p, m]) => {
      setRows(p.data);
      setMatriculas(m.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.nome_aluno?.toLowerCase().includes(search.toLowerCase()) ||
    r.nome_plano?.toLowerCase().includes(search.toLowerCase()) ||
    r.forma_pagamento?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY, data_vencimento: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      id_matricula: row.id_matricula || '',
      valor: row.valor || '',
      data_vencimento: row.data_vencimento ? row.data_vencimento.split('T')[0] : '',
      data_pagamento: row.data_pagamento ? row.data_pagamento.split('T')[0] : '',
      forma_pagamento: row.forma_pagamento || '',
      status: row.status || 'pendente',
    });
    setErrors({});
    setModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, valor: Number(form.valor) };
      if (editing) {
        await api.put(`/pagamentos/${editing.id_pagamento}`, payload);
      } else {
        await api.post('/pagamentos', payload);
      }
      setModal(false);
      load();
    } catch (err) {
      setErrors({ _global: err.response?.data?.error || 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/pagamentos/${id}`);
      setConfirmId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Pagamentos</h2>
          <p>Controle os pagamentos das matrículas</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Pagamento</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Buscar por aluno, plano ou forma de pagamento..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>{filtered.length} registro(s)</span>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading"><div className="spinner" /> Carregando...</div>
          ) : paginated.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <p>Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Aluno</th>
                  <th>Plano</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Forma</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id_pagamento}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_pagamento}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome_aluno}</td>
                    <td>{r.nome_plano}</td>
                    <td style={{ fontWeight: 600, color: 'var(--purple-700)' }}>{formatCurrency(r.valor)}</td>
                    <td>{formatDate(r.data_vencimento)}</td>
                    <td>{formatDate(r.data_pagamento)}</td>
                    <td>{r.forma_pagamento}</td>
                    <td>
                      <span className={`badge ${statusBadge[r.status] || 'badge-gray'}`}>{r.status}</span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️ Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(r.id_pagamento)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onPageChange={setPage} />
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Editar Pagamento' : 'Novo Pagamento'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {errors._global && <div className="alert alert-error">{errors._global}</div>}
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Matrícula (Aluno — Plano) <span className="required">*</span></label>
                    <select name="id_matricula" value={form.id_matricula} onChange={handleChange} className={errors.id_matricula ? 'error' : ''}>
                      <option value="">— Selecione uma matrícula —</option>
                      {matriculas.map(m => (
                        <option key={m.id_matricula} value={m.id_matricula}>
                          {m.nome_aluno} — {m.nome_plano}
                        </option>
                      ))}
                    </select>
                    {errors.id_matricula && <span className="error-msg">{errors.id_matricula}</span>}
                  </div>
                  <div className="form-group">
                    <label>Valor (R$) <span className="required">*</span></label>
                    <input name="valor" type="number" min="0.01" step="0.01" value={form.valor} onChange={handleChange} className={errors.valor ? 'error' : ''} />
                    {errors.valor && <span className="error-msg">{errors.valor}</span>}
                  </div>
                  <div className="form-group">
                    <label>Forma de Pagamento <span className="required">*</span></label>
                    <select name="forma_pagamento" value={form.forma_pagamento} onChange={handleChange} className={errors.forma_pagamento ? 'error' : ''}>
                      <option value="">— Selecione —</option>
                      {FORMAS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {errors.forma_pagamento && <span className="error-msg">{errors.forma_pagamento}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data de Vencimento <span className="required">*</span></label>
                    <input name="data_vencimento" type="date" value={form.data_vencimento} onChange={handleChange} className={errors.data_vencimento ? 'error' : ''} />
                    {errors.data_vencimento && <span className="error-msg">{errors.data_vencimento}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data de Pagamento</label>
                    <input name="data_pagamento" type="date" value={form.data_pagamento} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                      <option value="atrasado">Atrasado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmId && (
        <ConfirmDialog
          message="Tem certeza que deseja excluir este pagamento?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
