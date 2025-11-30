import { useMemo, useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react"; // Ícones para notificações

// --- TIPOS ---
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

// --- COMPONENTE DE NOTIFICAÇÃO (TOAST) ---
const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'warning', onClose: () => void }) => {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div 
      className={`
        fixed top-24 right-5 z-[100] flex items-center p-4 mb-4 text-white rounded-lg shadow-2xl 
        animate-in slide-in-from-right-5 fade-in duration-300
        ${bgColors[type]}
      `} 
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20">
        {icons[type]}
      </div>
      <div className="ml-3 text-sm font-semibold pr-4">{message}</div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-white/20 inline-flex h-8 w-8" 
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const QuantityControl = ({ 
  product, 
  addToCart, 
  onShowToast 
}: { 
  product: Product, 
  addToCart: (id: number, qtd: number) => Promise<any>,
  onShowToast: (msg: string, type: 'success' | 'error' | 'warning') => void
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    if (quantity >= product.estoque) {
      onShowToast(`Apenas ${product.estoque} unidades disponíveis.`, 'warning');
      return;
    }
    setQuantity(q => q + 1);
  };

  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));
  
  const handleAddToCart = async () => {
    if (product.estoque <= 0) {
      onShowToast("Produto esgotado!", "error");
      return;
    }
    
    await addToCart(product.id_produto, quantity);
    onShowToast(`${quantity}x ${product.nome} adicionado à sacola!`, 'success');
    setQuantity(1); 
  };

  return (
    <div className="flex items-center space-x-2 p-1 border border-blue-200 rounded-full bg-blue-50 w-full justify-between mt-auto">
      <button 
        onClick={handleDecrement}
        className="botaoColor bg-white border border-blue-500 text-blue-500 rounded-full h-7 w-7 flex items-center justify-center hover:bg-blue-100 transition text-xl font-bold p-0 leading-none shadow-sm"
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <span className="text-sm font-bold text-center text-gray-700 mx-1">{quantity}</span>
      <button 
        onClick={handleIncrement}
        className={`botaoColor rounded-full h-7 w-7 flex items-center justify-center transition text-xl font-bold p-0 leading-none shadow-sm ${quantity >= product.estoque ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
      <button
        onClick={handleAddToCart}
        disabled={product.estoque <= 0}
        className={`rounded-full h-8 w-8 flex items-center justify-center transition shadow-md ml-2 flex-shrink-0 ${product.estoque <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        aria-label="Adicionar à Sacola"
        title="Adicionar à Sacola"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
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
  
  const { addToCart } = useCart();
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/produtos"),
          api.get("/categorias")
        ]);

        const produtosFormatados = productsResponse.data.map((p: any) => ({
          ...p,
          preco_venda: Number(p.preco_venda) || 0 
        }));

        setProducts(produtosFormatados);
        setCategorias(categoriesResponse.data as Categoria[]);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        showNotification("Erro ao carregar catálogo.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-10 relative">
      
      {/* Toast Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="mt-12 text-4xl font-extrabold text-gray-900 text-center mb-10 border-b-4 border-blue-500 pb-3">
          Catálogo de Produtos
        </h1>

        {/* Barra de Pesquisa */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="🔍 Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Filtro de Categorias */}
        <div className="overflow-x-auto whitespace-nowrap py-3 mb-8 border-b border-gray-200 no-scrollbar">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition duration-200 ease-in-out
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                }
                mx-1 first:ml-0 flex-shrink-0
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Estado de Carregamento */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center mt-20 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <Info className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-700">Nada encontrado</h2>
            <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou buscar por outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map(product => (
              <div 
                key={product.id_produto} 
                className="bg-white rounded-xl shadow-lg p-4 transition duration-300 transform hover:scale-[1.02] flex flex-col border border-gray-100 hover:border-blue-300 relative group"
              >
                {/* Overlay de Esgotado */}
                {product.estoque <= 0 && (
                  <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                    <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">ESGOTADO</span>
                  </div>
                )}

                <div className="flex justify-center mb-3">
                  <div className="w-full h-32 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                    <img 
                      src={product.imagem} 
                      alt={product.nome} 
                      className="w-full h-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/128x128/f0f0f0/333?text=${product.nome.substring(0, Math.min(product.nome.length, 10))}` }}
                    />
                  </div>
                </div>

                <div className="flex-grow pt-2">
                  <p className="font-bold text-base text-gray-900 mb-1 line-clamp-2 h-10 leading-tight" title={product.nome}>{product.nome}</p>
                  
                  {product.categoria && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
                      {product.categoria.nome_categoria}
                    </span>
                  )}
                  
                  <p className="text-xs text-gray-500 mb-2 leading-snug line-clamp-2 h-8" title={product.descricao}>
                    {product.descricao || 'Sem descrição.'}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <p className="text-xl font-extrabold text-blue-600 mb-2">R$ {product.preco_venda.toFixed(2)}</p>
                  
                  <QuantityControl 
                    product={product} 
                    addToCart={addToCart} 
                    onShowToast={showNotification}
                  />
                  
                  <div className={`mt-2 text-[10px] text-right ${product.estoque < 5 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {product.estoque > 0 ? `${product.estoque} em estoque` : 'Indisponível'}
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