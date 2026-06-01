const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, a.nome AS nome_aluno, p.nome AS nome_plano
       FROM matricula m
       JOIN aluno a ON m.id_aluno = a.id_aluno
       JOIN plano p ON m.id_plano = p.id_plano
       ORDER BY m.id_matricula`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/select', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id_matricula, a.nome AS nome_aluno, p.nome AS nome_plano
       FROM matricula m
       JOIN aluno a ON m.id_aluno = a.id_aluno
       JOIN plano p ON m.id_plano = p.id_plano
       WHERE m.status = 'ativa'
       ORDER BY a.nome`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, a.nome AS nome_aluno, p.nome AS nome_plano
       FROM matricula m
       JOIN aluno a ON m.id_aluno = a.id_aluno
       JOIN plano p ON m.id_plano = p.id_plano
       WHERE m.id_matricula = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Matrícula não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id_aluno, id_plano, data_inicio, data_fim, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO matricula (id_aluno, id_plano, data_inicio, data_fim, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_aluno, id_plano, data_inicio, data_fim, status || 'ativa']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id_aluno, id_plano, data_inicio, data_fim, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE matricula SET id_aluno=$1, id_plano=$2, data_inicio=$3, data_fim=$4, status=$5
       WHERE id_matricula=$6 RETURNING *`,
      [id_aluno, id_plano, data_inicio, data_fim, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Matrícula não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM matricula WHERE id_matricula=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Matrícula não encontrada' });
    res.json({ message: 'Matrícula excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
