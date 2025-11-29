import "./Home.scss"; 
import banner from "../../../assets/img/banner.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api.ts";
import { useCart } from "../../context/CartContext";
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
// promo placeholder images removed: products will provide images via API

type ProdutoAPI = {
  id_produto: number;
  nome: string;
  preco_venda: number;
  preco_original: number; 
  imagem: string;
  promocao: boolean;
};

type Promo = {
  id_produto: number;
  nome: string;
  preco_venda: number;
  preco_original?: number;
  imagem: string;
};

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
};

// Promo list will be fetched from the API based on each product's `promocao` flag

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

export default function Home() {
  console.debug('[Home] render');
  const navigate = useNavigate();
  const [promos, setPromos] = useState<Promo[]>([]);
  const { addToCart } = useCart();
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
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
    console.debug('[Home] useEffect fetchCategorias');
    const fetchCategorias = async () => {
      try {
        const response = await api.get("/categorias");
        setCategorias(response.data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoadingPromos(true);
        const response = await api.get("/produtos");
        const produtos: ProdutoAPI[] = response.data;
        const promosAtivas: Promo[] = produtos
          .filter((p) => !!p.promocao)
            .map((p) => ({
            id_produto: p.id_produto,
            nome: p.nome,
            preco_venda: Number(String(p.preco_venda)),
            preco_original:
              p.preco_original !== undefined && p.preco_original !== null
                ? Number(String(p.preco_original))
                : Number(String(p.preco_venda)),
            imagem: p.imagem,
          }));

        setPromos(promosAtivas);
      } catch (error) {
        console.error("Erro ao buscar promoções:", error);
      }
      finally {
        setLoadingPromos(false);
      }
    };

    fetchPromos();
  }, []);

  return (
    <div className="background">
      
      <div className="mt-24 flex items-center">
        <img
          src={banner}
          alt="banner"
          className="w-full h-auto max-h-[350px] md:max-h-[550px] object-cover shadow-xl"
        />
      </div>

      <div className="p-8">
        <p 
          className="text-center text-4xl md:text-5xl lg:text-7xl font-bold font-sans mx-auto pb-20"
          style={{
            backgroundImage: "linear-gradient(to right, #20c997, #007bff)", 
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          PROMOÇÃO DA SEMANA
        </p>

        <div className="
          grid grid-cols-1 gap-8 p-4
          md:grid-cols-2 
          lg:grid-cols-3
          xl:grid-cols-4
          mx-auto max-w-7xl
        ">
          {loadingPromos && (
            <p className="text-gray-500 col-span-full text-center">Carregando promoções...</p>
          )}

          {!loadingPromos && promos.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">Nenhuma promoção cadastrada ainda.</p>
          )}

          {promos.map((promo) => {
            const desconto = promo.preco_original && promo.preco_original > promo.preco_venda ? 100 - (promo.preco_venda / promo.preco_original) * 100 : 0;

            return (
              <div key={promo.id_produto} className="w-full relative justify-self-center max-w-sm">
                {desconto > 0 && (
                  <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    {desconto.toFixed(0)}% OFF
                  </div>
                )}
                
                <div className="
                  bg-white/40             
                  backdrop-blur-md       
                  rounded-3xl            
                  shadow-xl              
                  p-6 pt-20              
                  flex flex-col
                  items-center
                  text-center
                  h-full
                ">
                  <div className="
                    absolute -top-10     
                    w-32 h-32            
                    rounded-full
                    p-2                 
                    bg-white
                    shadow-2xl
                  ">
                    <img 
                      src={promo.imagem} 
                      alt={promo.nome} 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/150x150/e0e0e0/333?text=Imagem";
                        (e.target as HTMLImageElement).onerror = null;
                      }}
                    />
                  </div>

                  <h3 className="text-xl font-bold mt-2 text-gray-800 break-words">{promo.nome}</h3>
                  <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden">
                    Aproveite este produto em oferta!
                  </p>
                  
                  <div className="flex flex-col items-center">
                    {desconto > 0 && promo.preco_original && (
                      <span className="text-xs text-red-500 line-through">
                        R$ {(Number(promo.preco_original) || 0).toFixed(2)}
                      </span>
                    )}
                    <span className="text-3xl font-extrabold text-green-600">
                      R$ {(Number(promo.preco_venda) || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        try {
                          const resp = await addToCart(promo.id_produto, 1);
                          if (!resp.success) {
                            console.error(resp.message);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="!bg-blue-500/80 hover:bg-orange-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition shadow-lg"
                    >
                      <span className="text-2xl">+</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>


      <div 
        className="
          mx-auto max-w-7xl
          p-8 mt-10 mb-20
          bg-white/30            
          backdrop-blur-xl        
          border border-white/60  
          rounded-3xl             
          shadow-2xl              
        "
      >
        <div className="flex items-center gap-6 px-4 mt-2 justify-center pb-5">
          <p className="category-title-styled text-4xl md:text-5xl lg:text-7xl font-bold"> 
            CATEGORIAS
          </p>
        </div>

        <div className="relative w-full mt-6 px-6">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full z-10 carousel-arrow"
          >
            ◀
          </button>

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scroll-smooth py-6 px-4 no-scrollbar"
          >
            {loadingCategorias && (
              <p className="text-gray-500">Carregando categorias...</p>
            )}

            {!loadingCategorias && categorias.length === 0 && (
              <p className="text-gray-500">Nenhuma categoria cadastrada ainda.</p>
            )}

            {!loadingCategorias &&
              categorias.map((categoria) => {
                const imagem =
                  categoriaImagens[categoria.nome_categoria] ||
                  "https://cdn-icons-png.flaticon.com/512/565/565547.png";

                return (
                  <div
                    key={categoria.id_categoria}
                    className="
                      relative w-40 h-56 rounded-t-[80px] rounded-b-2xl p-4
                      flex-shrink-0 cursor-pointer 
                      category-card 
                    "
                  >
                    <div className="-mt-12 mx-auto w-20 h-20 rounded-full overflow-hidden shadow-lg bg-white">
                      <img
                        src={imagem}
                        alt={categoria.nome_categoria}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    <div className="mt-5 text-center text-white font-semibold text-lg break-words">
                      {categoria.nome_categoria}
                    </div>

                    <button 
                      onClick={() => navigate(`/buys?categoria=${encodeURIComponent(categoria.nome_categoria)}`)}
                      className="
                        mt-4 bg-white px-4 py-1 rounded-full text-sm shadow
                        category-card-button
                      "
                    >
                      Ver produtos
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full z-10 carousel-arrow"
          >
            ▶
          </button>
        </div>
      </div>

    </div>
  );
}
