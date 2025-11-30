import { useState, useEffect, useMemo } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react"; // Ícones para as mensagens
import api from "../../../../services/api";

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
};

type Product = {
  id_produto: number;
  nome: string;
  preco_venda: number;
  imagem: string;
  category: string;
  descricao: string;
  estoque: number;
};

// Tipo para o estado da notificação
type NotificationType = {
  message: string;
  type: "success" | "error" | "warning";
} | null;

function ProductManagement() {
  // --- Estados de Dados ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriasDb, setCategoriasDb] = useState<Categoria[]>([]);

  // --- Estados do Formulário ---
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [descricao, setDescricao] = useState("");
  const [estoque, setEstoque] = useState("");

  // --- Estado de UI (Notificações) ---
  const [notification, setNotification] = useState<NotificationType>(null);

  // Função para mostrar notificação e limpar após 3 segundos
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resCategorias, resProdutos] = await Promise.all([
        api.get("/categorias"),
        api.get("/produtos")
      ]);

      setCategoriasDb(resCategorias.data);

      const produtosFormatados = resProdutos.data.map((p: any) => ({
        id_produto: p.id_produto,
        nome: p.nome,
        preco_venda: Number(p.preco_venda),
        imagem: p.imagem,
        category: p.categoria ? p.categoria.nome_categoria : "Outros",
        descricao: p.descricao,
        estoque: Number(p.estoque)
      }));

      setProducts(produtosFormatados);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showNotification("Não foi possível carregar os dados do servidor.", "error");
    }
  };

  const adicionarProduto = async () => {
    if (!title || !price || !image || !descricao || !estoque || !categoryInput) {
      showNotification("Por favor, preencha todos os campos obrigatórios.", "warning");
      return;
    }

    try {
      let id_categoria: number;

      // 1. Lógica de Categoria (Existente ou Nova)
      const categoriaExistente = categoriasDb.find(
        (cat) => cat.nome_categoria.toLowerCase() === categoryInput.toLowerCase()
      );

      if (categoriaExistente) {
        id_categoria = categoriaExistente.id_categoria;
      } else {
        const resNovaCat = await api.post("/categorias", {
          nome_categoria: categoryInput,
        });
        const novaCategoria = resNovaCat.data;
        id_categoria = novaCategoria.id_categoria;
        setCategoriasDb([...categoriasDb, novaCategoria]);
      }

      // 2. Cadastro do Produto
      await api.post("/produtos", {
        nome: title,
        descricao,
        id_categoria,
        preco_venda: parseFloat(price),
        estoque: parseInt(estoque),
        imagem: image,
      });

      // 3. Sucesso
      showNotification("Produto cadastrado com sucesso!", "success");

      // Limpar campos
      setTitle("");
      setPrice("");
      setImage("");
      setDescricao("");
      setEstoque("");
      setCategoryInput("");
      
      // Recarregar lista
      const resProdutos = await api.get("/produtos");
      const produtosFormatados = resProdutos.data.map((p: any) => ({
        id_produto: p.id_produto,
        nome: p.nome,
        preco_venda: Number(p.preco_venda),
        imagem: p.imagem,
        category: p.categoria ? p.categoria.nome_categoria : "Outros",
        descricao: p.descricao,
        estoque: Number(p.estoque)
      }));
      setProducts(produtosFormatados);

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      showNotification("Erro ao cadastrar produto. Verifique os dados e tente novamente.", "error");
    }
  };

  const removerProduto = async (id: number) => {
    // Confirmação de segurança
    if (!window.confirm("Tem certeza que deseja remover este produto? Essa ação não pode ser desfeita.")) {
      return;
    }

    try {
      // Chama a API para deletar
      await api.delete(`/produtos/${id}`);

      // Atualiza a lista visualmente removendo o item deletado
      const novaLista = products.filter((p) => p.id_produto !== id);
      setProducts(novaLista);

      showNotification("Produto removido com sucesso!", "success");
    } catch (error: any) {
      console.error("Erro ao remover:", error);
      
      // Tenta pegar a mensagem de erro específica do backend (ex: erro de chave estrangeira)
      const mensagemErro = error.response?.data?.erro || "Erro ao tentar remover o produto. Verifique sua conexão.";
      
      showNotification(mensagemErro, "error");
    }
  };

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  return (
    <div className="mt-30 min-h-screen bg-gray-50 p-4 sm:p-10 font-sans relative">
      
      {/* --- COMPONENTE DE NOTIFICAÇÃO (TOAST) --- */}
      {notification && (
        <div 
          className={`
            fixed top-24 right-5 z-50 flex items-center p-4 mb-4 text-white rounded-lg shadow-2xl transition-all duration-500 ease-in-out transform translate-y-0
            ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}
          `}
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <X className="w-5 h-5" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="ml-3 text-sm font-semibold pr-4">{notification.message}</div>
          <button 
            type="button" 
            className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-white/20 inline-flex h-8 w-8" 
            onClick={() => setNotification(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- FORMULÁRIO --- */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl mx-auto border-t-8 border-blue-500/80 transform hover:shadow-blue-300/50 transition duration-500">
        
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 border-b pb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cadastrar Novo Produto
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              list="categorias-list"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Selecione ou digite uma Nova Categoria"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 placeholder-gray-400"
            />
            <datalist id="categorias-list">
              {categoriasDb.map((cat) => (
                <option key={cat.id_categoria} value={cat.nome_categoria} />
              ))}
            </datalist>
          </div>

          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Nome do Produto (ex: Maçã Gala)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição detalhada do Produto"
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
          />
          
          <div className="flex space-x-4">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Preço (ex: 15.99)"
              step="0.01"
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <input
              type="number"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              placeholder="Estoque"
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
          </div>
          
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="URL da Imagem"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />

          <button 
            onClick={adicionarProduto} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01]"
          >
            Adicionar Produto ao Catálogo
          </button>
        </div>
      </div>

      {/* --- LISTAGEM DE PRODUTOS --- */}
      <div className="mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {Object.keys(groupedProducts).length === 0 && (
          <div className="flex flex-col items-center justify-center bg-white p-10 rounded-xl shadow-lg mt-12 max-w-md mx-auto">
            <p className="text-center text-gray-600 font-medium">
              Nenhum produto cadastrado. Use o formulário acima para começar!
            </p>
          </div>
        )}

        {Object.keys(groupedProducts).map(categoryName => (
          
          <div key={categoryName} className="mb-14">
            <h3 className="text-3xl font-extrabold text-gray-800 border-b-4 border-blue-500/50 pb-3 mb-8 mt-12 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.782a1 1 0 01-.867.987l-2.01-.301A.75.75 0 007 6.03V7.25c0 .307.247.555.555.555h4.89A.75.75 0 0013 7.25v-.318c.03-.012.061-.023.091-.033l2.01.301a1 1 0 01.867.987V17.5a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 013 17.5v-13a1 1 0 01.867-.987l2.01-.301A.75.75 0 007 3.97V2.5a.5.5 0 011 0v1.47a.75.75 0 00.867.737l2.01.301A1 1 0 0112 5.218V3a1 1 0 011-1h1zM5 16h10V9H5v7z" clipRule="evenodd" />
              </svg>
              {categoryName} <span className="ml-3 text-lg font-medium text-blue-600">({groupedProducts[categoryName].length} itens)</span>
            </h3>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              
              {groupedProducts[categoryName].map(product => (

                <div 
                  key={product.id_produto} 
                  className="bg-white rounded-xl shadow-lg p-5 transition duration-300 hover:shadow-2xl hover:border-blue-500 border border-gray-100 flex flex-col space-y-4"
                >
                  
                  <div className="flex justify-center h-48 overflow-hidden rounded-xl border border-gray-100 relative group">
                    <img 
                      src={product.imagem} 
                      alt={product.nome} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null; 
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e0e0e0/5c5c5c?text=Sem+Imagem`;
                      }}
                      className="w-full h-full object-cover transition duration-500 transform hover:scale-105" 
                    />
                  </div>

                  <div className="flex-grow">
                    <p className="font-semibold text-xl text-gray-900 leading-tight truncate" title={product.nome}>{product.nome}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2" title={product.descricao}>{product.descricao || 'Sem descrição.'}</p>
                  </div>
                  
                  <div className="flex justify-between items-end border-t pt-3">
                    <p className="text-3xl font-black text-green-600">
                      R$ {product.preco_venda.toFixed(2)}
                    </p>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Est: {product.estoque}
                    </span>
                  </div>
              
                  <button
                    onClick={() => removerProduto(product.id_produto)}
                    className="mt-4 bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-md font-medium hover:bg-red-600 hover:text-white transition shadow-sm"
                  >
                    Remover Produto
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductManagement;