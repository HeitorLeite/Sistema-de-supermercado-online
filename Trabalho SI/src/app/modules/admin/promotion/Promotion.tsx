import { useState, useEffect } from "react";
import api from "../../../../services/api";

// Definição de tipos, adaptada para o uso no Canvas
type Produto = {
  id_produto: number;
  nome: string;
  preco_venda: string | number;
  imagem: string;
  promocao: boolean;
  descricao?: string;
  id_categoria: number;
  estoque: number;
};

type Promo = {
  id_produto: number;
  nome: string;
  preco_promocao: string;
  imagem_promocao: string;
};

// using the shared api instance; we removed the local mock

function Promotion() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("");
  const [precoPromocao, setPrecoPromocao] = useState("");
  const [imagemPromocao, setImagemPromocao] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      setErro(""); // Limpa erro anterior
      const response = await api.get("/produtos");
      const allProducts: Produto[] = response.data;
      setProdutos(allProducts);

      const promoAtivas = allProducts
        .filter((p: Produto) => p.promocao)
        .map((p: Produto) => ({
          id_produto: p.id_produto,
          nome: p.nome,
          // Garante que preco_venda é uma string para preco_promocao
          preco_promocao: String(p.preco_venda), 
          imagem_promocao: p.imagem,
        }));
      setPromos(promoAtivas);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setErro("Erro ao carregar produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const adicionarPromo = async () => {
    if (!produtoSelecionado || !precoPromocao || !imagemPromocao) {
      setErro("Preencha todos os campos!");
      return;
    }

    try {
      const produto = produtos.find(
        (p) => p.id_produto === parseInt(produtoSelecionado)
      );

      if (!produto) {
        setErro("Produto não encontrado!");
        return;
      }

      // Preço de venda é o novo preço de promoção
      await api.put(`/produtos/${produto.id_produto}`, {
        nome: produto.nome,
        descricao: produto.descricao,
        id_categoria: produto.id_categoria,
        preco_venda: parseFloat(precoPromocao), // Atualiza o preço de venda para ser o de promoção
        estoque: produto.estoque,
        imagem: imagemPromocao, // Atualiza a imagem para ser a de promoção (se houver)
        promocao: true,
      });

      const novaPromo: Promo = {
        id_produto: produto.id_produto,
        nome: produto.nome,
        preco_promocao: precoPromocao,
        imagem_promocao: imagemPromocao,
      };

      setPromos([...promos, novaPromo]);

      setProdutos(
        produtos.map((p) =>
          p.id_produto === produto.id_produto ? { ...p, promocao: true, preco_venda: parseFloat(precoPromocao), imagem: imagemPromocao } : p
        )
      );

      setProdutoSelecionado("");
      setPrecoPromocao("");
      setImagemPromocao("");
      setErro("");
    } catch (error) {
      console.error("Erro ao criar promoção:", error);
      setErro("Erro ao criar promoção. Tente novamente.");
    }
  };

  const removerPromo = async (promoId: number) => {
    try {
      const produtoOriginal = produtos.find((p) => p.id_produto === promoId);

      if (!produtoOriginal) return;

      // NOTE: Aqui, idealmente, você reverteria o preço e a imagem para os valores ANTES da promoção.
      // Como não temos o histórico, vamos apenas desativar a flag 'promocao' e manter o preço atual como o 'preco_venda'.
      await api.put(`/produtos/${promoId}`, {
        ...produtoOriginal, // Mantém o estado atual (incluindo preco_venda e imagem)
        promocao: false, // Desativa a promoção
      });

      setPromos(promos.filter((p) => p.id_produto !== promoId));

      setProdutos(
        produtos.map((p) =>
          p.id_produto === promoId ? { ...p, promocao: false } : p
        )
      );

      setErro("");
    } catch (error) {
      console.error("Erro ao remover promoção:", error);
      setErro("Erro ao remover promoção. Tente novamente.");
    }
  };

  return (
    <div className="mt-30 min-h-screen bg-gray-50 p-4 sm:p-10 font-sans">
      {/* Formulário de Criação de Promoção */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl mx-auto border-t-8 border-blue-600/80 transform hover:shadow-blue-300/50 transition duration-500">
        
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 border-b pb-3 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-9a1 1 0 000 2h14a1 1 0 000-2H3z" clipRule="evenodd" />
          </svg>
          Criar Nova Promoção
        </h2>

        <div className="space-y-4">
          
          {/* Mantenho o vermelho para erro por convenção de UX */}
          {erro && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              🚨 {erro}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-6">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-center text-gray-600">Carregando produtos...</p>
            </div>
          ) : (
            <>
              {/* Seleção de Produto */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Selecione um Produto
                </label>
                <select
                  value={produtoSelecionado}
                  onChange={(e) => {
                    setProdutoSelecionado(e.target.value);
                    setErro("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white appearance-none pr-10 text-gray-700"
                >
                  <option value="">-- Escolha um produto não promocional --</option>
                  {produtos
                    .filter((p) => !p.promocao)
                    .map((produto) => (
                      <option
                        key={produto.id_produto}
                        value={produto.id_produto}
                      >
                        {produto.nome} (Preço Base: R$ {parseFloat(String(produto.preco_venda)).toFixed(2)})
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-4 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              {/* Preço de Promoção */}
              <input
                type="number"
                value={precoPromocao}
                onChange={(e) => {
                    setPrecoPromocao(e.target.value);
                    setErro("");
                }}
                placeholder="💰 Novo Preço de Promoção (ex: 12.50)"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              />

              {/* URL da Imagem de Promoção */}
              <input
                type="url"
                value={imagemPromocao}
                onChange={(e) => {
                    setImagemPromocao(e.target.value);
                    setErro("");
                }}
                placeholder="🖼️ URL da Imagem de Destaque da Promoção"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              />

              {/* Botão de Ação: Gradiente Azul/Ciano */}
              <button
                onClick={adicionarPromo}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-cyan-800 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01]"
              >
                Ativar Promoção
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lista de Promoções Ativas */}
      <div className="mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-extrabold text-gray-800 border-b-4 border-blue-500/50 pb-3 mb-8 text-center flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          Promoções Ativas ({promos.length})
        </h3>

        {promos.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center bg-white p-10 rounded-xl shadow-lg mt-12 max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M16 12h1m-1.636 4.364l.707.707M4 12H3m1.636-4.364l-.707-.707M10 21v-1m4-4h.01M17 14h.01M7 14h.01M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m0 0V4m0 0V3M6 12H5m1.636 4.364l-.707-.707" />
            </svg>
            <p className="text-center text-gray-600 font-medium mt-2">
              Nenhuma promoção cadastrada ainda. Use o formulário acima para criar uma!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {promos.map((promo) => (
              <div
                key={promo.id_produto}
                className="bg-white rounded-xl shadow-lg p-5 transition duration-300 hover:shadow-2xl hover:border-blue-500 border border-gray-100 flex flex-col space-y-4 relative overflow-hidden group"
              >
                
                {/* Etiqueta de Promoção em Azul */}
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  🔥 PROMO
                </div>

                <div className="flex justify-center h-48 overflow-hidden rounded-xl border-2 border-blue-100">
                  <img
                    src={promo.imagem_promocao}
                    alt={promo.nome}
                    className="w-full h-full object-cover transition duration-500 transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x300/e0f2f1/064e3b?text=OFF"; // Placeholder com tons de azul/ciano
                      (e.target as HTMLImageElement).onerror = null; 
                    }}
                  />
                </div>

                <div className="flex-grow">
                  <p className="font-semibold text-xl text-gray-900 leading-tight truncate">
                    {promo.nome}
                  </p>
                  <p className="text-sm text-blue-500 mt-1 font-medium">Preço Promocional:</p>
                  <p className="text-3xl font-black text-blue-600">
                    R$ {parseFloat(promo.preco_promocao).toFixed(2)}
                  </p>
                </div>

                {/* Botão de Encerrar Promoção em tom de Azul */}
                <button
                  onClick={() => removerPromo(promo.id_produto)}
                  className="mt-4 bg-gray-200 text-gray-700 p-3 rounded-xl text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition duration-200 border-2 border-transparent hover:border-blue-300"
                >
                  Encerrar Promoção
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Promotion;