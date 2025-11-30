import "./Home.scss";
import banner from "../../../assets/img/banner.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react"; // Novos ícones
import api from "../../../services/api.ts";
import { useCart } from "../../context/CartContext";

// Importação das imagens das categorias
import hort from "../../../assets/img/hortifruit.png";
import carnes from "../../../assets/img/carnes.png";
import padaria from "../../../assets/img/padaria.png";
import peixes from "../../../assets/img/peixes.png";
import congelados from "../../../assets/img/congelados.png";
import frios from "../../../assets/img/frios.png";
import lati from "../../../assets/img/lati.png";
import confeitaria from "../../../assets/img/confeitaria.png";
import bebidas from "../../../assets/img/bebidas.png";
import higiene from "../../../assets/img/higiene.png";
import bebe from "../../../assets/img/bebe.png";
import limpeza from "../../../assets/img/limpeza.png";

type ProdutoAPI = {
  id_produto: number;
  nome: string;
  preco_venda: number;
  preco_original?: number;
  imagem: string;
  promocao: boolean;
  descricao?: string;
  categoria?: { nome_categoria: string };
  estoque: number;
};

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
};

const categoriaImagens: Record<string, string> = {
  Hortifruti: hort,
  Padaria: padaria,
  Açougue: carnes,
  Peixaria: peixes,
  Congelados: congelados,
  Frios: frios,
  Laticínios: lati,
  Confeitaria: confeitaria,
  Bebidas: bebidas,
  Higiene: higiene,
  Bebê: bebe,
  Limpeza: limpeza,
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

// --- CONTROLE DE QUANTIDADE ---
const QuantityControl = ({ 
  product, 
  addToCart, 
  onShowToast 
}: { 
  product: ProdutoAPI, 
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
        className="bg-white border border-blue-500 text-blue-500 rounded-full h-7 w-7 flex items-center justify-center hover:bg-blue-100 transition text-xl font-bold p-0 leading-none shadow-sm"
      >
        −
      </button>
      <span className="text-sm font-bold text-center text-gray-700 mx-1">{quantity}</span>
      <button 
        onClick={handleIncrement}
        className={`rounded-full h-7 w-7 flex items-center justify-center transition text-xl font-bold p-0 leading-none shadow-sm ${quantity >= product.estoque ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
      >
        +
      </button>
      <button
        onClick={handleAddToCart}
        disabled={product.estoque <= 0}
        className={`rounded-full h-8 w-8 flex items-center justify-center transition shadow-md ml-2 flex-shrink-0 ${product.estoque <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        title="Adicionar à Sacola"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

// --- PÁGINA HOME ---
export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [promos, setPromos] = useState<ProdutoAPI[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  
  // Estado para Notificações
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };
  
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoadingPromos(true);
        setLoadingCategorias(true);

        const [resCat, resProd] = await Promise.all([
          api.get("/categorias"),
          api.get("/produtos")
        ]);

        setCategorias(resCat.data);

        // Filtra apenas produtos em promoção
        const produtos: ProdutoAPI[] = resProd.data;
        const promosAtivas = produtos.filter((p) => !!p.promocao);
        setPromos(promosAtivas);

      } catch (error) {
        console.error("Erro ao buscar dados da home:", error);
        showNotification("Erro ao carregar promoções. Tente atualizar a página.", "error");
      } finally {
        setLoadingPromos(false);
        setLoadingCategorias(false);
      }
    };

    fetchDados();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-12 relative">
      
      {/* Toast Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* --- BANNER --- */}
      <div className="w-full relative shadow-lg">
        <img
          src={banner}
          alt="Ofertas Frescas"
          className="w-full h-auto max-h-[300px] md:max-h-[450px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-10">
          <h1 className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg text-center px-4">
            Qualidade e Frescor na sua Mesa
          </h1>
        </div>
      </div>

      {/* --- PROMOÇÕES --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 mb-2">
            Ofertas da Semana
          </h2>
          <p className="text-gray-500">Aproveite os melhores preços selecionados para você</p>
        </div>

        {loadingPromos ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <Info className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma promoção ativa no momento. Confira nossos outros produtos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {promos.map((product) => (
              <div 
                key={product.id_produto} 
                className="bg-white rounded-xl shadow-lg p-4 transition duration-300 transform hover:scale-[1.02] flex flex-col border border-gray-100 hover:border-blue-300 relative group"
              >
                {/* Tag de Desconto */}
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10 shadow-md">
                  OFERTA
                </div>

                {/* Esgotado Overlay */}
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
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/128x128/f0f0f0/333?text=Oferta` }}
                    />
                  </div>
                </div>

                <div className="flex-grow pt-2">
                  <p className="font-bold text-base text-gray-900 mb-1 line-clamp-2 leading-tight h-10" title={product.nome}>
                    {product.nome}
                  </p>
                  <p className="text-xs text-gray-500 mb-2 leading-snug line-clamp-2 h-8">
                    {product.descricao || 'Produto em promoção especial.'}
                  </p>
                  
                  {product.categoria && (
                    <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
                      {product.categoria.nome_categoria}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xl font-extrabold text-green-600">
                      R$ {Number(product.preco_venda).toFixed(2)}
                    </p>
                    {/* Preço "de" fictício para efeito visual de promoção */}
                    <p className="text-xs text-red-400 line-through">
                      R$ {(Number(product.preco_venda) * 1.2).toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Controle de Quantidade */}
                  <QuantityControl 
                    product={product} 
                    addToCart={addToCart} 
                    onShowToast={showNotification}
                  />
                  
                  <div className={`mt-2 text-[10px] text-right ${product.estoque < 5 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {product.estoque > 0 ? `Restam ${product.estoque} un.` : 'Indisponível'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CATEGORIAS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4">
            Categorias
          </h2>
          <div className="flex gap-2">
            <button onClick={scrollLeft} className="p-2 rounded-full bg-white shadow hover:bg-gray-100 text-blue-600 transition">
              ◀
            </button>
            <button onClick={scrollRight} className="p-2 rounded-full bg-white shadow hover:bg-gray-100 text-blue-600 transition">
              ▶
            </button>
          </div>
        </div>

        <div className="relative w-full">
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto scroll-smooth py-4 px-2 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loadingCategorias && (
               <div className="flex gap-4 w-full">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="min-w-[140px] h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
                 ))}
               </div>
            )}

            {!loadingCategorias && categorias.length === 0 && (
               <p className="text-gray-500 italic px-4">Nenhuma categoria encontrada.</p>
            )}

            {!loadingCategorias && categorias.map((categoria) => {
              const imagem = categoriaImagens[categoria.nome_categoria] || "https://cdn-icons-png.flaticon.com/512/565/565547.png";

              return (
                <div
                  key={categoria.id_categoria}
                  onClick={() => navigate(`/buys?categoria=${encodeURIComponent(categoria.nome_categoria)}`)}
                  className="
                    min-w-[140px] h-40 
                    bg-white rounded-2xl shadow-md border border-gray-100
                    flex flex-col items-center justify-center gap-3
                    cursor-pointer transition-all duration-300
                    hover:shadow-xl hover:-translate-y-1 hover:border-blue-200
                    group
                  "
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition duration-300 transform group-hover:scale-110">
                    <img
                      src={imagem}
                      alt={categoria.nome_categoria}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 text-center px-2 transition-colors">
                    {categoria.nome_categoria}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}