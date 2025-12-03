import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

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

app.post("/login", async (req, res) => {
  try {
    const { email, senha, isAdmin } = req.body;

    if (isAdmin) {
      const loginAdm = await prisma.administradores.findUnique({
        where: {
          email: String(email),
        },
      });

      if (!loginAdm) {
        return res.status(404).json({ erro: "Administrador não encontrado." });
      }

      if (loginAdm.senha !== String(senha)) {
        return res.status(401).json({ erro: "Senha incorreta." });
      }

      const token = jwt.sign(
        {
          id: loginAdm.id_adm,
          email: loginAdm.email,
          role: "admin",
        },
        process.env.JWT_SECRET || "sua_chave_secreta",
        { expiresIn: "1d" }
      );

      const { senha: _, ...admSemSenha } = loginAdm;

      res.status(200).json({ cliente: admSemSenha, token: token });
    } else {
      const loginCliente = await prisma.clientes.findUnique({
        where: {
          email: String(email),
        },
      });

      if (!loginCliente) {
        return res.status(404).json({ erro: "Cliente não encontrado." });
      }

      if (loginCliente.senha !== String(senha)) {
        return res.status(401).json({ erro: "Senha incorreta." });
      }

      const token = jwt.sign(
        {
          id: loginCliente.id_cliente,
          email: loginCliente.email,
          role: "cliente",
        },
        process.env.JWT_SECRET || "sua_chave_secreta",
        { expiresIn: "1d" }
      );

      const { senha: _, ...clienteSemSenha } = loginCliente;

      res.status(200).json({ cliente: clienteSemSenha, token: token });
    }
  } catch (error) {
    console.error("Erro ao efetuar login:", error);
    res.status(500).json({
      erro: "Erro ao efetuar login",
      message: error.message,
    });
  }
});

app.get("/dashboard/stats", async (req, res) => {
  try {
    const vendasAgregadas = await prisma.vendas.aggregate({
      _sum: { total_venda: true },
    });

    const totalClientes = await prisma.clientes.count();
    const totalProdutos = await prisma.produtos.count();
    const pedidosPendentes = await prisma.pedidos_compra.count({
      where: { status_pedido: "Pendente" },
    });

    res.json({
      vendas: vendasAgregadas._sum.total_venda || 0,
      clientes: totalClientes,
      produtos: totalProdutos,
      pedidos: pedidosPendentes,
    });
  } catch (error) {
    console.error("Erro ao buscar stats:", error);
    res.status(500).json({ erro: "Erro ao buscar estatísticas" });
  }
});

app.get("/clientes", async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar clientes" });
  }
});

app.get("/administradores", async (req, res) => {
  try {
    const admins = await prisma.administradores.findMany();
    const adminsSafe = admins.map(({ senha, ...rest }) => rest);
    res.json(adminsSafe);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar administradores" });
  }
});

app.get("/cliente/:id_cliente", async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const clienteId = parseInt(id_cliente);
    const cliente = await prisma.clientes.findUnique({
      where: { id_cliente: clienteId },
    });
    if (!cliente)
      return res.status(404).json({ erro: "Cliente não encontrado." });
    res.status(200).json(cliente);
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro interno ao buscar cliente", message: error.message });
  }
});

app.put("/cliente/:id_cliente", async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const { nome, cpf, email, senha, telefone, endereco, data_nascimento } =
      req.body;
    const clienteId = parseInt(id_cliente);
    const atualizarDados = await prisma.clientes.update({
      where: { id_cliente: clienteId },
      data: { nome, cpf, email, senha, telefone, endereco, data_nascimento },
    });
    res.status(201).json({ atualizarDados });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.get("/tarefas", async (req, res) => {
  try {
    const tarefas = await prisma.tarefas.findMany({
      orderBy: { data_criacao: "desc" },
    });
    res.json(tarefas);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar tarefas" });
  }
});

app.post("/tarefas", async (req, res) => {
  try {
    const { descricao } = req.body;
    const novaTarefa = await prisma.tarefas.create({
      data: { descricao, concluida: false },
    });
    res.status(201).json(novaTarefa);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar tarefa" });
  }
});

app.put("/tarefas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { concluida } = req.body;
    const tarefaAtualizada = await prisma.tarefas.update({
      where: { id_tarefa: parseInt(id) },
      data: { concluida },
    });
    res.json(tarefaAtualizada);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar tarefa" });
  }
});

app.delete("/tarefas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tarefas.delete({ where: { id_tarefa: parseInt(id) } });
    res.json({ message: "Tarefa removida" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover tarefa" });
  }
});

