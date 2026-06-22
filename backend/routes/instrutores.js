const express = require('express');
const router = express.Router();
const pool = require('../db');
const { addLog } = require('../activityLog');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM instrutor ORDER BY id_instrutor'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/select', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_instrutor, nome FROM instrutor ORDER BY nome'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM instrutor WHERE id_instrutor = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Instrutor não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nome, cpf, especialidade, email, telefone, data_admissao } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO instrutor (nome, cpf, especialidade, email, telefone, data_admissao)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nome, cpf, especialidade, email, telefone, data_admissao]
    );
    addLog('instrutor', 'CREATE', `Instrutor criado: ${result.rows[0].nome} (#${result.rows[0].id_instrutor})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, cpf, especialidade, email, telefone, data_admissao } = req.body;
  try {
    const result = await pool.query(
      `UPDATE instrutor SET nome=$1, cpf=$2, especialidade=$3, email=$4, telefone=$5, data_admissao=$6
       WHERE id_instrutor=$7 RETURNING *`,
      [nome, cpf, especialidade, email, telefone, data_admissao, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Instrutor não encontrado' });
    addLog('instrutor', 'UPDATE', `Instrutor atualizado: ${result.rows[0].nome} (#${result.rows[0].id_instrutor})`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM instrutor WHERE id_instrutor=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Instrutor não encontrado' });
    addLog('instrutor', 'DELETE', `Instrutor excluído: ${result.rows[0].nome} (#${result.rows[0].id_instrutor})`);
    res.json({ message: 'Instrutor excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
