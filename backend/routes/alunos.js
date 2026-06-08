const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM aluno ORDER BY id_aluno'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/select', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_aluno, nome FROM aluno WHERE status = \'ativo\' ORDER BY nome'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM aluno WHERE id_aluno = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nome, cpf, email, telefone, data_nascimento, data_cadastro, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO aluno (nome, cpf, email, telefone, data_nascimento, data_cadastro, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nome, cpf, email, telefone, data_nascimento, data_cadastro || new Date(), status || 'ativo']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, cpf, email, telefone, data_nascimento, data_cadastro, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE aluno SET nome=$1, cpf=$2, email=$3, telefone=$4, data_nascimento=$5, data_cadastro=$6, status=$7
       WHERE id_aluno=$8 RETURNING *`,
      [nome, cpf, email, telefone, data_nascimento, data_cadastro, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM aluno WHERE id_aluno=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json({ message: 'Aluno excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
