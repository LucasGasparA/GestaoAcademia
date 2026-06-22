\echo '=================================================='
\echo 'PARTE 1 - VIEWS (leitura direta, sem alterar nada)'
\echo '=================================================='

\echo '--- vw_alunos_ativos ---'
SELECT * FROM vw_alunos_ativos;

\echo '--- vw_inadimplentes ---'
SELECT * FROM vw_inadimplentes;

\echo '--- vw_faturamento_mensal ---'
SELECT * FROM vw_faturamento_mensal;

\echo '=================================================='
\echo 'PARTE 2 - FUNCTIONS, PROCEDURE E TRIGGERS'
\echo '(roda dentro de uma transacao que sera revertida no final,'
\echo ' nao deixa nenhum dado de teste no banco)'
\echo '=================================================='

BEGIN;

DO $$
DECLARE
  v_aluno        INT;
  v_plano        INT;
  v_instrutor    INT;
  v_matricula    INT;
  v_avaliacao    INT;
  v_imc          NUMERIC;
  v_pagamento    INT;
  v_status       VARCHAR;
  v_total_antes  NUMERIC;
  v_total_depois NUMERIC;
  v_pendentes    INT;
BEGIN
  SELECT id_aluno INTO v_aluno FROM aluno ORDER BY id_aluno LIMIT 1;
  SELECT id_plano INTO v_plano FROM plano ORDER BY id_plano LIMIT 1;
  SELECT id_instrutor INTO v_instrutor FROM instrutor ORDER BY id_instrutor LIMIT 1;
  RAISE NOTICE '>> Base de teste: aluno #%, plano #%, instrutor #%', v_aluno, v_plano, v_instrutor;

  -- matricula de apoio, valida
  INSERT INTO matricula (id_aluno, id_plano, data_inicio, data_fim, status)
  VALUES (v_aluno, v_plano, CURRENT_DATE, CURRENT_DATE + 30, 'ativa')
  RETURNING id_matricula INTO v_matricula;
  RAISE NOTICE '>> Matricula de teste criada: #%', v_matricula;

  ----------------------------------------------------------------
  RAISE NOTICE '--- TESTE 1: trigger trg_valida_matricula (deve BLOQUEAR data_fim <= data_inicio) ---';
  BEGIN
    INSERT INTO matricula (id_aluno, id_plano, data_inicio, data_fim, status)
    VALUES (v_aluno, v_plano, CURRENT_DATE, CURRENT_DATE - 1, 'ativa');
    RAISE NOTICE 'RESULTADO: FALHOU - o insert invalido NAO foi bloqueado';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RESULTADO: OK - bloqueado como esperado -> %', SQLERRM;
  END;

  ----------------------------------------------------------------
  RAISE NOTICE '--- TESTE 2: trigger trg_status_pagamento (vencimento no passado deve virar "vencido" sozinho) ---';
  INSERT INTO pagamento (id_matricula, valor, data_vencimento, forma_pagamento, status)
  VALUES (v_matricula, 50.00, CURRENT_DATE - 10, 'PIX', 'pendente')
  RETURNING id_pagamento, status INTO v_pagamento, v_status;
  IF v_status = 'vencido' THEN
    RAISE NOTICE 'RESULTADO: OK - pagamento #% virou "vencido" automaticamente', v_pagamento;
  ELSE
    RAISE NOTICE 'RESULTADO: FALHOU - status ficou "%" (esperado "vencido")', v_status;
  END IF;

  ----------------------------------------------------------------
  RAISE NOTICE '--- TESTE 3: procedure pr_registrar_pagamento ---';
  CALL pr_registrar_pagamento(v_matricula, 99.90, CURRENT_DATE + 15, 'Boleto');
  SELECT id_pagamento, status INTO v_pagamento, v_status
    FROM pagamento WHERE id_matricula = v_matricula AND valor = 99.90;
  RAISE NOTICE 'RESULTADO: OK - pagamento #% criado via procedure com status "%"', v_pagamento, v_status;

  ----------------------------------------------------------------
  RAISE NOTICE '--- TESTE 4: function fn_calcular_imc (caso valido) ---';
  INSERT INTO avaliacao_fisica (id_aluno, id_instrutor, data_avaliacao, peso, altura, percentual_gordura)
  VALUES (v_aluno, v_instrutor, CURRENT_DATE, 70.0, 1.75, 20.0)
  RETURNING id_avaliacao INTO v_avaliacao;
  v_imc := fn_calcular_imc(v_avaliacao);
  RAISE NOTICE 'RESULTADO: OK - IMC calculado = % (peso 70 / altura 1.75^2, esperado 22.86)', v_imc;

  ----------------------------------------------------------------
  RAISE NOTICE '--- TESTE 5: function fn_calcular_imc (id inexistente, deve lancar excecao) ---';
  BEGIN
    PERFORM fn_calcular_imc(999999);
    RAISE NOTICE 'RESULTADO: FALHOU - deveria ter lancado excecao';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RESULTADO: OK - excecao esperada -> %', SQLERRM;
  END;

  ----------------------------------------------------------------
  RAISE NOTICE '--- TESTE 6: function fn_total_pago_aluno (antes/depois de marcar pagamento como pago) ---';
  v_total_antes := fn_total_pago_aluno(v_aluno);
  UPDATE pagamento SET status = 'pago', data_pagamento = CURRENT_DATE WHERE id_pagamento = v_pagamento;
  v_total_depois := fn_total_pago_aluno(v_aluno);
  RAISE NOTICE 'RESULTADO: total antes = %, depois = %, diferenca = % (esperado 99.90)',
    v_total_antes, v_total_depois, (v_total_depois - v_total_antes);

  ----------------------------------------------------------------
  RAISE NOTICE '--- TESTE 7: trigger trg_cancela_pagamentos (cancelar matricula cancela pagamentos pendentes) ---';
  UPDATE matricula SET status = 'cancelada' WHERE id_matricula = v_matricula;
  SELECT COUNT(*) INTO v_pendentes FROM pagamento WHERE id_matricula = v_matricula AND status = 'pendente';
  IF v_pendentes = 0 THEN
    RAISE NOTICE 'RESULTADO: OK - nenhum pagamento pendente restante apos cancelar a matricula';
  ELSE
    RAISE NOTICE 'RESULTADO: FALHOU - ainda restam % pagamento(s) pendente(s)', v_pendentes;
  END IF;

END $$;

\echo '--- Revertendo transacao de teste (nenhum dado de teste fica salvo) ---'
ROLLBACK;
