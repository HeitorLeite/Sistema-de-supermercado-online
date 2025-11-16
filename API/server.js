import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CADASTRO E EDIÇÃO DE INFORMAÇÕES DO CLIENTE

app.post("/cadastro", async (req, res) => {
  try {
    const { nome, cpf, email, senha, telefone, endereco, data_nascimento } =
      req.body;

    const novoCliente = await prisma.clientes.create({
      data: {
        nome: nome,
        cpf: cpf,
        email: email,
        senha: senha,
        telefone: telefone,
        endereco: endereco,
        data_nascimento: data_nascimento,
      },
    });
    res.status(201).json(novoCliente);
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    res.status(500).json({
      erro: "Erro ao cadastrar cliente",
      message: error.message,
    });
  }
});

app.get("/cliente/:id_cliente", async (req, res) => {
  try {
    const { id_cliente } = req.params;

    const clienteId = parseInt(id_cliente);

    const cliente = await prisma.clientes.findUnique({
      where: {
        id_cliente: clienteId,
      },
    });

    if (!cliente) {
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    res.status(200).json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({
      erro: "Erro interno ao buscar cliente",
      message: error.message,
    });
  }
});

app.put("/cliente/:id_cliente", async (req, res) => {
  try {
    const { id_cliente } = req.params;

    const { nome, cpf, email, senha, telefone, endereco, data_nascimento } =
      req.body;

    const clienteId = parseInt(id_cliente);

    const atualizarDados = await prisma.clientes.update({
      where: {
        id_cliente: clienteId,
      },
      data: {
        nome: nome,
        cpf: cpf,
        email: email,
        senha: senha,
        telefone: telefone,
        endereco: endereco,
        data_nascimento: data_nascimento,
      },
    });

    res.status(201).json({ atualizarDados });
  } catch (error) {
    console.error("Erro ao atualizar dados do cliente:", error);
    res.status(500).json({
      erro: "Erro interno ao atualizar dados do cliente",
      message: error.message,
    });
  }
});

//Criação de categorias

app.post("/categorias", async (req, res) => {
  try {
    const { nome_categoria } = req.body;

    const novaCategoria = await prisma.categorias.create({
      data: {
        nome_categoria: nome_categoria,
      },
    });

    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error("Erro ao cadastrar categoria:", error);
    res.status(500).json({
      erro: "Erro interno ao cadastrar caegoria",
      message: error.message,
    });
  }
});

//Registro e procura de produto

app.post("/produtos", async (req, res) => {
  try {
    const { nome, descricao, id_categoria, preco_venda, estoque, imagem } =
      req.body;

    const novoProduto = await prisma.produtos.create({
      data: {
        nome: nome,
        descricao: descricao,
        id_categoria: id_categoria,
        preco_venda: preco_venda,
        estoque: estoque,
        imagem: imagem,
      },
    });

    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    res.status(500).json({
      erro: "Erro interno ao cadastrar produto",
      message: error.message,
    });
  }
});

app.get("/produtos/:id_produto", async (req, res) => {
  try {
    const { id_produto } = req.params;

    const produtoId = parseInt(id_produto);

    const consultarProduto = await prisma.produtos.findUnique({
      where: {
        id_produto: produtoId,
      },
    });

    if (!consultarProduto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    res.status(200).json(consultarProduto);
  } catch (error) {
    console.error("Erro ao procurar produto:", error);
    res.status(500).json({
      erro: "Erro interno ao procurar produto",
      message: error.message,
    });
  }
});

//Criando Venda

app.post("/venda", async (req, res) => {
  try {
    const { id_cliente, total_venda, metodo_pagamento } = req.body;

    const novaVenda = await prisma.vendas.create({
      data: {
        id_cliente: id_cliente,
        total_venda: total_venda,
        metodo_pagamento: metodo_pagamento,
      },
    });
    res.status(201).json(novaVenda);
  } catch (error) {
    console.error("Erro ao realizar venda:", error);
    res.status(500).json({
      erro: "Erro interno ao realizar venda",
      message: error.message,
    });
  }
});

app.post("/venda/itens", async (req, res) => {
  try {
    const { id_venda, id_produto, quantidade, preco_unitario_venda } = req.body;

    const novoItemVenda = await prisma.itens_venda.create({
      data: {
        id_venda: id_venda,
        id_produto: id_produto,
        quantidade: quantidade,
        preco_unitario_venda: preco_unitario_venda,
      },
    });
    res.status(201).json(novoItemVenda);
  } catch (error) {
    console.error("Erro ao cadastrar itens da venda:", error);
    res.status(500).json({
      erro: "Erro interno ao cadastrar itens da venda",
      message: error.message,
    });
  }
});

//Cadastrar ADM
app.post("/administrador/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, cpf, telefone, endereco, data_nascimento } =
      req.body;

    const novoAdministrador = await prisma.administradores.create({
      data: {
        nome: nome,
        email: email,
        senha: senha,
        cpf: cpf,
        telefone: telefone,
        endereco: endereco,
        data_nascimento: data_nascimento,
      },
    });
    res.status(201).json(novoAdministrador);
  } catch (error) {
    console.error("Erro ao cadastrar administrador:", error);
    res.status(500).json({
      erro: "Erro interno ao cadastrar administrador",
      message: error.message,
    });
  }
});

