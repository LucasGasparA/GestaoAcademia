import { useEffect, useState } from 'react';
import api from '../api/api';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = {
  nome: '', cpf: '', especialidade: '', email: '', telefone: '', data_admissao: '',
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
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function validate(form) {
  const errs = {};
  if (!form.nome.trim()) errs.nome = 'Nome é obrigatório';
  if (!form.cpf || form.cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF deve ter 11 dígitos';
  if (!form.especialidade.trim()) errs.especialidade = 'Especialidade é obrigatória';
  if (!form.email.trim()) errs.email = 'E-mail é obrigatório';
  if (!form.data_admissao) errs.data_admissao = 'Data de admissão é obrigatória';
  return errs;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function Instrutores() {
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
    api.get('/instrutores').then(r => setRows(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.nome?.toLowerCase().includes(search.toLowerCase()) ||
    r.especialidade?.toLowerCase().includes(search.toLowerCase()) ||
    r.cpf?.includes(search)
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY, data_admissao: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      nome: row.nome || '',
      cpf: row.cpf || '',
      especialidade: row.especialidade || '',
      email: row.email || '',
      telefone: row.telefone || '',
      data_admissao: row.data_admissao ? row.data_admissao.split('T')[0] : '',
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
        await api.put(`/instrutores/${editing.id_instrutor}`, payload);
      } else {
        await api.post('/instrutores', payload);
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
      await api.delete(`/instrutores/${id}`);
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
          <h2>Instrutores</h2>
          <p>Gerencie a equipe de instrutores da academia</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Instrutor</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Buscar por nome, especialidade ou CPF..."
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
              <div className="empty-icon">🏋️</div>
              <p>Nenhum instrutor encontrado</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Especialidade</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Admissão</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id_instrutor}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_instrutor}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome}</td>
                    <td>{r.cpf}</td>
                    <td><span className="badge badge-purple">{r.especialidade}</span></td>
                    <td>{r.email}</td>
                    <td>{r.telefone || '-'}</td>
                    <td>{formatDate(r.data_admissao)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️ Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(r.id_instrutor)}>🗑️</button>
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
              <h3>{editing ? 'Editar Instrutor' : 'Novo Instrutor'}</h3>
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
                    <label>Especialidade <span className="required">*</span></label>
                    <input name="especialidade" value={form.especialidade} onChange={handleChange} placeholder="Ex: Musculação, CrossFit, Natação..." className={errors.especialidade ? 'error' : ''} />
                    {errors.especialidade && <span className="error-msg">{errors.especialidade}</span>}
                  </div>
                  <div className="form-group col-span-2">
                    <label>E-mail <span className="required">*</span></label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data de Admissão <span className="required">*</span></label>
                    <input name="data_admissao" type="date" value={form.data_admissao} onChange={handleChange} className={errors.data_admissao ? 'error' : ''} />
                    {errors.data_admissao && <span className="error-msg">{errors.data_admissao}</span>}
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
          message="Tem certeza que deseja excluir este instrutor?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
