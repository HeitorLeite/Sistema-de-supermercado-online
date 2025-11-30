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

app.post("/login", async (req, res) => {
  try {
    const { email, senha, isAdmin } = req.body; // Recebe a flag isAdmin

    if (isAdmin) {
      // --- LÓGICA DE ADMINISTRADOR ---
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
          role: "admin", // Identificador extra no token
        },
        process.env.JWT_SECRET || "sua_chave_secreta",
        { expiresIn: "1d" }
      );

      const { senha: _, ...admSemSenha } = loginAdm;

      // Retornamos 'cliente' para manter compatibilidade com o front, ou você pode ajustar o front para ler 'usuario'
      res.status(200).json({ cliente: admSemSenha, token: token });
    } else {
      // --- LÓGICA DE CLIENTE (PADRÃO) ---
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

function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ erro: "Acesso negado." });

  try {
    const segredo = process.env.JWT_SECRET || "sua_chave_secreta";
    const usuario = jwt.verify(token, segredo);
    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(403).json({ erro: "Token inválido." });
  }
}

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

app.get("/categorias", async (req, res) => {
  try {
    const categorias = await prisma.categorias.findMany();

    res.json(categorias);
  } catch (error) {
    console.error("Erro ao mostrar categorias:", error);
    res.status(500).json({
      erro: "Erro interno ao mostrar categorias",
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

app.get("/produtos", async (req, res) => {
  try {
    const todosProdutos = await prisma.produtos.findMany({
      include: {
        categoria: true,
      },
    });

    res.status(200).json(todosProdutos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({
      erro: "Erro interno ao buscar produtos",
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
      include: {
        categoria: true,
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
      where: {
        id_produto: produtoId,
      },
      data: {
        nome: nome,
        descricao: descricao,
        id_categoria: id_categoria,
        preco_venda: preco_venda,
        estoque: estoque,
        imagem: imagem,
        promocao: promocao,
      },
    });
    res.status(201).json({ atualizarInfoProduto });
  } catch (error) {
    console.error("Erro ao atualizar informações do produto:", error);
    res.status(500).json({
      erro: "Erro interno ao atualizar informações do produto",
      message: error.message,
    });
  }
});

app.delete("/produtos/:id_produto", async (req, res) => {
  try {
    const { id_produto } = req.params;
    const produtoId = parseInt(id_produto);

    // Tenta deletar o produto
    await prisma.produtos.delete({
      where: {
        id_produto: produtoId,
      },
    });

    res.status(200).json({ message: "Produto removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover produto:", error);

    // Tratamento especial para erro de chave estrangeira (P2003) do Prisma
    // Isso acontece se tentar apagar um produto que já tem vendas ou pedidos registrados
    if (error.code === "P2003") {
      return res.status(400).json({
        erro: "Não é possível remover este produto pois ele já possui vendas ou pedidos associados.",
      });
    }

    res.status(500).json({
      erro: "Erro interno ao remover produto",
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
