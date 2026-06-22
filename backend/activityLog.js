const MAX_LOGS = 200;
const logs = [];
let nextId = 1;

function addLog(entidade, operacao, descricao) {
  logs.unshift({
    id: nextId++,
    entidade,
    operacao,
    descricao,
    criado_em: new Date().toISOString(),
  });
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
}

function getLogs(limit = 30) {
  return logs.slice(0, limit);
}

module.exports = { addLog, getLogs };
