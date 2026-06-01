const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plano ORDER BY id_plano'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/select', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_plano, nome FROM plano WHERE ativo = true ORDER BY nome'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plano WHERE id_plano = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plano não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nome, descricao, valor_mensal, duracao_meses, ativo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO plano (nome, descricao, valor_mensal, duracao_meses, ativo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nome, descricao, valor_mensal, duracao_meses, ativo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, descricao, valor_mensal, duracao_meses, ativo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE plano SET nome=$1, descricao=$2, valor_mensal=$3, duracao_meses=$4, ativo=$5 WHERE id_plano=$6 RETURNING *',
      [nome, descricao, valor_mensal, duracao_meses, ativo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plano não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM plano WHERE id_plano=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plano não encontrado' });
    res.json({ message: 'Plano excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
