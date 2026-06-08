CREATE TABLE IF NOT EXISTS plano (
    id_plano        SERIAL          NOT NULL,
    nome            VARCHAR(100)    NOT NULL,
    descricao       VARCHAR(255),
    valor_mensal    NUMERIC(10, 2)  NOT NULL,
    duracao_meses   INT             NOT NULL,
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_plano PRIMARY KEY (id_plano)
);


CREATE TABLE IF NOT EXISTS aluno (
    id_aluno        SERIAL          NOT NULL,
    nome            VARCHAR(150)    NOT NULL,
    cpf             CHAR(11)        NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    telefone        VARCHAR(20),
    data_nascimento DATE            NOT NULL,
    data_cadastro   DATE            NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ativo',
    CONSTRAINT pk_aluno     PRIMARY KEY (id_aluno),
    CONSTRAINT uq_aluno_cpf UNIQUE (cpf)
);


CREATE TABLE IF NOT EXISTS instrutor (
    id_instrutor    SERIAL          NOT NULL,
    nome            VARCHAR(150)    NOT NULL,
    cpf             CHAR(11)        NOT NULL,
    especialidade   VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    telefone        VARCHAR(20),
    data_admissao   DATE            NOT NULL,
    CONSTRAINT pk_instrutor     PRIMARY KEY (id_instrutor),
    CONSTRAINT uq_instrutor_cpf UNIQUE (cpf)
);


CREATE TABLE IF NOT EXISTS matricula (
    id_matricula    SERIAL          NOT NULL,
    id_aluno        INT             NOT NULL,
    id_plano        INT             NOT NULL,
    data_inicio     DATE            NOT NULL,
    data_fim        DATE            NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ativa',
    CONSTRAINT pk_matricula         PRIMARY KEY (id_matricula),
    CONSTRAINT fk_matricula_aluno   FOREIGN KEY (id_aluno)
        REFERENCES aluno (id_aluno)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_matricula_plano   FOREIGN KEY (id_plano)
        REFERENCES plano (id_plano)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS pagamento (
    id_pagamento    SERIAL          NOT NULL,
    id_matricula    INT             NOT NULL,
    valor           NUMERIC(10, 2)  NOT NULL,
    data_vencimento DATE            NOT NULL,
    data_pagamento  DATE,
    forma_pagamento VARCHAR(50)     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'pendente',
    CONSTRAINT pk_pagamento             PRIMARY KEY (id_pagamento),
    CONSTRAINT fk_pagamento_matricula   FOREIGN KEY (id_matricula)
        REFERENCES matricula (id_matricula)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS avaliacao_fisica (
    id_avaliacao            SERIAL          NOT NULL,
    id_aluno                INT             NOT NULL,
    id_instrutor            INT             NOT NULL,
    data_avaliacao          DATE            NOT NULL,
    peso                    NUMERIC(5, 2)   NOT NULL,
    altura                  NUMERIC(4, 2)   NOT NULL,
    percentual_gordura      NUMERIC(5, 2),
    observacoes             TEXT,
    CONSTRAINT pk_avaliacao_fisica              PRIMARY KEY (id_avaliacao),
    CONSTRAINT fk_avaliacao_fisica_aluno        FOREIGN KEY (id_aluno)
        REFERENCES aluno (id_aluno)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_avaliacao_fisica_instrutor    FOREIGN KEY (id_instrutor)
        REFERENCES instrutor (id_instrutor)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);