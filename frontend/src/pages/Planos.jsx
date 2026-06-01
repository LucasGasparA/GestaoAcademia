import { useEffect, useState } from 'react';
import api from '../api/api';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = {
  nome: '', descricao: '', valor_mensal: '', duracao_meses: '', ativo: true,
};
const PER_PAGE = 10;

function validate(form) {
  const errs = {};
  if (!form.nome.trim()) errs.nome = 'Nome é obrigatório';
  if (!form.valor_mensal || Number(form.valor_mensal) <= 0) errs.valor_mensal = 'Valor deve ser maior que zero';
  if (!form.duracao_meses || Number(form.duracao_meses) <= 0) errs.duracao_meses = 'Duração deve ser maior que zero';
  return errs;
}

function formatCurrency(v) {
  if (v == null) return '-';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Planos() {
  const [rows, setRows] = useState([]);
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
    api.get('/planos').then(r => setRows(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.nome?.toLowerCase().includes(search.toLowerCase()) ||
    r.descricao?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      nome: row.nome || '',
      descricao: row.descricao || '',
      valor_mensal: row.valor_mensal || '',
      duracao_meses: row.duracao_meses || '',
      ativo: row.ativo ?? true,
    });
    setErrors({});
    setModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const v = type === 'checkbox' ? checked : value;
    setForm(f => ({ ...f, [name]: v }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, valor_mensal: Number(form.valor_mensal), duracao_meses: Number(form.duracao_meses) };
      if (editing) {
        await api.put(`/planos/${editing.id_plano}`, payload);
      } else {
        await api.post('/planos', payload);
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
      await api.delete(`/planos/${id}`);
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
          <h2>Planos</h2>
          <p>Gerencie os planos de assinatura oferecidos pela academia</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Plano</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Buscar por nome ou descrição..."
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
              <div className="empty-icon">📋</div>
              <p>Nenhum plano encontrado</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Valor Mensal</th>
                  <th>Duração</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id_plano}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_plano}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome}</td>
                    <td style={{ color: 'var(--gray-500)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.descricao || '-'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--purple-700)' }}>{formatCurrency(r.valor_mensal)}</td>
                    <td>{r.duracao_meses} {r.duracao_meses === 1 ? 'mês' : 'meses'}</td>
                    <td>
                      <span className={`badge ${r.ativo ? 'badge-green' : 'badge-gray'}`}>
                        {r.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️ Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(r.id_plano)}>🗑️</button>
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
              <h3>{editing ? 'Editar Plano' : 'Novo Plano'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {errors._global && <div className="alert alert-error">{errors._global}</div>}
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Nome <span className="required">*</span></label>
                    <input name="nome" value={form.nome} onChange={handleChange} className={errors.nome ? 'error' : ''} />
                    {errors.nome && <span className="error-msg">{errors.nome}</span>}
                  </div>
                  <div className="form-group col-span-2">
                    <label>Descrição</label>
                    <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Valor Mensal (R$) <span className="required">*</span></label>
                    <input name="valor_mensal" type="number" min="0.01" step="0.01" value={form.valor_mensal} onChange={handleChange} placeholder="0,00" className={errors.valor_mensal ? 'error' : ''} />
                    {errors.valor_mensal && <span className="error-msg">{errors.valor_mensal}</span>}
                  </div>
                  <div className="form-group">
                    <label>Duração (meses) <span className="required">*</span></label>
                    <input name="duracao_meses" type="number" min="1" step="1" value={form.duracao_meses} onChange={handleChange} className={errors.duracao_meses ? 'error' : ''} />
                    {errors.duracao_meses && <span className="error-msg">{errors.duracao_meses}</span>}
                  </div>
                  <div className="form-group">
                    <label>Plano ativo</label>
                    <div className="toggle-wrap" style={{ marginTop: 4 }}>
                      <label className="toggle">
                        <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} />
                        <span className="toggle-slider" />
                      </label>
                      <span className="toggle-label">{form.ativo ? 'Sim' : 'Não'}</span>
                    </div>
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
          message="Tem certeza que deseja excluir este plano?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