app.post("/categorias", async (req, res) => {
  try {
    const { nome_categoria } = req.body;
    const novaCategoria = await prisma.categorias.create({
      data: { nome_categoria },
    });
    res.status(201).json(novaCategoria);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.get("/categorias", async (req, res) => {
  try {
    const categorias = await prisma.categorias.findMany();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.post("/produtos", async (req, res) => {
  try {
    const { nome, descricao, id_categoria, preco_venda, estoque, imagem } =
      req.body;
    const novoProduto = await prisma.produtos.create({
      data: { nome, descricao, id_categoria, preco_venda, estoque, imagem },
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.get("/produtos", async (req, res) => {
  try {
    const todosProdutos = await prisma.produtos.findMany({
      include: { categoria: true },
    });
    res.status(200).json(todosProdutos);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.get("/produtos/:id_produto", async (req, res) => {
  try {
    const { id_produto } = req.params;
    const produtoId = parseInt(id_produto);
    const consultarProduto = await prisma.produtos.findUnique({
      where: { id_produto: produtoId },
      include: { categoria: true },
    });
    if (!consultarProduto)
      return res.status(404).json({ erro: "Produto não encontrado." });
    res.status(200).json(consultarProduto);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.put("/produtos/:id_produto", async (req, res) => {
  try {
    const { id_produto } = req.params;
    const {
      nome,
      descricao,
      id_categoria,
      preco_venda,
      estoque,
      imagem,
      promocao,
    } = req.body;
    const produtoId = parseInt(id_produto);
    const atualizarInfoProduto = await prisma.produtos.update({
      where: { id_produto: produtoId },
      data: {
        nome,
        descricao,
        id_categoria,
        preco_venda,
        estoque,
        imagem,
        promocao,
      },
    });
    res.status(201).json({ atualizarInfoProduto });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.delete("/produtos/:id_produto", async (req, res) => {
  try {
    const { id_produto } = req.params;
    await prisma.produtos.delete({
      where: { id_produto: parseInt(id_produto) },
    });
    res.status(200).json({ message: "Produto removido com sucesso" });
  } catch (error) {
    if (error.code === "P2003")
      return res
        .status(400)
        .json({ erro: "Produto possui vendas associadas." });
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.post("/venda", async (req, res) => {
  try {
    const { id_cliente, total_venda, metodo_pagamento } = req.body;
    const novaVenda = await prisma.vendas.create({
      data: {
        id_cliente: id_cliente,
        total_venda: total_venda,
        metodo_pagamento: metodo_pagamento,
        status: "PENDENTE",
      },
    });
    res.status(201).json(novaVenda);
  } catch (error) {
    console.error("Erro ao realizar venda:", error);
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.post("/venda/itens", async (req, res) => {
  try {
    const { id_venda, id_produto, quantidade, preco_unitario_venda } = req.body;
    const [novoItemVenda] = await prisma.$transaction([
      prisma.itens_venda.create({
        data: {
          id_venda: parseInt(id_venda),
          id_produto: parseInt(id_produto),
          quantidade: parseInt(quantidade),
          preco_unitario_venda: parseFloat(preco_unitario_venda),
        },
      }),
      prisma.produtos.update({
        where: { id_produto: parseInt(id_produto) },
        data: {
          estoque: {
            decrement: parseInt(quantidade),
          },
        },
      }),
    ]);

    res.status(201).json(novoItemVenda);
  } catch (error) {
    console.error("Erro ao registrar item e atualizar estoque:", error);
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.get("/vendas", async (req, res) => {
  try {
    const vendas = await prisma.vendas.findMany({
      include: {
        clientes: true,
        itens_venda: {
          include: { produtos: true },
        },
      },
      orderBy: { data_venda: "desc" },
    });
    res.json(vendas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar vendas" });
  }
});

app.get("/vendas/cliente/:id_cliente", async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const vendas = await prisma.vendas.findMany({
      where: { id_cliente: parseInt(id_cliente) },
      include: {
        clientes: true,
        itens_venda: {
          include: { produtos: true },
        },
      },
      orderBy: { data_venda: "desc" },
    });
    res.json(vendas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pedidos do cliente" });
  }
});

app.put("/vendas/:id_venda/status", async (req, res) => {
  try {
    const { id_venda } = req.params;
    const { status } = req.body;
    const vendaAtualizada = await prisma.vendas.update({
      where: { id_venda: parseInt(id_venda) },
      data: { status },
    });
    res.json(vendaAtualizada);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status da venda" });
  }
});

app.post("/administrador/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, cpf, telefone, endereco, data_nascimento } =
      req.body;
    const novoAdm = await prisma.administradores.create({
      data: { nome, email, senha, cpf, telefone, endereco, data_nascimento },
    });
    res.status(201).json(novoAdm);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.post("/compra", async (req, res) => {
  try {
    const { id_fornecedor, status_pedido } = req.body;
    const novaCompra = await prisma.pedidos_compra.create({
      data: { id_fornecedor, status_pedido },
    });
    res.status(201).json(novaCompra);
  } catch (error) {
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.post("/compra/itens", async (req, res) => {
  try {
    const { id_pedido, id_produto, quantidade, preco_custo_unitario } =
      req.body;

    const [novoItem] = await prisma.$transaction([
      prisma.itens_pedido.create({
        data: {
          id_pedido: parseInt(id_pedido),
          id_produto: parseInt(id_produto),
          quantidade: parseInt(quantidade),
          preco_custo_unitario: parseFloat(preco_custo_unitario),
        },
      }),
      prisma.produtos.update({
        where: { id_produto: parseInt(id_produto) },
        data: {
          estoque: {
            increment: parseInt(quantidade),
          },
        },
      }),
    ]);

    res.status(201).json(novoItem);
  } catch (error) {
    console.error("Erro ao registrar item de compra:", error);
    res.status(500).json({ erro: "Erro interno", message: error.message });
  }
});

app.get("/fornecedores", async (req, res) => {
  try {
    const fornecedores = await prisma.fornecedores.findMany();
    res.json(fornecedores);
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao listar fornecedores", message: error.message });
  }
});

app.post("/administrador/cadastroFornecedor", async (req, res) => {
  try {
    const { nome, cnpj, cidade, telefone, email } = req.body;

    if (!nome || !cnpj) {
      return res.status(400).json({ erro: "Nome e CNPJ são obrigatórios." });
    }

    const novoFornecedor = await prisma.fornecedores.create({
      data: {
        nome,
        cnpj,
        cidade,
        telefone,
        email,
      },
    });
    res.status(201).json(novoFornecedor);
  } catch (error) {
    console.error("Erro ao cadastrar fornecedor:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        erro: "Já existe um fornecedor cadastrado com este CNPJ, Email ou Telefone.",
      });
    }

    res.status(500).json({
      erro: "Erro interno ao cadastrar fornecedor",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\nServidor rodando na porta ${PORT}`);
});
