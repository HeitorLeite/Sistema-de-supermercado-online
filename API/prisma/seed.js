import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Limpar banco (ordem reversa para evitar erro de chave estrangeira)
  // Nota: Em produção, use com cuidado. Aqui é para desenvolvimento.
  const tablenames = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'supermercado_db';
  `
  // Desabilita checagem de FK temporariamente para limpar tudo
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
  
  // Apaga dados de todas as tabelas
  await prisma.itens_venda.deleteMany();
  await prisma.vendas.deleteMany();
  await prisma.itens_pedido.deleteMany();
  await prisma.pedidos_compra.deleteMany();
  await prisma.produtos.deleteMany();
  await prisma.categorias.deleteMany();
  await prisma.fornecedores.deleteMany();
  await prisma.clientes.deleteMany();
  await prisma.administradores.deleteMany();
  await prisma.tarefas.deleteMany();

  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
  console.log('🧹 Banco limpo!');

  // 2. Criar Categorias
  const categoriasData = [
    { nome_categoria: 'Hortifruti' },
    { nome_categoria: 'Padaria' },
    { nome_categoria: 'Açougue' },
    { nome_categoria: 'Bebidas' },
    { nome_categoria: 'Laticínios' },
    { nome_categoria: 'Limpeza' },
  ];

  // Criar e guardar os IDs para usar nos produtos
  const categorias = [];
  for (const cat of categoriasData) {
    const created = await prisma.categorias.create({ data: cat });
    categorias.push(created);
  }
  console.log(`✅ ${categorias.length} categorias criadas.`);

  // 3. Criar Fornecedores
  const fornecedoresData = [
    { nome: 'Fazenda Doce Mel', cnpj: '12.345.678/0001-90', cidade: 'Interior SP', telefone: '11999998888', email: 'contato@docemel.com' },
    { nome: 'Panificadora Central', cnpj: '98.765.432/0001-10', cidade: 'Capital SP', telefone: '1133334444', email: 'pedidos@pancentral.com' },
    { nome: 'Frigorífico Boi Bravo', cnpj: '11.222.333/0001-44', cidade: 'Goiás', telefone: '62988887777', email: 'vendas@boibravo.com' },
    { nome: 'Distribuidora Clean', cnpj: '55.444.333/0001-22', cidade: 'Rio de Janeiro', telefone: '21977776666', email: 'sac@clean.com' },
  ];

  const fornecedores = [];
  for (const forn of fornecedoresData) {
    const created = await prisma.fornecedores.create({ data: forn });
    fornecedores.push(created);
  }
  console.log(`✅ ${fornecedores.length} fornecedores criados.`);

  // 4. Criar Produtos
  const produtosData = [
    { nome: 'Maçã Gala', descricao: 'Maçã vermelha e doce', preco_venda: 8.99, estoque: 150, imagem: 'https://placehold.co/400x300?text=Maca', id_categoria: categorias[0].id_categoria }, // Hortifruti
    { nome: 'Banana Prata', descricao: 'Banana madura', preco_venda: 5.99, estoque: 200, imagem: 'https://placehold.co/400x300?text=Banana', id_categoria: categorias[0].id_categoria },
    { nome: 'Pão Francês', descricao: 'Pão quentinho', preco_venda: 0.80, estoque: 500, imagem: 'https://placehold.co/400x300?text=Pao', id_categoria: categorias[1].id_categoria }, // Padaria
    { nome: 'Leite Integral 1L', descricao: 'Leite de caixinha', preco_venda: 4.50, estoque: 100, imagem: 'https://placehold.co/400x300?text=Leite', id_categoria: categorias[4].id_categoria }, // Laticinios
    { nome: 'Picanha Bovina', descricao: 'Peça de 1kg', preco_venda: 89.90, estoque: 30, imagem: 'https://placehold.co/400x300?text=Picanha', id_categoria: categorias[2].id_categoria }, // Açougue
    { nome: 'Detergente Neutro', descricao: '500ml', preco_venda: 2.99, estoque: 300, imagem: 'https://placehold.co/400x300?text=Detergente', id_categoria: categorias[5].id_categoria }, // Limpeza
    { nome: 'Coca-Cola 2L', descricao: 'Refrigerante', preco_venda: 9.90, estoque: 120, imagem: 'https://placehold.co/400x300?text=Coca', id_categoria: categorias[3].id_categoria }, // Bebidas
  ];

  const produtos = [];
  for (const prod of produtosData) {
    const created = await prisma.produtos.create({ data: prod });
    produtos.push(created);
  }
  console.log(`✅ ${produtos.length} produtos criados.`);

  // 5. Criar Clientes
  const clientesData = [
    { nome: 'Cliente Teste', cpf: '111.111.111-11', email: 'cliente@teste.com', senha: '123', telefone: '11999990000', endereco: 'Rua A, 123' },
    { nome: 'Maria Silva', cpf: '222.222.222-22', email: 'maria@email.com', senha: '123', telefone: '11988880000', endereco: 'Av Paulista, 1000' },
    { nome: 'João Souza', cpf: '333.333.333-33', email: 'joao@email.com', senha: '123', telefone: '11977770000', endereco: 'Rua Augusta, 500' },
  ];

  const clientes = [];
  for (const cli of clientesData) {
    const created = await prisma.clientes.create({ data: cli });
    clientes.push(created);
  }
  console.log(`✅ ${clientes.length} clientes criados.`);

  // 6. Criar Administradores
  await prisma.administradores.create({
    data: {
      nome: 'Admin Principal',
      email: 'admin@freshness.com',
      senha: 'admin',
      cpf: '000.000.000-00',
      telefone: '000000000',
      endereco: 'Sede Administrativa',
      data_nascimento: new Date('1990-01-01'),
    }
  });
  console.log(`✅ Administrador criado.`);

  // 7. Criar Vendas e Itens (Histórico)
  // Vamos criar algumas vendas para gerar dados para o Power BI
  const metodos = ['credit', 'debit', 'pix'];
  const statusVenda = ['ENTREGUE', 'A_CAMINHO', 'PENDENTE', 'EM_PREPARACAO'];

  for (let i = 0; i < 15; i++) {
    // Escolhe cliente aleatório
    const cliente = clientes[Math.floor(Math.random() * clientes.length)];
    
    // Cria venda
    const venda = await prisma.vendas.create({
      data: {
        id_cliente: cliente.id_cliente,
        data_venda: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 30))), // Data aleatória nos últimos 30 dias
        total_venda: 0, // Será atualizado
        metodo_pagamento: metodos[Math.floor(Math.random() * metodos.length)],
        status: statusVenda[Math.floor(Math.random() * statusVenda.length)],
      }
    });

    let total = 0;
    // Adiciona 1 a 4 itens aleatórios na venda
    const qtdItens = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < qtdItens; j++) {
      const produto = produtos[Math.floor(Math.random() * produtos.length)];
      const quantidade = Math.floor(Math.random() * 5) + 1;
      const subtotal = Number(produto.preco_venda) * quantidade;
      
      await prisma.itens_venda.create({
        data: {
          id_venda: venda.id_venda,
          id_produto: produto.id_produto,
          quantidade: quantidade,
          preco_unitario_venda: produto.preco_venda
        }
      });
      total += subtotal;
    }

    // Atualiza o total da venda
    await prisma.vendas.update({
      where: { id_venda: venda.id_venda },
      data: { total_venda: total }
    });
  }
  console.log(`✅ 15 Vendas com itens criadas.`);

  // 8. Criar Tarefas
  await prisma.tarefas.createMany({
    data: [
      { descricao: 'Verificar validade do leite', concluida: false },
      { descricao: 'Ligar para fornecedor de bebidas', concluida: true },
      { descricao: 'Organizar estoque do hortifruti', concluida: false },
      { descricao: 'Atualizar preços da padaria', concluida: false },
    ]
  });
  console.log(`✅ Tarefas criadas.`);

  console.log('🎉 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });