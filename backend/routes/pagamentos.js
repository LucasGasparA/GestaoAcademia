const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pg.*, a.nome AS nome_aluno, p.nome AS nome_plano
       FROM pagamento pg
       JOIN matricula m ON pg.id_matricula = m.id_matricula
       JOIN aluno a ON m.id_aluno = a.id_aluno
       JOIN plano p ON m.id_plano = p.id_plano
       ORDER BY pg.id_pagamento`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pg.*, a.nome AS nome_aluno, p.nome AS nome_plano
       FROM pagamento pg
       JOIN matricula m ON pg.id_matricula = m.id_matricula
       JOIN aluno a ON m.id_aluno = a.id_aluno
       JOIN plano p ON m.id_plano = p.id_plano
       WHERE pg.id_pagamento = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id_matricula, valor, data_vencimento, data_pagamento, forma_pagamento, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pagamento (id_matricula, valor, data_vencimento, data_pagamento, forma_pagamento, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id_matricula, valor, data_vencimento, data_pagamento || null, forma_pagamento, status || 'pendente']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id_matricula, valor, data_vencimento, data_pagamento, forma_pagamento, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE pagamento SET id_matricula=$1, valor=$2, data_vencimento=$3, data_pagamento=$4, forma_pagamento=$5, status=$6
       WHERE id_pagamento=$7 RETURNING *`,
      [id_matricula, valor, data_vencimento, data_pagamento || null, forma_pagamento, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM pagamento WHERE id_pagamento=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json({ message: 'Pagamento excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
