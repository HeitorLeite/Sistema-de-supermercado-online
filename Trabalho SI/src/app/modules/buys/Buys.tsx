import { useMemo, useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import { useSearchParams } from "react-router-dom";

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
};

type Product = {
  id_produto: number;
  nome: string;
  preco_venda: number;
  imagem: string;
  descricao: string;
  estoque: number;
  categoria: {
    id_categoria: number;
    nome_categoria: string;
  };
};


// using global api client

const QuantityControl = ({ productId }: { productId: number }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = useCallback(() => setQuantity(q => q + 1), []);
  const handleDecrement = useCallback(() => setQuantity(q => Math.max(1, q - 1)), []);
  const handleAddToCart = useCallback(() => {
    console.log(`Adicionado ${quantity} unidade(s) do produto ${productId} à sacola.`);
  }, [quantity, productId]);

  return (
    <div className="flex items-center space-x-2 p-1 border border-blue-200 rounded-full bg-blue-50 w-full justify-between">
      <button 
        onClick={handleDecrement}
        className="!bg-white border border-blue-500 text-blue-500 rounded-full h-7 w-7 flex items-center justify-center hover:bg-blue-100 transition duration-150 text-xl font-bold p-0 leading-none shadow-sm"
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <span className="text-sm font-bold text-center text-gray-700 mx-1">{quantity}</span>
      <button 
        onClick={handleIncrement}
        className="!bg-blue-500 text-white rounded-full h-7 w-7 flex items-center justify-center hover:bg-blue-600 transition duration-150 text-xl font-bold p-0 leading-none shadow-sm"
        aria-label="Aumentar quantidade"
      >
        +
      </button>
      <button
        onClick={handleAddToCart}
        className="!bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-blue-700 transition duration-150 shadow-md ml-2 flex-shrink-0"
        aria-label="Adicionar à Sacola"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="white" viewBox="0 0 24 24" stroke="white"></svg>
      </button>
    </div>
  );
};

function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/produtos"),
          api.get("/categorias")
        ]);

        // CORREÇÃO AQUI: Normalizar os dados antes de salvar no estado
        const produtosFormatados = productsResponse.data.map((p: any) => ({
          ...p,
          // Garante que é número. Se falhar, vira 0.
          preco_venda: Number(p.preco_venda) || 0 
        }));

        setProducts(produtosFormatados);
        setCategorias(categoriesResponse.data as Categoria[]);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Check query params for a category filter
  useEffect(() => {
    const categoriaParam = searchParams.get('categoria');
    if (categoriaParam) {
      setSelectedCategory(categoriaParam);
    }
  }, [searchParams]);

  const allCategories = useMemo(() => {
    const categoryNames = categorias.map(c => c.nome_categoria);
    return ['Todos', ...categoryNames];
  }, [categorias]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.categoria?.nome_categoria === selectedCategory);
    }
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [products, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div className="text-center mt-20 p-8">
        <h2 className="text-2xl font-bold text-gray-700">Carregando Catálogo...</h2>
        <p className="text-gray-500 mt-2">Por favor, aguarde.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="mt-30 text-4xl font-extrabold text-gray-900 text-center mb-10 border-b-4 border-blue-500 pb-3">
          Catálogo de Produtos
        </h1>

        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto whitespace-nowrap py-3 mb-8 border-b border-gray-200">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition duration-200 ease-in-out
                ${selectedCategory === category
                  ? '!bg-blue-600 text-white shadow-lg'
                  : '!bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                }
                mx-1 first:ml-0 flex-shrink-0
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center mt-20 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700">Nada encontrado em "{selectedCategory}"</h2>
            <p className="text-gray-500 mt-2">Tente outra categoria ou o filtro "Todos".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map(product => (
              <div 
                key={product.id_produto} 
                className="bg-white rounded-xl shadow-lg p-4 transition duration-300 transform hover:scale-[1.01] flex flex-col border border-gray-100 hover:border-blue-300 cursor-pointer"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-full h-32 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                    <img 
                      src={product.imagem} 
                      alt={product.nome} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/128x128/f0f0f0/333?text=${product.nome.substring(0, Math.min(product.nome.length, 10))}...` }}
                    />
                  </div>
                </div>

                <div className="flex-grow pt-2">
                  <p className="font-bold text-base text-gray-900 mb-1 line-clamp-2">{product.nome}</p>
                  <p className="text-xs text-gray-500 mb-2 leading-snug line-clamp-2">{product.descricao}</p>
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {product.categoria.nome_categoria}
                  </span>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <p className="text-xl font-extrabold text-blue-600 mb-2">R$ {product.preco_venda.toFixed(2)}</p>
                  <QuantityControl productId={product.id_produto} />
                  <div className="mt-2 text-xs text-right text-gray-500">
                    {product.estoque} em stock
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCatalog;
