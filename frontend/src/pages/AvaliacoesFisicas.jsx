import { useEffect, useState } from 'react';
import api from '../api/api';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = {
  id_aluno: '', id_instrutor: '', data_avaliacao: '',
  peso: '', altura: '', percentual_gordura: '', observacoes: '',
};
const PER_PAGE = 10;

function validate(form) {
  const errs = {};
  if (!form.id_aluno) errs.id_aluno = 'Selecione um aluno';
  if (!form.id_instrutor) errs.id_instrutor = 'Selecione um instrutor';
  if (!form.data_avaliacao) errs.data_avaliacao = 'Data da avaliação é obrigatória';
  if (!form.peso || Number(form.peso) <= 0) errs.peso = 'Peso deve ser maior que zero';
  if (!form.altura || Number(form.altura) <= 0) errs.altura = 'Altura deve ser maior que zero';
  if (form.percentual_gordura !== '' && form.percentual_gordura !== null) {
    if (Number(form.percentual_gordura) < 0) errs.percentual_gordura = 'Percentual não pode ser negativo';
  }
  return errs;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function imc(peso, altura) {
  if (!peso || !altura) return '-';
  const h = Number(altura);
  const p = Number(peso);
  if (h <= 0) return '-';
  const v = p / (h * h);
  return v.toFixed(1);
}

export default function AvaliacoesFisicas() {
  const [rows, setRows] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [instrutores, setInstrutores] = useState([]);
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
      api.get('/avaliacoes'),
      api.get('/alunos/select'),
      api.get('/instrutores/select'),
    ]).then(([av, al, in_]) => {
      setRows(av.data);
      setAlunos(al.data);
      setInstrutores(in_.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.nome_aluno?.toLowerCase().includes(search.toLowerCase()) ||
    r.nome_instrutor?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY, data_avaliacao: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      id_aluno: row.id_aluno || '',
      id_instrutor: row.id_instrutor || '',
      data_avaliacao: row.data_avaliacao ? row.data_avaliacao.split('T')[0] : '',
      peso: row.peso || '',
      altura: row.altura || '',
      percentual_gordura: row.percentual_gordura ?? '',
      observacoes: row.observacoes || '',
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
      const payload = {
        ...form,
        peso: Number(form.peso),
        altura: Number(form.altura),
        percentual_gordura: form.percentual_gordura !== '' ? Number(form.percentual_gordura) : null,
      };
      if (editing) {
        await api.put(`/avaliacoes/${editing.id_avaliacao}`, payload);
      } else {
        await api.post('/avaliacoes', payload);
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
      await api.delete(`/avaliacoes/${id}`);
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
          <h2>Avaliações Físicas</h2>
          <p>Registros de avaliações físicas dos alunos</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nova Avaliação</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Buscar por aluno ou instrutor..."
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
              <div className="empty-icon">📏</div>
              <p>Nenhuma avaliação encontrada</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Aluno</th>
                  <th>Instrutor</th>
                  <th>Data</th>
                  <th>Peso (kg)</th>
                  <th>Altura (m)</th>
                  <th>IMC</th>
                  <th>% Gordura</th>
                  <th>Observações</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id_avaliacao}>
                    <td style={{ color: 'var(--gray-400)' }}>{r.id_avaliacao}</td>
                    <td style={{ fontWeight: 500 }}>{r.nome_aluno}</td>
                    <td>{r.nome_instrutor}</td>
                    <td>{formatDate(r.data_avaliacao)}</td>
                    <td>{r.peso}</td>
                    <td>{r.altura}</td>
                    <td style={{ fontWeight: 600 }}>{imc(r.peso, r.altura)}</td>
                    <td>{r.percentual_gordura != null ? `${r.percentual_gordura}%` : '-'}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-500)' }}>
                      {r.observacoes || '-'}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️ Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(r.id_avaliacao)}>🗑️</button>
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
              <h3>{editing ? 'Editar Avaliação' : 'Nova Avaliação Física'}</h3>
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
                    <label>Instrutor <span className="required">*</span></label>
                    <select name="id_instrutor" value={form.id_instrutor} onChange={handleChange} className={errors.id_instrutor ? 'error' : ''}>
                      <option value="">— Selecione um instrutor —</option>
                      {instrutores.map(i => (
                        <option key={i.id_instrutor} value={i.id_instrutor}>{i.nome}</option>
                      ))}
                    </select>
                    {errors.id_instrutor && <span className="error-msg">{errors.id_instrutor}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data da Avaliação <span className="required">*</span></label>
                    <input name="data_avaliacao" type="date" value={form.data_avaliacao} onChange={handleChange} className={errors.data_avaliacao ? 'error' : ''} />
                    {errors.data_avaliacao && <span className="error-msg">{errors.data_avaliacao}</span>}
                  </div>
                  <div className="form-group">
                    <label>Peso (kg) <span className="required">*</span></label>
                    <input name="peso" type="number" min="0.1" step="0.1" value={form.peso} onChange={handleChange} placeholder="Ex: 75.5" className={errors.peso ? 'error' : ''} />
                    {errors.peso && <span className="error-msg">{errors.peso}</span>}
                  </div>
                  <div className="form-group">
                    <label>Altura (m) <span className="required">*</span></label>
                    <input name="altura" type="number" min="0.5" max="2.5" step="0.01" value={form.altura} onChange={handleChange} placeholder="Ex: 1.75" className={errors.altura ? 'error' : ''} />
                    {errors.altura && <span className="error-msg">{errors.altura}</span>}
                  </div>
                  <div className="form-group">
                    <label>% Gordura</label>
                    <input name="percentual_gordura" type="number" min="0" max="100" step="0.1" value={form.percentual_gordura} onChange={handleChange} placeholder="Ex: 18.5" className={errors.percentual_gordura ? 'error' : ''} />
                    {errors.percentual_gordura && <span className="error-msg">{errors.percentual_gordura}</span>}
                  </div>
                  <div className="form-group col-span-2">
                    <label>Observações</label>
                    <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3} placeholder="Observações gerais sobre a avaliação..." />
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
          message="Tem certeza que deseja excluir esta avaliação física?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
