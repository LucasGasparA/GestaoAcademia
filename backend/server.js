require('dotenv').config();
const express = require('express');
const cors = require('cors');

const planosRoutes = require('./routes/planos');
const alunosRoutes = require('./routes/alunos');
const instrutoresRoutes = require('./routes/instrutores');
const matriculasRoutes = require('./routes/matriculas');
const pagamentosRoutes = require('./routes/pagamentos');
const avaliacoesRoutes = require('./routes/avaliacoes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/planos', planosRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/instrutores', instrutoresRoutes);
app.use('/api/matriculas', matriculasRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
