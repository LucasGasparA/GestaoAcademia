-- Dados de exemplo para demonstração/apresentação (CRUD já populado)
-- Executa por último (ordem alfabética dos scripts de init do Postgres)

INSERT INTO plano (nome, descricao, valor_mensal, duracao_meses, ativo) VALUES
('Mensal',               'Acesso completo à academia por 1 mês',                 99.90, 1,  TRUE),
('Trimestral',           'Acesso completo à academia por 3 meses, com desconto', 89.90, 3,  TRUE),
('Anual',                'Acesso completo à academia por 12 meses, maior desconto', 79.90, 12, TRUE),
('Mensal Promocional',   'Plano antigo, fora de catálogo',                       69.90, 1,  FALSE);

INSERT INTO aluno (nome, cpf, email, telefone, data_nascimento, data_cadastro, status) VALUES
('Mariana Souza Lima',      '12345678901', 'mariana.lima@email.com',     '(47) 99123-4567', '1996-03-14', CURRENT_DATE - 200, 'ativo'),
('Pedro Henrique Alves',    '23456789012', 'pedro.alves@email.com',      '(47) 99234-5678', '1990-07-22', CURRENT_DATE - 150, 'ativo'),
('Camila Rodrigues Santos', '34567890123', 'camila.santos@email.com',    '(47) 99345-6789', '1998-11-02', CURRENT_DATE - 120, 'ativo'),
('Lucas Eduardo Ferreira',  '45678901234', 'lucas.ferreira@email.com',   '(47) 99456-7890', '1985-01-30', CURRENT_DATE - 90,  'suspenso'),
('Juliana Costa Pereira',   '56789012345', 'juliana.pereira@email.com',  '(47) 99567-8901', '2000-05-18', CURRENT_DATE - 60,  'ativo'),
('Rafael Oliveira Martins', '67890123456', 'rafael.martins@email.com',   '(47) 99678-9012', '1993-09-09', CURRENT_DATE - 30,  'inativo');

INSERT INTO instrutor (nome, cpf, especialidade, email, telefone, data_admissao) VALUES
('Fernanda Albuquerque Dias', '78901234567', 'Musculação', 'fernanda.dias@nextfit.com',   '(47) 99001-1111', CURRENT_DATE - 800),
('Bruno Cesar Tavares',       '89012345678', 'Crossfit',   'bruno.tavares@nextfit.com',   '(47) 99002-2222', CURRENT_DATE - 500),
('Patrícia Nunes Castro',     '90123456789', 'Funcional',  'patricia.castro@nextfit.com', '(47) 99003-3333', CURRENT_DATE - 300);

INSERT INTO matricula (id_aluno, id_plano, data_inicio, data_fim, status)
SELECT a.id_aluno, p.id_plano, v.data_inicio, v.data_fim, v.status
FROM (VALUES
    ('12345678901', 'Anual',       (CURRENT_DATE - 180)::date, (CURRENT_DATE + 185)::date, 'ativa'),
    ('23456789012', 'Mensal',      (CURRENT_DATE - 20)::date,  (CURRENT_DATE + 10)::date,  'ativa'),
    ('34567890123', 'Trimestral',  (CURRENT_DATE - 60)::date,  (CURRENT_DATE + 30)::date,  'ativa'),
    ('45678901234', 'Mensal',      (CURRENT_DATE - 90)::date,  (CURRENT_DATE - 60)::date,  'cancelada'),
    ('56789012345', 'Trimestral',  (CURRENT_DATE - 45)::date,  (CURRENT_DATE + 45)::date,  'ativa'),
    ('67890123456', 'Mensal',      (CURRENT_DATE - 100)::date, (CURRENT_DATE - 70)::date,  'encerrada')
) AS v(cpf, plano_nome, data_inicio, data_fim, status)
JOIN aluno a ON a.cpf = v.cpf
JOIN plano p ON p.nome = v.plano_nome;

