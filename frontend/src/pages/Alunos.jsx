import { useEffect, useState } from 'react';
import api from '../api/api';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = {
  nome: '', cpf: '', email: '', telefone: '',
  data_nascimento: '', data_cadastro: '', status: 'ativo',
};
const PER_PAGE = 10;

function maskCpf(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function validate(form) {
  const errs = {};
  if (!form.nome.trim()) errs.nome = 'Nome é obrigatório';
  if (!form.cpf || form.cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF deve ter 11 dígitos';
  if (!form.email.trim()) errs.email = 'E-mail é obrigatório';
  if (!form.data_nascimento) errs.data_nascimento = 'Data de nascimento é obrigatória';
  return errs;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function Alunos() {
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
    api.get('/alunos').then(r => setRows(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.nome?.toLowerCase().includes(search.toLowerCase()) ||
    r.cpf?.includes(search) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY, data_cadastro: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      nome: row.nome || '',
      cpf: row.cpf || '',
      email: row.email || '',
      telefone: row.telefone || '',
      data_nascimento: row.data_nascimento ? row.data_nascimento.split('T')[0] : '',
      data_cadastro: row.data_cadastro ? row.data_cadastro.split('T')[0] : '',
      status: row.status || 'ativo',
    });
    setErrors({});
    setModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cpf') v = maskCpf(value);
    if (name === 'telefone') v = maskPhone(value);
    setForm(f => ({ ...f, [name]: v }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const payload = { ...form, cpf: form.cpf.replace(/\D/g, '') };
    try {
      if (editing) {
        await api.put(`/alunos/${editing.id_aluno}`, payload);
      } else {
        await api.post('/alunos', payload);
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
      await api.delete(`/alunos/${id}`);
      setConfirmId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir');
    }
  }

  const statusBadge = {
    ativo: 'badge-green', inativo: 'badge-gray', suspenso: 'badge-yellow',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Alunos</h2>
          <p>Gerencie os alunos cadastrados na academia</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Aluno</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Buscar por nome, CPF ou e-mail..."
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
              <div className="empty-icon">👤</div>
              <p>Nenhum aluno encontrado</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Nascimento</th>
                  <th>Cadastro</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id_aluno}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_aluno}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome}</td>
                    <td>{r.cpf}</td>
                    <td>{r.email}</td>
                    <td>{r.telefone || '-'}</td>
                    <td>{formatDate(r.data_nascimento)}</td>
                    <td>{formatDate(r.data_cadastro)}</td>
                    <td>
                      <span className={`badge ${statusBadge[r.status] || 'badge-gray'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️ Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(r.id_aluno)}>🗑️</button>
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
              <h3>{editing ? 'Editar Aluno' : 'Novo Aluno'}</h3>
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
                  <div className="form-group">
                    <label>CPF <span className="required">*</span></label>
                    <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" className={errors.cpf ? 'error' : ''} />
                    {errors.cpf && <span className="error-msg">{errors.cpf}</span>}
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>E-mail <span className="required">*</span></label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data de Nascimento <span className="required">*</span></label>
                    <input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} className={errors.data_nascimento ? 'error' : ''} />
                    {errors.data_nascimento && <span className="error-msg">{errors.data_nascimento}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data de Cadastro</label>
                    <input name="data_cadastro" type="date" value={form.data_cadastro} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="suspenso">Suspenso</option>
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
          message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