app.put("/administrador/cadastro/:id_adm", async (req, res) => {
  try {
    const { id_adm } = req.params;

    const { nome, email, senha, cpf, telefone, endereco, data_nascimento } =
      req.body;

    const admId = parseInt(id_adm);

    const atualizarDadosAdm = await prisma.administradores.update({
      where: {
        id_adm: admId,
      },
      data: {
        nome: nome,
        email: email,
        senha: senha,
        cpf: cpf,
        telefone: telefone,
        endereco: endereco,
        data_nascimento: data_nascimento,
      },
    });
    res.status(201).json({ atualizarDadosAdm });
  } catch (error) {
    console.error("Erro ao atualizar dados do administrador:", error);
    res.status(500).json({
      erro: "Erro interno ao atualizar dados do administrador",
      message: error.message,
    });
  }
});

app.post("/administrador/cadastroFornecedor", async (req, res) => {
  try {
    const { nome, cnpj, cidade, telefone, email } = req.body;

    const novoFornercedor = await prisma.fornecedores.create({
      data: {
        nome: nome,
        cnpj: cnpj,
        cidade: cidade,
        telefone: telefone,
        email: email,
      },
    });
    res.status(201).json(novoFornercedor);
  } catch (error) {
    console.error("Erro ao cadastrar fornercedor:", error);
    res.status(500).json({
      erro: "Erro interno ao cadastrar fornercedor",
      message: error.message,
    });
  }
});

app.post("/compra", async (req, res) => {
  try {
    const { id_fornecedor, status_pedido } = req.body;

    const novaCompra = await prisma.pedidos_compra.create({
      data: {
        id_fornecedor: id_fornecedor,
        status_pedido: status_pedido,
      },
    });
    res.status(201).json(novaCompra);
  } catch (error) {
    console.error("Erro ao cadastrar compra:", error);
    res.status(500).json({
      erro: "Erro interno ao cadastrar compra",
      message: error.message,
    });
  }
});

app.post("/compra/itens", async (req, res) => {
  try {
    const { id_pedido, id_produto, quantidade, preco_custo_unitario } =
      req.body;

    const novoItemCompra = await prisma.itens_pedido.create({
      data: {
        id_pedido: id_pedido,
        id_produto: id_produto,
        quantidade: quantidade,
        preco_custo_unitario: preco_custo_unitario,
      },
    });
    res.status(201).json(novoItemCompra);
  } catch (error) {
    console.error("Erro ao cadastrar itens da compra:", error);
    res.status(500).json({
      erro: "Erro interno ao cadastrar itens da compra",
      message: error.message,
    });
  }
});

//Criando pedido de compra

app.post("/pedidoCompra", async (req, res) => {
  try {
  } catch (error) {}
});

app.listen(PORT, () => {
  console.log(`\nServidor rodando na porta ${PORT}`);
});
