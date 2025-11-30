CREATE DATABASE IF NOT EXISTS supermercado_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE supermercado_db;

CREATE TABLE IF NOT EXISTS Fornecedores (
    id_fornecedor INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    cidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(100),
    PRIMARY KEY (id_fornecedor),
    UNIQUE KEY cnpj_unico (cnpj),
    UNIQUE KEY telefone_fornecedor_unico (telefone),
    UNIQUE KEY email_fornecedor_unico (email)
);

CREATE TABLE IF NOT EXISTS Categorias (
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nome_categoria VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_categoria),
    UNIQUE KEY nome_categoria_unico (nome_categoria)
);

CREATE TABLE IF NOT EXISTS Produtos (
    id_produto INT NOT NULL AUTO_INCREMENT,    
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    id_categoria INT NOT NULL,                
    preco_venda DECIMAL(10, 2) NOT NULL, 
    estoque INT NOT NULL DEFAULT 0,      
    imagem VARCHAR(255) NULL,
    promocao BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_produto),
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

CREATE TABLE IF NOT EXISTS Pedidos_Compra (
    id_pedido INT NOT NULL AUTO_INCREMENT, 
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    id_fornecedor INT NOT NULL,    
    status_pedido VARCHAR(30) NOT NULL DEFAULT 'Pendente',
    PRIMARY KEY (id_pedido),
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedores(id_fornecedor)
);

CREATE TABLE IF NOT EXISTS Itens_Pedido (
    id_item_pedido INT NOT NULL AUTO_INCREMENT,
    id_pedido INT NOT NULL,   
    id_produto INT NOT NULL,      
    quantidade INT NOT NULL,       
    preco_custo_unitario DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_item_pedido),
    FOREIGN KEY (id_pedido) REFERENCES Pedidos_Compra(id_pedido),
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
);

CREATE TABLE IF NOT EXISTS Clientes (
    id_cliente INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    email VARCHAR(100),
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(100),
    data_nascimento DATE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cliente),
    UNIQUE KEY cpf_unico (cpf),
    UNIQUE KEY email_unico (email),
    UNIQUE KEY telefone_cliente_unico (telefone)
);

CREATE TABLE IF NOT EXISTS Vendas (
    id_venda INT NOT NULL AUTO_INCREMENT,
    id_cliente INT,
    data_venda DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_venda DECIMAL(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    PRIMARY KEY (id_venda),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
);

CREATE TABLE IF NOT EXISTS Itens_Venda (
    id_item_venda INT NOT NULL AUTO_INCREMENT,
    id_venda INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario_venda DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_item_venda),
    FOREIGN KEY (id_venda) REFERENCES Vendas(id_venda),
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
);

CREATE TABLE IF NOT EXISTS Administradores (
    id_adm INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(100),
    data_nascimento DATE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_adm),
    UNIQUE KEY email_adm_unico (email),
    UNIQUE KEY cpf_adm_unico (cpf),
    UNIQUE KEY telefone_adm_unico (telefone)
);

CREATE TABLE IF NOT EXISTS Tarefas (
    id_tarefa INT NOT NULL AUTO_INCREMENT,
    descricao VARCHAR(255) NOT NULL,
    concluida BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tarefa)
);