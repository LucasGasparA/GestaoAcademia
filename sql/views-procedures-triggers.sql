CREATE OR REPLACE VIEW vw_alunos_ativos AS
SELECT
    a.id_aluno,
    a.nome          AS nome_aluno,
    a.email,
    p.nome          AS plano,
    p.valor_mensal,
    m.data_inicio,
    m.data_fim,
    m.status        AS status_matricula
FROM aluno a
JOIN matricula m ON a.id_aluno  = m.id_aluno
JOIN plano     p ON m.id_plano  = p.id_plano
WHERE m.status = 'ativa'
ORDER BY a.nome;

CREATE OR REPLACE VIEW vw_inadimplentes AS
SELECT
    a.id_aluno,
    a.nome                              AS nome_aluno,
    a.email,
    a.telefone,
    pg.id_pagamento,
    pg.valor,
    pg.data_vencimento,
    pg.forma_pagamento,
    (CURRENT_DATE - pg.data_vencimento) AS dias_atraso
FROM aluno    a
JOIN matricula m  ON a.id_aluno     = m.id_aluno
JOIN pagamento pg ON m.id_matricula = pg.id_matricula
WHERE pg.status          = 'pendente'
  AND pg.data_vencimento < CURRENT_DATE
ORDER BY dias_atraso DESC;

CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT
    EXTRACT(YEAR  FROM data_pagamento)::INT AS ano,
    EXTRACT(MONTH FROM data_pagamento)::INT AS mes,
    COUNT(*)                                AS total_pagamentos,
    SUM(valor)                              AS total_arrecadado
FROM pagamento
WHERE status = 'pago'
GROUP BY ano, mes
ORDER BY ano DESC, mes DESC;

CREATE OR REPLACE FUNCTION fn_calcular_imc(p_id_avaliacao INT)
RETURNS NUMERIC AS $$
DECLARE
    v_peso   NUMERIC;
    v_altura NUMERIC;
BEGIN
    SELECT peso, altura
    INTO v_peso, v_altura
    FROM avaliacao_fisica
    WHERE id_avaliacao = p_id_avaliacao;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Avaliacao % nao encontrada.', p_id_avaliacao;
    END IF;

    IF v_altura = 0 THEN
        RAISE EXCEPTION 'Altura invalida para calculo do IMC.';
    END IF;

    RETURN ROUND(v_peso / (v_altura * v_altura), 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_total_pago_aluno(p_id_aluno INT)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(pg.valor), 0)
    INTO v_total
    FROM pagamento pg
    JOIN matricula m ON pg.id_matricula = m.id_matricula
    WHERE m.id_aluno = p_id_aluno
      AND pg.status  = 'pago';

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE pr_registrar_pagamento(
    p_id_matricula  INT,
    p_valor         NUMERIC,
    p_vencimento    DATE,
    p_forma         VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM matricula WHERE id_matricula = p_id_matricula
    ) THEN
        RAISE EXCEPTION 'Matricula % nao encontrada.', p_id_matricula;
    END IF;

    INSERT INTO pagamento (id_matricula, valor, data_vencimento, forma_pagamento, status)
    VALUES (p_id_matricula, p_valor, p_vencimento, p_forma, 'pendente');

    RAISE NOTICE 'Pagamento registrado com sucesso para a matricula %.', p_id_matricula;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_valida_matricula()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_fim <= NEW.data_inicio THEN
        RAISE EXCEPTION 'data_fim (%) deve ser posterior a data_inicio (%).',
            NEW.data_fim, NEW.data_inicio;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_valida_matricula
BEFORE INSERT OR UPDATE ON matricula
FOR EACH ROW EXECUTE FUNCTION fn_trg_valida_matricula();

CREATE OR REPLACE FUNCTION fn_trg_status_pagamento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'pendente' THEN
        NEW.status := 'vencido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_status_pagamento
BEFORE INSERT ON pagamento
FOR EACH ROW EXECUTE FUNCTION fn_trg_status_pagamento();

CREATE OR REPLACE FUNCTION fn_trg_cancela_pagamentos()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelada' AND OLD.status <> 'cancelada' THEN
        UPDATE pagamento
        SET status = 'cancelado'
        WHERE id_matricula = NEW.id_matricula
          AND status       = 'pendente';

        RAISE NOTICE 'Pagamentos pendentes da matricula % foram cancelados.', NEW.id_matricula;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cancela_pagamentos
AFTER UPDATE ON matricula
FOR EACH ROW EXECUTE FUNCTION fn_trg_cancela_pagamentos();