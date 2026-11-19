-- =====================================================================
-- AutoTrack Pro — Schema MySQL completo (estrutura + seeds de teste)
-- Executar: mysql -u root -p < database/schema.sql
-- Ou via cliente GUI (MySQL Workbench / DBeaver) no banco já criado.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

CREATE DATABASE IF NOT EXISTS autotrack_pro
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autotrack_pro;

DROP TRIGGER IF EXISTS trg_historico_no_update;
DROP TRIGGER IF EXISTS trg_historico_no_delete;
DROP TRIGGER IF EXISTS trg_auditoria_no_update;
DROP TRIGGER IF EXISTS trg_auditoria_no_delete;

DROP TABLE IF EXISTS logs_auditoria;
DROP TABLE IF EXISTS contatos_site;
DROP TABLE IF EXISTS historico_veiculos;
DROP TABLE IF EXISTS os_pecas;
DROP TABLE IF EXISTS ordens_servico;
DROP TABLE IF EXISTS orcamento_itens;
DROP TABLE IF EXISTS orcamentos;
DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS estoque_movimentacoes;
DROP TABLE IF EXISTS estoque_pecas;
DROP TABLE IF EXISTS veiculo_oficinas;
DROP TABLE IF EXISTS veiculos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS funcionarios;
DROP TABLE IF EXISTS oficinas;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Usuários e identidade
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  perfil      ENUM('admin_geral', 'admin_oficina', 'funcionario', 'cliente') NOT NULL DEFAULT 'cliente',
  ativo       TINYINT(1) NOT NULL DEFAULT 1,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_perfil (perfil),
  KEY idx_usuarios_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Oficinas (tenant raiz)
