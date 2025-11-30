-- CreateTable
CREATE TABLE `categorias` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_categoria` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `nome_categoria_unico`(`nome_categoria`),
    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `email` VARCHAR(100) NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `endereco` VARCHAR(100) NULL,
    `data_nascimento` DATE NULL,
    `data_cadastro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `cpf_unico`(`cpf`),
    UNIQUE INDEX `email_unico`(`email`),
    UNIQUE INDEX `telefone_cliente_unico`(`telefone`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `id_fornecedor` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `cnpj` VARCHAR(18) NOT NULL,
    `cidade` VARCHAR(100) NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,

    UNIQUE INDEX `cnpj_unico`(`cnpj`),
    UNIQUE INDEX `telefone_fornecedor_unico`(`telefone`),
    UNIQUE INDEX `email_fornecedor_unico`(`email`),
    PRIMARY KEY (`id_fornecedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_pedido` (
    `id_item_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `preco_custo_unitario` DECIMAL(10, 2) NOT NULL,

    INDEX `id_pedido`(`id_pedido`),
    INDEX `id_produto`(`id_produto`),
    PRIMARY KEY (`id_item_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_venda` (
    `id_item_venda` INTEGER NOT NULL AUTO_INCREMENT,
    `id_venda` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `preco_unitario_venda` DECIMAL(10, 2) NOT NULL,

    INDEX `id_produto`(`id_produto`),
    INDEX `id_venda`(`id_venda`),
    PRIMARY KEY (`id_item_venda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos_compra` (
    `id_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `data_pedido` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `id_fornecedor` INTEGER NOT NULL,
    `status_pedido` VARCHAR(30) NOT NULL DEFAULT 'Pendente',

    INDEX `id_fornecedor`(`id_fornecedor`),
    PRIMARY KEY (`id_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id_produto` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `id_categoria` INTEGER NOT NULL,
    `preco_venda` DECIMAL(10, 2) NOT NULL,
    `estoque` INTEGER NOT NULL DEFAULT 0,
    `imagem` VARCHAR(255) NULL,
    `promocao` BOOLEAN NOT NULL DEFAULT false,

    INDEX `id_categoria`(`id_categoria`),
    PRIMARY KEY (`id_produto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendas` (
    `id_venda` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NULL,
    `data_venda` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `total_venda` DECIMAL(10, 2) NOT NULL,
    `metodo_pagamento` VARCHAR(30) NULL,

    INDEX `id_cliente`(`id_cliente`),
    PRIMARY KEY (`id_venda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administradores` (
    `id_adm` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `endereco` VARCHAR(100) NULL,
    `data_nascimento` DATE NULL,
    `data_cadastro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email_adm_unico`(`email`),
    UNIQUE INDEX `cpf_adm_unico`(`cpf`),
    UNIQUE INDEX `telefone_adm_unico`(`telefone`),
    PRIMARY KEY (`id_adm`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarefas` (
    `id_tarefa` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(255) NOT NULL,
    `concluida` BOOLEAN NOT NULL DEFAULT false,
    `data_criacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_tarefa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `itens_pedido` ADD CONSTRAINT `itens_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos_compra`(`id_pedido`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_pedido` ADD CONSTRAINT `itens_pedido_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `produtos`(`id_produto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `itens_venda_ibfk_1` FOREIGN KEY (`id_venda`) REFERENCES `vendas`(`id_venda`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `itens_venda_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `produtos`(`id_produto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pedidos_compra` ADD CONSTRAINT `pedidos_compra_ibfk_1` FOREIGN KEY (`id_fornecedor`) REFERENCES `fornecedores`(`id_fornecedor`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE NO ACTION ON UPDATE NO ACTION;
