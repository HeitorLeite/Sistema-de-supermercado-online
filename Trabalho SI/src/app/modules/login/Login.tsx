import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User } from "lucide-react";
import api from "../../../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      setMostrarCadastro(false);
      return;
    }

    try {
      setLoading(true);
      setErro("");
      
      const { data } = await api.post("/login", { 
        email, 
        senha, 
        isAdmin: isAdminLogin 
      });

      localStorage.setItem("token", data.token);
      
      localStorage.setItem("usuario", JSON.stringify(data.cliente));

      api.defaults.headers.Authorization = `Bearer ${data.token}`;

      window.location.href = "/home";

    } catch (error: any) {
      const msg = error.response?.data?.erro || "Email ou senha incorretos.";
      setErro(msg);

      if (!isAdminLogin) {
        setMostrarCadastro(true);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 pt-24"
      style={{ background: 'linear-gradient(to bottom right, #f8f9fa 50%, #e9ecef 100%)' }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-40 z-0" 
        style={{ backgroundImage: 'linear-gradient(to right, #20c997, #007bff)' }}
      ></div>

      <div className="
          bg-white/80
          backdrop-blur-lg
          w-full max-w-md p-8 md:p-10
          rounded-3xl
          shadow-2xl
          border border-white/50
          z-10
          flex flex-col gap-6
      ">
        <div className="text-center">
          <h1 
            className="text-4xl font-extrabold mb-1"
            style={{
              backgroundImage: "linear-gradient(to right, #20c997, #007bff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent"
            }}
          >
            {isAdminLogin ? "Área Administrativa" : "Bem-vindo"}
          </h1>
          <p className="text-sm text-gray-500">
            {isAdminLogin ? "Gerencie seu supermercado" : "Faça login para continuar comprando"}
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200 flex items-center justify-center gap-2">
            ⚠️ {erro}
          </div>
        )}

        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setIsAdminLogin(false)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-300
              ${!isAdminLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            <User size={16} /> Cliente
          </button>
          <button
            onClick={() => setIsAdminLogin(true)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-300
              ${isAdminLogin ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            <ShieldCheck size={16} /> Admin
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder={isAdminLogin ? "Email corporativo" : "Digite seu email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`
                w-full p-4 pl-12 bg-white border rounded-xl focus:ring-2 outline-none transition shadow-sm
                ${isAdminLogin ? 'focus:ring-orange-400 border-orange-200' : 'focus:ring-blue-500 border-gray-300'}
              `}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
               </svg>
            </div>
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={`
                w-full p-4 pl-12 bg-white border rounded-xl focus:ring-2 outline-none transition shadow-sm
                ${isAdminLogin ? 'focus:ring-orange-400 border-orange-200' : 'focus:ring-blue-500 border-gray-300'}
              `}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`
            w-full font-bold py-4 rounded-xl text-white shadow-lg transition duration-300 transform hover:-translate-y-0.5
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 
              isAdminLogin 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
            }
          `}
        >
          {loading ? 'Acessando...' : (isAdminLogin ? 'Acessar Painel' : 'Entrar')}
        </button>

        {!isAdminLogin && (
          <div className="text-center mt-2">
            {mostrarCadastro ? (
              <>
                <p className="text-gray-600 mb-2">Ainda não possui conta?</p>
                <Link
                  to="/register"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Cadastre-se agora
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Esqueceu a senha? <span className="text-blue-500 cursor-pointer hover:underline">Recuperar</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;