-- ---------------------------------------------------------------------
CREATE TABLE oficinas (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome             VARCHAR(180) NOT NULL,
  cnpj             VARCHAR(18)  NOT NULL,
  endereco         VARCHAR(255) NOT NULL,
  telefone         VARCHAR(30)  NOT NULL,
  email            VARCHAR(190) NOT NULL,
  responsavel_nome VARCHAR(150) NOT NULL,
  ativa            TINYINT(1) NOT NULL DEFAULT 1,
  criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_oficinas_cnpj (cnpj),
  UNIQUE KEY uq_oficinas_email (email),
  KEY idx_oficinas_ativa (ativa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Funcionários (vínculo usuário <-> oficina)
-- ---------------------------------------------------------------------
CREATE TABLE funcionarios (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NULL,
  oficina_id INT UNSIGNED NOT NULL,
  nome       VARCHAR(150) NOT NULL,
  contato    VARCHAR(80)  NOT NULL,
  funcao     VARCHAR(100) NOT NULL,
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_funcionarios_usuario (usuario_id),
  KEY idx_funcionarios_oficina (oficina_id),
  CONSTRAINT fk_funcionarios_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_funcionarios_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Clientes
-- ---------------------------------------------------------------------
CREATE TABLE clientes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED NOT NULL,
  nome_completo VARCHAR(180) NOT NULL,
  cpf           VARCHAR(14)  NULL,
  telefone      VARCHAR(30)  NOT NULL,
  email         VARCHAR(190) NOT NULL,
  endereco      VARCHAR(255) NULL,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_usuario (usuario_id),
  KEY idx_clientes_email (email),
  CONSTRAINT fk_clientes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Veículos (Garagem Digital)
-- ---------------------------------------------------------------------
CREATE TABLE veiculos (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cliente_id    INT UNSIGNED NOT NULL,
  marca         VARCHAR(80)  NOT NULL,
  modelo        VARCHAR(100) NOT NULL,
  ano           SMALLINT UNSIGNED NOT NULL,
  placa         VARCHAR(10)  NOT NULL,
  cor           VARCHAR(50)  NULL,
  quilometragem INT UNSIGNED NOT NULL DEFAULT 0,
  combustivel   VARCHAR(40)  NULL,
  chassi        VARCHAR(30)  NULL,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_veiculos_placa (placa),
  KEY idx_veiculos_cliente (cliente_id),
  KEY idx_veiculos_modelo (marca, modelo),
  CONSTRAINT fk_veiculos_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Autorização veículo <-> oficina (multi-oficina)
-- ---------------------------------------------------------------------
CREATE TABLE veiculo_oficinas (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  veiculo_id     INT UNSIGNED NOT NULL,
  oficina_id     INT UNSIGNED NOT NULL,
  status         ENUM('autorizado', 'revogado') NOT NULL DEFAULT 'autorizado',
  autorizado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_veiculo_oficina (veiculo_id, oficina_id),
  KEY idx_vo_oficina (oficina_id, status),
  CONSTRAINT fk_vo_veiculo FOREIGN KEY (veiculo_id)
    REFERENCES veiculos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_vo_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Estoque de peças
-- ---------------------------------------------------------------------
CREATE TABLE estoque_pecas (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  oficina_id     INT UNSIGNED NOT NULL,
  nome           VARCHAR(150) NOT NULL,
  codigo         VARCHAR(60)  NOT NULL,
  quantidade     INT NOT NULL DEFAULT 0,
  preco_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estoque_minimo INT NOT NULL DEFAULT 0,
  criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_peca_codigo_oficina (oficina_id, codigo),
  KEY idx_pecas_oficina (oficina_id),
  CONSTRAINT fk_pecas_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Movimentações de estoque (audit trail de entradas/saídas)
-- ---------------------------------------------------------------------
CREATE TABLE estoque_movimentacoes (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  peca_id    INT UNSIGNED NOT NULL,
  oficina_id INT UNSIGNED NOT NULL,
  tipo       ENUM('entrada', 'saida') NOT NULL,
  quantidade INT NOT NULL,
  motivo     VARCHAR(255) NOT NULL,
  os_id      INT UNSIGNED NULL,
  data_hora  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mov_peca (peca_id),
  KEY idx_mov_oficina (oficina_id, data_hora),
  KEY idx_mov_os (os_id),
  CONSTRAINT fk_mov_peca FOREIGN KEY (peca_id)
    REFERENCES estoque_pecas (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_mov_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. Agendamentos
-- ---------------------------------------------------------------------
CREATE TABLE agendamentos (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  veiculo_id        INT UNSIGNED NOT NULL,
  cliente_id        INT UNSIGNED NOT NULL,
  oficina_id        INT UNSIGNED NOT NULL,
  data_agendamento  DATE NOT NULL,
  horario           TIME NOT NULL,
  observacoes       TEXT NULL,
  status            ENUM('pendente', 'confirmado', 'concluido', 'cancelado') NOT NULL DEFAULT 'pendente',
  criado_em         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_agend_oficina_data (oficina_id, data_agendamento),
  KEY idx_agend_cliente (cliente_id),
  KEY idx_agend_veiculo (veiculo_id),
  CONSTRAINT fk_agend_veiculo FOREIGN KEY (veiculo_id)
    REFERENCES veiculos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_agend_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_agend_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. Orçamentos
-- ---------------------------------------------------------------------
CREATE TABLE orcamentos (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  oficina_id         INT UNSIGNED NOT NULL,
  veiculo_id         INT UNSIGNED NOT NULL,
  cliente_id         INT UNSIGNED NOT NULL,
  descricao_servicos TEXT NOT NULL,
  valor_mao_obra     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  valor_pecas        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  valor_total        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status             ENUM('pendente', 'aprovado', 'recusado') NOT NULL DEFAULT 'pendente',
  criado_em          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orc_oficina_status (oficina_id, status),
  KEY idx_orc_cliente (cliente_id),
  KEY idx_orc_veiculo (veiculo_id),
  CONSTRAINT fk_orc_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_orc_veiculo FOREIGN KEY (veiculo_id)
    REFERENCES veiculos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orc_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. Itens do orçamento
-- ---------------------------------------------------------------------
CREATE TABLE orcamento_itens (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  orcamento_id   INT UNSIGNED NOT NULL,
  tipo           ENUM('servico', 'peca') NOT NULL,
  peca_id        INT UNSIGNED NULL,
  descricao      VARCHAR(255) NOT NULL,
  quantidade     DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  KEY idx_oi_orcamento (orcamento_id),
  CONSTRAINT fk_oi_orcamento FOREIGN KEY (orcamento_id)
    REFERENCES orcamentos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_oi_peca FOREIGN KEY (peca_id)
    REFERENCES estoque_pecas (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. Ordens de Serviço (OS)
-- ---------------------------------------------------------------------
CREATE TABLE ordens_servico (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  oficina_id           INT UNSIGNED NOT NULL,
  veiculo_id           INT UNSIGNED NOT NULL,
  cliente_id           INT UNSIGNED NOT NULL,
  funcionario_id       INT UNSIGNED NULL,
  orcamento_id         INT UNSIGNED NULL,
  data_entrada         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  quilometragem        INT UNSIGNED NOT NULL DEFAULT 0,
  problema_relatado    TEXT NULL,
  diagnostico          TEXT NULL,
  servicos_realizados  TEXT NULL,
  valor_total          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status               ENUM('aguardando_aprovacao', 'em_andamento', 'aguardando_pecas', 'concluida', 'cancelada') NOT NULL DEFAULT 'aguardando_aprovacao',
  concluida_em         DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_os_oficina_status (oficina_id, status),
  KEY idx_os_cliente (cliente_id),
  KEY idx_os_veiculo (veiculo_id),
  KEY idx_os_orcamento (orcamento_id),
  KEY idx_os_funcionario (funcionario_id),
  CONSTRAINT fk_os_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_os_veiculo FOREIGN KEY (veiculo_id)
    REFERENCES veiculos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_os_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_os_funcionario FOREIGN KEY (funcionario_id)
    REFERENCES funcionarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_os_orcamento FOREIGN KEY (orcamento_id)
    REFERENCES orcamentos (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. Peças utilizadas na OS
-- ---------------------------------------------------------------------
CREATE TABLE os_pecas (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  os_id         INT UNSIGNED NOT NULL,
  peca_id       INT UNSIGNED NOT NULL,
  quantidade    INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  KEY idx_op_os (os_id),
  KEY idx_op_peca (peca_id),
  CONSTRAINT fk_op_os FOREIGN KEY (os_id)
    REFERENCES ordens_servico (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_op_peca FOREIGN KEY (peca_id)
    REFERENCES estoque_pecas (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. Histórico Digital Portátil do Veículo (IMUTÁVEL por trigger)
-- ---------------------------------------------------------------------
CREATE TABLE historico_veiculos (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  veiculo_id          INT UNSIGNED NOT NULL,
  oficina_id          INT UNSIGNED NULL,
  os_id               INT UNSIGNED NULL,
  data_servico        DATETIME NOT NULL,
  quilometragem       INT UNSIGNED NOT NULL DEFAULT 0,
  diagnostico         TEXT NULL,
  servicos_realizados TEXT NULL,
  pecas_substituidas  TEXT NULL,
  valor_total         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  criado_em           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_hist_veiculo_data (veiculo_id, data_servico),
  KEY idx_hist_oficina (oficina_id),
  KEY idx_hist_os (os_id),
  CONSTRAINT fk_hist_veiculo FOREIGN KEY (veiculo_id)
    REFERENCES veiculos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_hist_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_hist_os FOREIGN KEY (os_id)
    REFERENCES ordens_servico (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 15. Contatos do site
-- ---------------------------------------------------------------------
CREATE TABLE contatos_site (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome       VARCHAR(150) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  telefone   VARCHAR(30) NULL,
  mensagem   TEXT NOT NULL,
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contatos_data (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 16. Logs de auditoria (IMUTÁVEL por trigger)
-- ---------------------------------------------------------------------
CREATE TABLE logs_auditoria (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED NULL,
  oficina_id  INT UNSIGNED NULL,
  acao        VARCHAR(120) NOT NULL,
  referencia  VARCHAR(120) NULL,
  detalhes    TEXT NULL,
  data_hora   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_logs_usuario (usuario_id),
  KEY idx_logs_oficina (oficina_id, data_hora),
  KEY idx_logs_acao (acao),
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_logs_oficina FOREIGN KEY (oficina_id)
    REFERENCES oficinas (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Triggers de imutabilidade (histórico e auditoria)
-- ---------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_historico_no_update
BEFORE UPDATE ON historico_veiculos
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'O histórico digital do veículo é imutável.';
END$$

CREATE TRIGGER trg_historico_no_delete
BEFORE DELETE ON historico_veiculos
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'O histórico digital do veículo é imutável.';
END$$

CREATE TRIGGER trg_auditoria_no_update
BEFORE UPDATE ON logs_auditoria
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Os logs de auditoria são imutáveis.';
END$$

CREATE TRIGGER trg_auditoria_no_delete
BEFORE DELETE ON logs_auditoria
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Os logs de auditoria são imutáveis.';
END$$

DELIMITER ;

-- =====================================================================
-- SEEDS — dados prontos para teste imediato
-- Senhas (bcrypt, cost 10):
--   Admin@123    -> admin@autotrackpro.com
--   Oficina@123  -> oficina1@autotrackpro.com / oficina2@autotrackpro.com
--   Func@123     -> func1@autotrackpro.com / func2@autotrackpro.com
--   Cliente@123  -> cliente1@autotrackpro.com / cliente2@autotrackpro.com
-- =====================================================================

INSERT INTO usuarios (id, nome, email, senha_hash, perfil, ativo) VALUES
 (1, 'Admin Geral AutoTrack', 'admin@autotrackpro.com', '$2a$10$zqSAGD74Q7jUz5bcVujyd.OrFvR0YW0mqx6APaN/uRkHU1LxZsgPS', 'admin_geral', 1),
 (2, 'Ricardo Almeida',       'oficina1@autotrackpro.com', '$2a$10$zolGlpKFT7b/AhIyxlAd7etBcJ43EbMCvqfzcf76VVwH2tIJE/lCK', 'admin_oficina', 1),
 (3, 'Carla Nogueira',        'oficina2@autotrackpro.com', '$2a$10$zolGlpKFT7b/AhIyxlAd7etBcJ43EbMCvqfzcf76VVwH2tIJE/lCK', 'admin_oficina', 1),
 (4, 'Marcos Ferreira',       'func1@autotrackpro.com', '$2a$10$H6kn6lFQiwQcAEFrWcYMNOrPQJ35iSmmP2cJrwO3LvKfg7k3q1YYC', 'funcionario', 1),
 (5, 'Juliana Prado',         'func2@autotrackpro.com', '$2a$10$H6kn6lFQiwQcAEFrWcYMNOrPQJ35iSmmP2cJrwO3LvKfg7k3q1YYC', 'funcionario', 1),
 (6, 'Fernanda Costa',        'cliente1@autotrackpro.com', '$2a$10$8te/Toz2qncSGSUtVRSH4e1iHW7bOo5mTCkI3NiBEGpbo8o0UXFRy', 'cliente', 1),
 (7, 'Pedro Henrique Lima',   'cliente2@autotrackpro.com', '$2a$10$8te/Toz2qncSGSUtVRSH4e1iHW7bOo5mTCkI3NiBEGpbo8o0UXFRy', 'cliente', 1);

INSERT INTO oficinas (id, nome, cnpj, endereco, telefone, email, responsavel_nome, ativa) VALUES
 (1, 'AutoTrack Center — Matriz',   '12.345.678/0001-90', 'Av. das Nações, 1200 — São Paulo/SP', '(11) 4000-1234', 'contato@autotrackcenter.com.br', 'Ricardo Almeida', 1),
 (2, 'SpeedGarage Performance',     '98.765.432/0001-10', 'Rua dos Motores, 88 — Campinas/SP',   '(19) 3500-8899', 'contato@speedgarage.com.br',     'Carla Nogueira',  1);

-- Observação: administradores de oficina também possuem registro em funcionarios
-- (funcao = 'Administrador(a) da Oficina') para resolver o tenant via usuario_id.
INSERT INTO funcionarios (id, usuario_id, oficina_id, nome, contato, funcao) VALUES
 (1, 4, 1, 'Marcos Ferreira', '(11) 98888-1111', 'Mecânico sênior'),
 (2, 5, 2, 'Juliana Prado',   '(19) 97777-2222', 'Mecânica sênior'),
 (3, 2, 1, 'Ricardo Almeida', '(11) 4000-1234',  'Administrador da Oficina'),
 (4, 3, 2, 'Carla Nogueira',  '(19) 3500-8899',  'Administradora da Oficina');

INSERT INTO clientes (id, usuario_id, nome_completo, cpf, telefone, email, endereco) VALUES
 (1, 6, 'Fernanda Costa',      '123.456.789-00', '(11) 99999-0001', 'cliente1@autotrackpro.com', 'Rua Aurora, 45 — São Paulo/SP'),
 (2, 7, 'Pedro Henrique Lima', '987.654.321-00', '(19) 99999-0002', 'cliente2@autotrackpro.com', 'Rua Bela Vista, 12 — Campinas/SP');

INSERT INTO veiculos (id, cliente_id, marca, modelo, ano, placa, cor, quilometragem, combustivel, chassi) VALUES
 (1, 1, 'Toyota',   'Corolla XEi 2.0', 2021, 'ABC1D23', 'Prata',      48200, 'Flex',    '9BRBC41E0M0123456'),
 (2, 1, 'Honda',    'Civic EXL',       2019, 'DEF4G56', 'Preto',      71500, 'Gasolina', NULL),
 (3, 2, 'Volkswagen','Golf GTI',       2020, 'GHI7J89', 'Branco',     39800, 'Gasolina', 'WVWZZZ1JZLW123456'),
 (4, 2, 'Fiat',     'Argo 1.4',        2018, 'JKL0M12', 'Vermelho',   89300, 'Flex',    NULL);

INSERT INTO veiculo_oficinas (id, veiculo_id, oficina_id, status, autorizado_em) VALUES
 (1, 1, 1, 'autorizado', '2026-01-10 09:00:00'),
 (2, 2, 1, 'autorizado', '2026-02-05 14:30:00'),
 (3, 2, 2, 'autorizado', '2026-03-12 10:15:00'),
 (4, 3, 2, 'autorizado', '2026-01-20 11:00:00'),
 (5, 4, 1, 'revogado',   '2025-11-02 08:45:00');

INSERT INTO estoque_pecas (id, oficina_id, nome, codigo, quantidade, preco_unitario, estoque_minimo) VALUES
 (1, 1, 'Óleo motor 5W30 sintético (L)', 'OLEO-5W30', 24, 38.90, 10),
 (2, 1, 'Filtro de óleo',                 'FILT-OLEO', 8,  22.50, 12),
 (3, 1, 'Pastilha de freio dianteira',    'PAST-FRE',  6,  189.90, 4),
 (4, 1, 'Bateria 60Ah',                   'BAT-60',    3,  429.00, 2),
 (5, 1, 'Velas de ignição (kit 4)',       'VELA-KIT4', 15, 156.00, 6),
 (6, 1, 'Correia de distribuição',        'CORR-DIST', 2,  310.00, 3),
 (7, 2, 'Óleo motor 0W20 (L)',            'OLEO-0W20', 18, 45.00, 8),
 (8, 2, 'Filtro de ar esportivo',         'FILT-AR',   5,  129.90, 4),
 (9, 2, 'Disco de freio dianteiro',       'DISCO-FRE', 4,  279.00, 2),
 (10,2, 'Kit embreagem',                  'KIT-EMB',   1,  980.00, 2);

INSERT INTO estoque_movimentacoes (id, peca_id, oficina_id, tipo, quantidade, motivo, os_id, data_hora) VALUES
 (1, 1, 1, 'entrada', 30, 'Compra mensal — fornecedor LubriMax', NULL, '2026-01-05 08:30:00'),
 (2, 2, 1, 'entrada', 20, 'Reposição de estoque',                 NULL, '2026-01-05 08:35:00'),
 (3, 1, 1, 'saida',    6, 'Uso em OS #3 — troca de óleo',           3,   '2026-02-18 15:10:00'),
 (4, 3, 1, 'saida',    1, 'Uso em OS #3 — pastilhas',               3,   '2026-02-18 15:10:00'),
 (5, 7, 2, 'entrada', 20, 'Compra mensal',                          NULL, '2026-02-01 09:00:00'),
 (6, 8, 2, 'saida',    2, 'Uso em OS #4 — filtro de ar',            4,   '2026-03-08 13:20:00');

INSERT INTO orcamentos (id, oficina_id, veiculo_id, cliente_id, descricao_servicos, valor_mao_obra, valor_pecas, valor_total, status, criado_em) VALUES
 (1, 1, 1, 1, 'Revisão completa 40.000 km: troca de óleo, filtros, velas e alinhamento.', 320.00, 267.40, 587.40, 'pendente',  '2026-10-02 10:00:00'),
 (2, 1, 2, 1, 'Troca de pastilhas de freio dianteiras e limpeza dos discos.',              180.00, 189.90, 369.90, 'aprovado',  '2026-10-08 14:20:00'),
 (3, 2, 3, 2, 'Ajuste de suspensão e substituição do filtro de ar esportivo.',             250.00, 129.90, 379.90, 'pendente',  '2026-10-11 09:45:00'),
 (4, 2, 4, 2, 'Substituição de kit de embreagem (orçamento alternativo).',                690.00, 980.00, 1670.00,'recusado',  '2026-09-28 16:00:00');

INSERT INTO orcamento_itens (id, orcamento_id, tipo, peca_id, descricao, quantidade, valor_unitario) VALUES
 (1, 1, 'servico', NULL, 'Mão de obra — revisão 40.000 km',      1.00, 320.00),
 (2, 1, 'peca',    1,    'Óleo motor 5W30 sintético (L)',       5.00, 38.90),
 (3, 1, 'peca',    2,    'Filtro de óleo',                      1.00, 22.50),
 (4, 1, 'peca',    5,    'Velas de ignição (kit 4)',            1.00, 156.00),
 (5, 2, 'servico', NULL, 'Mão de obra — troca de pastilhas',    1.00, 180.00),
 (6, 2, 'peca',    3,    'Pastilha de freio dianteira',         1.00, 189.90),
 (7, 3, 'servico', NULL, 'Mão de obra — ajuste de suspensão',   1.00, 250.00),
 (8, 3, 'peca',    8,    'Filtro de ar esportivo',              1.00, 129.90);

INSERT INTO agendamentos (id, veiculo_id, cliente_id, oficina_id, data_agendamento, horario, observacoes, status, criado_em) VALUES
 (1, 1, 1, 1, '2026-11-20', '08:30:00', 'Revisão aprovada no orçamento #1.', 'confirmado', '2026-10-15 10:12:00'),
 (2, 2, 1, 1, '2026-11-22', '14:00:00', 'Verificar ruído na suspensão.',     'pendente',   '2026-11-16 09:30:00'),
 (3, 3, 2, 2, '2026-11-21', '10:00:00', 'Alinhamento de direção.',          'pendente',   '2026-11-17 11:05:00'),
 (4, 1, 1, 1, '2026-09-12', '09:00:00', 'Troca de óleo realizada.',         'concluido',  '2026-09-01 08:00:00');

INSERT INTO ordens_servico (id, oficina_id, veiculo_id, cliente_id, funcionario_id, orcamento_id, data_entrada, quilometragem, problema_relatado, diagnostico, servicos_realizados, valor_total, status, concluida_em) VALUES
 (1, 1, 1, 1, 1, 1, '2026-11-16 08:10:00', 48200, 'Cliente relata consumo elevado de óleo e luz de manutenção acesa.',
    'Análise inicial: necessária revisão completa e verificação de vedação do motor.',
    'Em execução: drenagem de óleo, substituição de filtros e velas.', 587.40, 'em_andamento', NULL),
 (2, 1, 2, 1, NULL, 2, '2026-11-17 13:40:00', 71500, 'Freio com ruído metálico ao frenar.',
    'Aguardando aprovação do cliente para substituição das pastilhas.', NULL, 369.90, 'aguardando_aprovacao', NULL),
 (3, 1, 1, 1, 1, NULL, '2026-09-12 09:05:00', 46500, 'Troca de óleo de rotina.',
    'Óleo com viscosidade alterada e filtro obstruído.',
    'Troca de óleo 5W30, filtro de óleo e pastilhas dianteiras.', 512.40, 'concluida', '2026-09-12 11:30:00'),
 (4, 2, 3, 2, 2, 3, '2026-03-08 12:50:00', 39800, 'Filtro de ar sujo e perda de potência em rotações altas.',
    'Filtro de ar obstruído e admissão com resíduos.',
    'Substituição do filtro de ar esportivo e limpeza da admissão.', 379.90, 'concluida', '2026-03-08 15:10:00');

INSERT INTO os_pecas (id, os_id, peca_id, quantidade, preco_unitario) VALUES
 (1, 1, 1, 5, 38.90),
 (2, 1, 2, 1, 22.50),
 (3, 1, 5, 1, 156.00),
 (4, 3, 1, 6, 38.90),
 (5, 3, 3, 1, 189.90),
 (6, 4, 8, 2, 129.90);

INSERT INTO historico_veiculos (id, veiculo_id, oficina_id, os_id, data_servico, quilometragem, diagnostico, servicos_realizados, pecas_substituidas, valor_total, criado_em) VALUES
 (1, 1, 1, 3, '2026-09-12 11:30:00', 46500, 'Óleo com viscosidade alterada e filtro obstruído.',
    'Troca de óleo 5W30, filtro de óleo e pastilhas dianteiras.',
    'Óleo motor 5W30 (6L); Filtro de óleo (1); Pastilha de freio dianteira (1).', 512.40, '2026-09-12 11:31:00'),
 (2, 3, 2, 4, '2026-03-08 15:10:00', 39800, 'Filtro de ar obstruído e admissão com resíduos.',
    'Substituição do filtro de ar esportivo e limpeza da admissão.',
    'Filtro de ar esportivo (2).', 379.90, '2026-03-08 15:11:00');

INSERT INTO contatos_site (id, nome, email, telefone, mensagem, criado_em) VALUES
 (1, 'Visitante Teste', 'visitante@email.com', '(11) 98888-0000', 'Gostaria de informações sobre o plano para oficinas.', '2026-11-15 18:22:00');

INSERT INTO logs_auditoria (id, usuario_id, oficina_id, acao, referencia, detalhes, data_hora) VALUES
 (1, 1, NULL, 'LOGIN', 'admin@autotrackpro.com', 'Login realizado com sucesso.', '2026-11-18 08:00:00'),
 (2, 2, 1, 'ORCAMENTO_APROVADO', 'orcamento#2', 'Cliente aprovou o orçamento.', '2026-11-10 09:15:00'),
 (3, 2, 1, 'OS_CONCLUIDA', 'os#3', 'Histórico gravado; estoque baixado; km atualizado para 46500.', '2026-09-12 11:31:00'),
 (4, 4, 1, 'ESTOQUE_ENTRADA', 'peca#1', 'Entrada de 30 unidades.', '2026-01-05 08:30:00');

-- Ajuste de auto_increment para evitar colisão com os IDs explícitos dos seeds
ALTER TABLE usuarios          AUTO_INCREMENT = 8;
ALTER TABLE oficinas          AUTO_INCREMENT = 3;
ALTER TABLE funcionarios      AUTO_INCREMENT = 5;
ALTER TABLE clientes          AUTO_INCREMENT = 3;
ALTER TABLE veiculos          AUTO_INCREMENT = 5;
ALTER TABLE veiculo_oficinas  AUTO_INCREMENT = 6;
ALTER TABLE estoque_pecas     AUTO_INCREMENT = 11;
ALTER TABLE estoque_movimentacoes AUTO_INCREMENT = 7;
ALTER TABLE agendamentos      AUTO_INCREMENT = 5;
ALTER TABLE orcamentos        AUTO_INCREMENT = 5;
ALTER TABLE orcamento_itens   AUTO_INCREMENT = 9;
ALTER TABLE ordens_servico    AUTO_INCREMENT = 5;
ALTER TABLE os_pecas          AUTO_INCREMENT = 7;
ALTER TABLE historico_veiculos AUTO_INCREMENT = 3;
ALTER TABLE contatos_site     AUTO_INCREMENT = 2;
ALTER TABLE logs_auditoria    AUTO_INCREMENT = 5;

-- =====================================================================
-- FIM DO SCHEMA
-- Credenciais de teste rápido (todas com SHA bcrypt cost 10):
--   admin_geral   admin@autotrackpro.com    / Admin@123
--   admin_oficina oficina1@autotrackpro.com / Oficina@123
--   admin_oficina oficina2@autotrackpro.com / Oficina@123
--   funcionario   func1@autotrackpro.com    / Func@123
--   cliente       cliente1@autotrackpro.com / Cliente@123
-- =====================================================================
