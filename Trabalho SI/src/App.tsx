import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./app/modules/login/Login";
import Register from "./app/modules/register/Register";
import Home from "./app/modules/home/Home";
import logo from "./assets/img/logo_4.png";
import { useState } from "react";
import Promotion from "./app/modules/admin/promotion/Promotion";
import { Link } from "react-router-dom";
import Products from "./app/modules/admin/products/Products";
import Buys from "./app/modules/buys/Buys";
import Profile from "./app/modules/profile/Profile";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Sacola from "./app/modules/sacola/Sacola";
import { CartProvider } from './app/context/CartContext';
import Checkout from "./app/modules/checkout/Checkout";

function App() {
  console.debug('[App] render');
  const [openContactModal, setOpenContactModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const isLogged = localStorage.getItem("token");
  const [menuMobile, setMenuMobile] = useState(false);

  return (
    <div className="min-h-screen flex flex-col !bg-gray-100">
      <div className="flex-grow">
        <CartProvider>
        <nav className="!bg-[linear-gradient(135deg,#0B4878,#2F6FA0,#78A9C9)] fixed top-0 left-0 w-full z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
            <div className="flex items-center mt-2">
              <img
                src={logo}
                alt="logo"
                className="w-48 h-16 md:w-60 md:h-20"
              />
            </div>

            <ul className="hidden md:flex items-center gap-8 text-sm text-gray-600">
              <li className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1 !bg-blue-100 px-3 py-2 rounded-lg hover:!bg-blue-200 transition"
                >
                  Categorias
                </button>

                {open && (
                  <ul className="absolute left-0 mt-2 w-40 !bg-white shadow-lg rounded-lg p-2 flex flex-col gap-1 z-50">
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Hortifruti
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Açougue & Peixaria
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Frios & Laticínios
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Congelados
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Padaria & Confeitaria
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Mercearia
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Bebidas
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Limpeza
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Higiene & Cuidados Pessoais
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      Pet
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link to="/home" className="!text-white hover:text-blue-300">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/buys" className="!text-white hover:text-blue-300">
                  Produtos
                </Link>
              </li>

              <li className="relative">
                <span
                  className="text-white hover:text-blue-300 cursor-pointer"
                  onClick={() => setOpenContactModal(true)}
                >
                  Contact
                </span>

                {openContactModal && (
                  <div className="absolute top-7 left-0 !bg-white border border-gray-300 shadow-lg rounded-lg p-4 w-48 z-50">
                    <p className="font-semibold mb-2">Contatos</p>
                    <p className="text-sm">📧 email@email.com</p>
                    <p className="text-sm">📞 (11) 99999-9999</p>

                    <button
                      className="mt-3 text-blue-600 text-sm hover:underline"
                      onClick={() => setOpenContactModal(false)}
                    >
                      fechar
                    </button>
                  </div>
                )}
              </li>

              <li className="relative">
                <button
                  onClick={() => setOpenAdmin(!openAdmin)}
                  className="flex items-center gap-1 !bg-blue-100 px-3 py-2 rounded-lg hover:!bg-blue-200 transition"
                >
                  Administração
                </button>

                {openAdmin && (
                  <ul className="absolute left-0 mt-2 w-40 !bg-white shadow-lg rounded-lg p-2 flex flex-col gap-1 z-50">
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      <Link to="/promotion">Cadastrar Promoção</Link>
                    </li>
                    <li className="px-3 py-2 rounded hover:!bg-gray-100 cursor-pointer">
                      <Link to="/products">Cadastrar Produtos</Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>

            <div className="hidden md:flex items-center gap-5 text-gray-500">
              <Link to="/profile">
  <button className="hover:text-blue-300">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-7 text-blue-500"
    >
      <circle cx="12" cy="7.5" r="4" />
      <path d="M5 21c0-4.5 3.5-8 7-8s7 3.5 7 8" />
    </svg>
  </button>
</Link>


              <Link to="/sacola" className="relative">
                <button className="!hover:text-blue-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 1.5 0Z"
                    />
                  </svg>
                </button>
              </Link>

              <Link to="/checkout" className="relative">
                <button className="hover:text-blue-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                </button>
              </Link>
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMenuMobile(!menuMobile)}
            >
              ☰
            </button>
          </div>

          {menuMobile && (
            <div className="md:hidden !bg-blue-900 !text-white p-4 flex flex-col gap-4">
              <Link to="/home" onClick={() => setMenuMobile(false)}>
                Home
              </Link>
              <Link to="/buys" onClick={() => setMenuMobile(false)}>
                Produtos
              </Link>

              <button
                className="!bg-blue-700 p-2 rounded"
                onClick={() => setOpen(!open)}
              >
                Categorias
              </button>

              {open && (
                <div className="flex flex-col gap-1 !bg-blue-800 p-3 rounded">
                  <span>Hortifruti</span>
                  <span>Açougue & Peixaria</span>
                  <span>Frios & Laticínios</span>
                  <span>Congelados</span>
                  <span>Padaria & Confeitaria</span>
                  <span>Mercearia</span>
                  <span>Bebidas</span>
                  <span>Limpeza</span>
                  <span>Higiene & Cuidados Pessoais</span>
                  <span>Pet</span>
                </div>
              )}

              <button
                className="!bg-blue-700 p-2 rounded"
                onClick={() => setOpenAdmin(!openAdmin)}
              >
                Administração
              </button>

              {openAdmin && (
                <div className="flex flex-col gap-2 !bg-blue-800 p-3 rounded">
                  <Link to="/promotion">Cadastrar Promoção</Link>
                  <Link to="/products">Cadastrar Produtos</Link>
                </div>
              )}

              <button
                className="!bg-blue-700 p-2 rounded"
                onClick={() => setOpenContactModal(!openContactModal)}
              >
                Contact
              </button>

              {openContactModal && (
                <div className="!bg-blue-800 p-3 rounded text-sm">
                  <p className="font-semibold mb-2">Contatos</p>
                  <p>📧 email@email.com</p>
                  <p>📞 (11) 99999-9999</p>
                </div>
              )}
            </div>
          )}
        </nav>

        <div>
          <Routes>
            <Route
              path="/"
              element={
                isLogged ? <Navigate to="/home" /> : <Navigate to="/login" />
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/home"
              element={isLogged ? <Home /> : <Navigate to="/login" />}
            />
            <Route path="/promotion" element={<Promotion />} />
            <Route path="/products" element={<Products />} />
            <Route path="/buys" element={<Buys />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sacola" element={<Sacola />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </div>
       </CartProvider>

      </div>

      <footer className="!bg-[linear-gradient(135deg,#0B4878,#2F6FA0,#78A9C9)] text-white py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Navegação</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <Link to="/home" className="hover:text-blue-300">
                Home
              </Link>
              <Link to="/buys" className="hover:text-blue-300">
                Produtos
              </Link>
              <Link to="/promotion" className="hover:text-blue-300">
                Promoções
              </Link>
              <Link to="/products" className="hover:text-blue-300">
                Administração
              </Link>
            </div>
          </div>

          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Siga-nos</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF className="w-6 h-6 hover:text-blue-300" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter className="w-6 h-6 hover:text-blue-300" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="w-6 h-6 hover:text-blue-300" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn className="w-6 h-6 hover:text-blue-300" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm">
              © {new Date().getFullYear()} Supermercado. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
   </div>
  );
}

export default App;
