import { useEffect, useState } from 'react';
import api from '../api/api';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = {
  id_aluno: '', id_plano: '', data_inicio: '', data_fim: '', status: 'ativa',
};
const PER_PAGE = 10;

function validate(form) {
  const errs = {};
  if (!form.id_aluno) errs.id_aluno = 'Selecione um aluno';
  if (!form.id_plano) errs.id_plano = 'Selecione um plano';
  if (!form.data_inicio) errs.data_inicio = 'Data de início é obrigatória';
  if (!form.data_fim) errs.data_fim = 'Data de fim é obrigatória';
  return errs;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const statusBadge = {
  ativa: 'badge-green',
  cancelada: 'badge-red',
  expirada: 'badge-gray',
};

export default function Matriculas() {
  const [rows, setRows] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [planos, setPlanos] = useState([]);
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
      api.get('/matriculas'),
      api.get('/alunos/select'),
      api.get('/planos/select'),
    ]).then(([m, a, p]) => {
      setRows(m.data);
      setAlunos(a.data);
      setPlanos(p.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.nome_aluno?.toLowerCase().includes(search.toLowerCase()) ||
    r.nome_plano?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY, data_inicio: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      id_aluno: row.id_aluno || '',
      id_plano: row.id_plano || '',
      data_inicio: row.data_inicio ? row.data_inicio.split('T')[0] : '',
      data_fim: row.data_fim ? row.data_fim.split('T')[0] : '',
      status: row.status || 'ativa',
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
      if (editing) {
        await api.put(`/matriculas/${editing.id_matricula}`, form);
      } else {
        await api.post('/matriculas', form);
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
      await api.delete(`/matriculas/${id}`);
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
          <h2>Matrículas</h2>
          <p>Gerencie as matrículas de alunos nos planos</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nova Matrícula</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Buscar por aluno ou plano..."
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
              <div className="empty-icon">📝</div>
              <p>Nenhuma matrícula encontrada</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Aluno</th>
                  <th>Plano</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id_matricula}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_matricula}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome_aluno}</td>
                    <td>{r.nome_plano}</td>
                    <td>{formatDate(r.data_inicio)}</td>
                    <td>{formatDate(r.data_fim)}</td>
                    <td>
                      <span className={`badge ${statusBadge[r.status] || 'badge-gray'}`}>{r.status}</span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️ Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(r.id_matricula)}>🗑️</button>
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
              <h3>{editing ? 'Editar Matrícula' : 'Nova Matrícula'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {errors._global && <div className="alert alert-error">{errors._global}</div>}
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Aluno <span className="required">*</span></label>
                    <select name="id_aluno" value={form.id_aluno} onChange={handleChange} className={errors.id_aluno ? 'error' : ''}>
                      <option value="">— Selecione um aluno —</option>
                      {alunos.map(a => (
                        <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>
                      ))}
                    </select>
                    {errors.id_aluno && <span className="error-msg">{errors.id_aluno}</span>}
                  </div>
                  <div className="form-group col-span-2">
                    <label>Plano <span className="required">*</span></label>
                    <select name="id_plano" value={form.id_plano} onChange={handleChange} className={errors.id_plano ? 'error' : ''}>
                      <option value="">— Selecione um plano —</option>
                      {planos.map(p => (
                        <option key={p.id_plano} value={p.id_plano}>{p.nome}</option>
                      ))}
                    </select>
                    {errors.id_plano && <span className="error-msg">{errors.id_plano}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data de Início <span className="required">*</span></label>
                    <input name="data_inicio" type="date" value={form.data_inicio} onChange={handleChange} className={errors.data_inicio ? 'error' : ''} />
                    {errors.data_inicio && <span className="error-msg">{errors.data_inicio}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data de Fim <span className="required">*</span></label>
                    <input name="data_fim" type="date" value={form.data_fim} onChange={handleChange} className={errors.data_fim ? 'error' : ''} />
                    {errors.data_fim && <span className="error-msg">{errors.data_fim}</span>}
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="ativa">Ativa</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="expirada">Expirada</option>
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
          message="Tem certeza que deseja excluir esta matrícula?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
