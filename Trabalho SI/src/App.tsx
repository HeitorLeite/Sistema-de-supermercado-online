import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  ChevronDown, 
  Menu,
  ShieldCheck,
  Package
} from "lucide-react";

import Login from "./app/modules/login/Login";
import Register from "./app/modules/register/Register";
import Home from "./app/modules/home/Home";
import Promotion from "./app/modules/admin/promotion/Promotion";
import Products from "./app/modules/admin/products/Products";
import Purchases from "./app/modules/admin/purchases/Purchases";
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

  const navLinkStyle = "text-white font-medium hover:bg-white/10 transition-colors duration-200 px-3 py-2 rounded-md text-sm flex items-center gap-2 bg-transparent border-none cursor-pointer";
  const dropdownItemStyle = "block px-4 py-2 text-sm text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer w-full text-left bg-transparent";

  return (
    <>
      <nav className="bg-gradient-to-r from-[#0B4878] via-[#2F6FA0] to-[#78A9C9] fixed top-0 left-0 w-full z-50 shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate("/home")}>
              <img src={logo} alt="Freshness" className="h-14 w-auto hover:opacity-90 transition" />
            </div>

            <div className="hidden md:flex items-center space-x-1">
            
              <div 
                className="relative group"
                onMouseEnter={() => setMenuCategoriasOpen(true)}
                onMouseLeave={() => setMenuCategoriasOpen(false)}
              >
                <button
                  className={navLinkStyle}
                  onClick={() => setMenuCategoriasOpen(!menuCategoriasOpen)}
                >
                  <Menu size={18} className="text-white" />
                  Categorias
                  <ChevronDown size={14} className={`text-white transform transition-transform ${menuCategoriasOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuCategoriasOpen && (
                  <div className="absolute left-0 top-full pt-2 w-56 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-white rounded-xl shadow-2xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5">
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
                  </div>
                )}
              </div>

              <Link to="/home" className={navLinkStyle}>Home</Link>
              <Link to="/buys" className={navLinkStyle}>Produtos</Link>
              
              {isAdmin && (
                <div 
                  className="relative group"
                  onMouseEnter={() => setMenuAdminOpen(true)}
                  onMouseLeave={() => setMenuAdminOpen(false)}
                >
                  <button
                    className={`${navLinkStyle} !text-yellow-300 hover:!text-yellow-100`}
                    onClick={() => setMenuAdminOpen(!menuAdminOpen)}
                  >
                    <ShieldCheck size={18} />
                    Admin
                  </button>
                  
                  {menuAdminOpen && (
                    <div className="absolute left-0 top-full pt-2 w-56 z-50">
                      <div className="bg-white rounded-xl shadow-2xl py-2 border border-gray-100">
                        <Link to="/promotion" className={dropdownItemStyle}>Cadastrar Promoção</Link>
                        <Link to="/products" className={dropdownItemStyle}>Cadastrar Produtos</Link>
                        <Link to="/admin/purchases" className={dropdownItemStyle}>Comprar Produtos</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setOpenContactModal(true)} className={navLinkStyle}>Contato</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              
              <div className="flex items-center bg-transparent rounded-full p-1 relative">
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
                <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-transparent text-white hover:bg-white/10 transition-all group border border-transparent">
                  <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex flex-col items-start mr-1">
                    <span className="text-xs text-white/80 font-medium leading-none mb-0.5">Olá,</span>
                    <span className="text-sm font-bold leading-none max-w-[100px] truncate text-white">
                      {usuario ? usuario.nome.split(' ')[0] : 'Visitante'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-white" />
                </button>

                {menuProfileOpen && (
                  <div className="absolute right-0 top-full pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white rounded-xl shadow-2xl py-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100 mb-2">
                        <p className="text-sm text-gray-400 font-medium">Logado como</p>
                        <p className="text-sm font-bold text-blue-400 truncate">{usuario?.email}</p>
                      </div>
                      <Link to="/profile" className={`${dropdownItemStyle} flex items-center gap-2`}><User size={16} /> Meu Perfil</Link>
                      <Link to="/checkout" className={`${dropdownItemStyle} flex items-center gap-2`}><Package size={16} /> Meus Pedidos</Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                          onClick={handleLogout} 
                          className="w-full px-4 py-2 text-sm text-red-500 hover:text-red-700 flex items-center gap-2 bg-transparent transition-colors cursor-pointer text-left border-none"
                        >
                          <LogOut size={16} /> Sair
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuMobile(!menuMobile)} className="text-white hover:text-gray-200 p-2 relative bg-transparent border-none">
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
          <div className="md:hidden bg-[#0B4878] text-white px-4 pt-2 pb-6 shadow-inner space-y-3 border-t border-white/10">
            <Link to="/home" className="block py-2 border-b border-white/10 hover:text-blue-200" onClick={() => setMenuMobile(false)}>Home</Link>
            <Link to="/buys" className="block py-2 border-b border-white/10 hover:text-blue-200" onClick={() => setMenuMobile(false)}>Produtos</Link>
            {isAdmin && (
               <Link to="/admin/purchases" className="block py-2 border-b border-white/10 text-yellow-300" onClick={() => setMenuMobile(false)}>Comprar Produtos (Admin)</Link>
            )}
            <Link to="/sacola" className="block py-2 border-b border-white/10 flex justify-between hover:text-blue-200" onClick={() => setMenuMobile(false)}>
              Minha Sacola <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full text-white">{totalItems}</span>
            </Link>
            <Link to="/checkout" className="block py-2 border-b border-white/10 hover:text-blue-200" onClick={() => setMenuMobile(false)}>Meus Pedidos</Link>
            <button onClick={handleLogout} className="w-full mt-4 bg-red-600/80 text-white py-2 rounded text-center font-bold">Sair</button>
          </div>
        )}
      </nav>

      {openContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border-t-4 border-blue-500 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Entre em Contato</h3>
            <div className="space-y-3 text-gray-600">
              <p>📧 suporte@freshness.com</p>
              <p>📞 (11) 99999-8888</p>
            </div>
            <button 
              onClick={() => setOpenContactModal(false)} 
              className="mt-6 w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md"
            >
              Fechar
            </button>
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

      <footer className="bg-gradient-to-br from-[#0B4878] to-[#062c4d] text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <p>© {new Date().getFullYear()} Freshness Supermercado.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;