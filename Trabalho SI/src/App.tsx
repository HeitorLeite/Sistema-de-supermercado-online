import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  ChevronDown, 
  Menu,
  ShieldCheck,
  Package,
  Truck // Ícone para compras
} from "lucide-react";

// Componentes
import Login from "./app/modules/login/Login";
import Register from "./app/modules/register/Register";
import Home from "./app/modules/home/Home";
import Promotion from "./app/modules/admin/promotion/Promotion";
import Products from "./app/modules/admin/products/Products";
import Purchases from "./app/modules/admin/purchases/Purchases"; // NOVO IMPORT
import Buys from "./app/modules/buys/Buys";
import Profile from "./app/modules/profile/Profile";
import Sacola from "./app/modules/sacola/Sacola";
import Checkout from "./app/modules/checkout/Checkout";
import { CartProvider, useCart } from './app/context/CartContext'; 

import logo from "./assets/img/logo_4.png";
import api from "./services/api";

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
};

type Usuario = {
  id_cliente?: number;
  id_adm?: number;
  nome: string;
  email: string;
};

// --- Componente de Navegação ---
function Navigation() {
  const navigate = useNavigate();
  const { totalItems } = useCart(); 
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [menuCategoriasOpen, setMenuCategoriasOpen] = useState(false);
  const [menuAdminOpen, setMenuAdminOpen] = useState(false);
  const [menuProfileOpen, setMenuProfileOpen] = useState(false);
  const [menuMobile, setMenuMobile] = useState(false);
  const [openContactModal, setOpenContactModal] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data } = await api.get("/categorias");
        setCategorias(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    const carregarUsuario = () => {
      const userJson = localStorage.getItem("usuario");
      if (userJson) {
        try {
          const userObj = JSON.parse(userJson);
          setUsuario(userObj);
          if (userObj.id_adm || userObj.email.includes('admin')) {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Erro ao ler usuário", e);
        }
      }
    };

    fetchCategorias();
    carregarUsuario();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("cart_items");
    navigate("/login");
    window.location.reload();
  };

  const navLinkStyle = "text-white font-medium hover:text-blue-200 transition-colors duration-200 px-3 py-2 rounded-md text-sm flex items-center gap-2";
  const dropdownItemStyle = "block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer w-full text-left";

  return (
    <>
      <nav className="bg-gradient-to-r from-[#0B4878] via-[#2F6FA0] to-[#78A9C9] fixed top-0 left-0 w-full z-50 shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate("/home")}>
              <img src={logo} alt="Freshness" className="h-14 w-auto hover:opacity-90 transition" />
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <div className="relative group">
                <button
                  className={`${navLinkStyle} bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10`}
                  onMouseEnter={() => setMenuCategoriasOpen(true)}
                  onClick={() => setMenuCategoriasOpen(!menuCategoriasOpen)}
                >
                  <Menu size={18} />
                  Categorias
                  <ChevronDown size={14} className={`transform transition-transform ${menuCategoriasOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuCategoriasOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setMenuCategoriasOpen(false)}
                  >
                    {categorias.map((cat) => (
                      <Link 
                        key={cat.id_categoria}
                        to={`/buys?categoria=${encodeURIComponent(cat.nome_categoria)}`}
                        className={dropdownItemStyle}
                        onClick={() => setMenuCategoriasOpen(false)}
                      >
                        {cat.nome_categoria}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/home" className={navLinkStyle}>Home</Link>
              <Link to="/buys" className={navLinkStyle}>Produtos</Link>
              
              {isAdmin && (
                <div className="relative group">
                  <button
                    className={`${navLinkStyle} text-yellow-300 hover:text-yellow-100`}
                    onMouseEnter={() => setMenuAdminOpen(true)}
                    onClick={() => setMenuAdminOpen(!menuAdminOpen)}
                  >
                    <ShieldCheck size={18} />
                    Admin
                  </button>
                  {menuAdminOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                      onMouseLeave={() => setMenuAdminOpen(false)}
                    >
                      <Link to="/promotion" className={dropdownItemStyle}>Cadastrar Promoção</Link>
                      <Link to="/products" className={dropdownItemStyle}>Cadastrar Produtos</Link>
                      {/* NOVO LINK ADICIONADO AQUI */}
                      <Link to="/admin/purchases" className={dropdownItemStyle}>Comprar Produtos</Link>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setOpenContactModal(true)} className={navLinkStyle}>Contato</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/10 relative">
                <Link to="/sacola" className="p-2 text-white hover:text-green-300 transition relative" title="Sacola">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-[#0B4878]">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>

              <div 
                className="relative ml-2"
                onMouseEnter={() => setMenuProfileOpen(true)}
                onMouseLeave={() => setMenuProfileOpen(false)}
              >
                <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white text-blue-900 shadow-md hover:shadow-lg transition-all border border-blue-100 group">
                  <div className="bg-blue-100 p-1.5 rounded-full group-hover:bg-blue-200 transition">
                    <User size={20} className="text-blue-700" />
                  </div>
                  <div className="flex flex-col items-start mr-1">
                    <span className="text-xs text-gray-500 font-medium leading-none mb-0.5">Olá,</span>
                    <span className="text-sm font-bold leading-none max-w-[100px] truncate">
                      {usuario ? usuario.nome.split(' ')[0] : 'Visitante'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {menuProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <p className="text-sm text-gray-500">Logado como</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{usuario?.email}</p>
                    </div>
                    <Link to="/profile" className={`${dropdownItemStyle} flex items-center gap-2`}><User size={16} /> Meu Perfil</Link>
                    <Link to="/checkout" className={`${dropdownItemStyle} flex items-center gap-2`}><Package size={16} /> Meus Pedidos</Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button onClick={handleLogout} className={`${dropdownItemStyle} text-red-600 hover:bg-red-50 flex items-center gap-2`}><LogOut size={16} /> Sair</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuMobile(!menuMobile)} className="text-white hover:text-gray-200 p-2 relative">
                <Menu size={28} />
                {totalItems > 0 && (
                    <span className="absolute top-1 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {totalItems}
                    </span>
                  )}
              </button>
            </div>
          </div>
        </div>

        {menuMobile && (
          <div className="md:hidden bg-[#0B4878] text-white px-4 pt-2 pb-6 shadow-inner space-y-3">
            <Link to="/home" className="block py-2 border-b border-white/10" onClick={() => setMenuMobile(false)}>Home</Link>
            <Link to="/buys" className="block py-2 border-b border-white/10" onClick={() => setMenuMobile(false)}>Produtos</Link>
            {isAdmin && (
               <Link to="/admin/purchases" className="block py-2 border-b border-white/10 text-yellow-300" onClick={() => setMenuMobile(false)}>Comprar Produtos (Admin)</Link>
            )}
            <Link to="/sacola" className="block py-2 border-b border-white/10 flex justify-between" onClick={() => setMenuMobile(false)}>
              Minha Sacola <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">{totalItems}</span>
            </Link>
            <Link to="/checkout" className="block py-2 border-b border-white/10" onClick={() => setMenuMobile(false)}>Meus Pedidos</Link>
            <button onClick={handleLogout} className="w-full mt-4 bg-red-600/80 py-2 rounded text-center font-bold">Sair</button>
          </div>
        )}
      </nav>

      {openContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border-t-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Entre em Contato</h3>
            <div className="space-y-3 text-gray-600">
              <p>📧 suporte@freshness.com</p>
              <p>📞 (11) 99999-8888</p>
            </div>
            <button onClick={() => setOpenContactModal(false)} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const isLogged = !!localStorage.getItem("token");

  if (!isLogged) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <div className="flex-grow">
        <CartProvider>
          <Navigation />
          <div className="pt-24">
            <Routes>
              <Route path="/login" element={<Navigate to="/home" replace />} />
              <Route path="/register" element={<Navigate to="/home" replace />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              <Route path="/home" element={<Home />} />
              <Route path="/promotion" element={<Promotion />} />
              <Route path="/products" element={<Products />} />
              
              {/* NOVA ROTA */}
              <Route path="/admin/purchases" element={<Purchases />} />
              
              <Route path="/buys" element={<Buys />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/sacola" element={<Sacola />} />
              <Route path="/checkout" element={<Checkout />} />
              
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </CartProvider>
      </div>

      <footer className="bg-gradient-to-br from-[#0B4878] to-[#062c4d] text-white py-12 mt-auto border-t-4 border-green-500">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <p>© {new Date().getFullYear()} Freshness Supermercado.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;