INSERT INTO pagamento (id_matricula, valor, data_vencimento, data_pagamento, forma_pagamento, status)
SELECT m.id_matricula, v.valor, v.data_vencimento, v.data_pagamento, v.forma_pagamento, v.status
FROM (VALUES
    ('12345678901', 79.90::numeric, (CURRENT_DATE - 150)::date, (CURRENT_DATE - 149)::date, 'PIX',                 'pago'),
    ('12345678901', 79.90::numeric, (CURRENT_DATE - 120)::date, (CURRENT_DATE - 119)::date, 'PIX',                 'pago'),
    ('12345678901', 79.90::numeric, (CURRENT_DATE + 10)::date,  NULL,                       'PIX',                 'pendente'),
    ('23456789012', 99.90::numeric, (CURRENT_DATE - 20)::date,  (CURRENT_DATE - 19)::date,  'Cartão de Crédito',   'pago'),
    ('23456789012', 99.90::numeric, (CURRENT_DATE + 10)::date,  NULL,                       'Cartão de Crédito',   'pendente'),
    ('34567890123', 89.90::numeric, (CURRENT_DATE - 60)::date,  (CURRENT_DATE - 58)::date,  'Boleto',              'pago'),
    ('34567890123', 89.90::numeric, (CURRENT_DATE - 5)::date,   NULL,                       'Boleto',              'pendente'),
    ('45678901234', 99.90::numeric, (CURRENT_DATE - 90)::date,  (CURRENT_DATE - 89)::date,  'Dinheiro',            'pago'),
    ('45678901234', 99.90::numeric, (CURRENT_DATE - 60)::date,  NULL,                       'Dinheiro',            'pendente'),
    ('56789012345', 89.90::numeric, (CURRENT_DATE - 45)::date,  (CURRENT_DATE - 44)::date,  'PIX',                 'pago'),
    ('56789012345', 89.90::numeric, (CURRENT_DATE + 15)::date,  NULL,                       'PIX',                 'pendente'),
    ('67890123456', 99.90::numeric, (CURRENT_DATE - 100)::date, (CURRENT_DATE - 99)::date,  'Transferência',       'pago')
) AS v(cpf, valor, data_vencimento, data_pagamento, forma_pagamento, status)
JOIN aluno     a ON a.cpf = v.cpf
JOIN matricula m ON m.id_aluno = a.id_aluno;

INSERT INTO avaliacao_fisica (id_aluno, id_instrutor, data_avaliacao, peso, altura, percentual_gordura, observacoes)
SELECT a.id_aluno, i.id_instrutor, v.data_avaliacao, v.peso, v.altura, v.percentual_gordura, v.observacoes
FROM (VALUES
    ('12345678901', '78901234567', (CURRENT_DATE - 170)::date, 68.50::numeric, 1.65::numeric, 22.30::numeric, 'Avaliação inicial, boa evolução esperada.'),
    ('12345678901', '78901234567', (CURRENT_DATE - 80)::date,  65.20::numeric, 1.65::numeric, 19.80::numeric, 'Reavaliação trimestral, redução de gordura corporal.'),
    ('23456789012', '89012345678', (CURRENT_DATE - 15)::date,  82.00::numeric, 1.78::numeric, 18.50::numeric, 'Foco em ganho de massa muscular.'),
    ('34567890123', '90123456789', (CURRENT_DATE - 55)::date,  58.30::numeric, 1.60::numeric, 24.10::numeric, 'Avaliação de início de programa funcional.'),
    ('56789012345', '89012345678', (CURRENT_DATE - 40)::date,  71.40::numeric, 1.70::numeric, 21.00::numeric, 'Boa adaptação ao treino.')
) AS v(cpf_aluno, cpf_instrutor, data_avaliacao, peso, altura, percentual_gordura, observacoes)
JOIN aluno     a ON a.cpf = v.cpf_aluno
JOIN instrutor i ON i.cpf = v.cpf_instrutor;
