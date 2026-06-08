const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT av.*, a.nome AS nome_aluno, i.nome AS nome_instrutor
       FROM avaliacao_fisica av
       JOIN aluno a ON av.id_aluno = a.id_aluno
       JOIN instrutor i ON av.id_instrutor = i.id_instrutor
       ORDER BY av.id_avaliacao`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT av.*, a.nome AS nome_aluno, i.nome AS nome_instrutor
       FROM avaliacao_fisica av
       JOIN aluno a ON av.id_aluno = a.id_aluno
       JOIN instrutor i ON av.id_instrutor = i.id_instrutor
       WHERE av.id_avaliacao = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Avaliação não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id_aluno, id_instrutor, data_avaliacao, peso, altura, percentual_gordura, observacoes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO avaliacao_fisica (id_aluno, id_instrutor, data_avaliacao, peso, altura, percentual_gordura, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id_aluno, id_instrutor, data_avaliacao, peso, altura, percentual_gordura || null, observacoes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id_aluno, id_instrutor, data_avaliacao, peso, altura, percentual_gordura, observacoes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE avaliacao_fisica SET id_aluno=$1, id_instrutor=$2, data_avaliacao=$3, peso=$4, altura=$5, percentual_gordura=$6, observacoes=$7
       WHERE id_avaliacao=$8 RETURNING *`,
      [id_aluno, id_instrutor, data_avaliacao, peso, altura, percentual_gordura || null, observacoes || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Avaliação não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM avaliacao_fisica WHERE id_avaliacao=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Avaliação não encontrada' });
    res.json({ message: 'Avaliação excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
