const express = require('express');
const router = express.Router();
const { getLogs } = require('../activityLog');

router.get('/', (req, res) => {
  const limit = Number(req.query.limit) || 30;
  res.json(getLogs(limit));
});

module.exports = router;
