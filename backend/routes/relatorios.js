const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/alunos-ativos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_alunos_ativos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/inadimplentes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_inadimplentes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/faturamento-mensal', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_faturamento_mensal');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/total-pago/:id_aluno', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT fn_total_pago_aluno($1) AS total_pago',
      [req.params.id_aluno]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
