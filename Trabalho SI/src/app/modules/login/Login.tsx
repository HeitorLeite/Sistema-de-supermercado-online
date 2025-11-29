import { useState } from "react";
import api from "../../../services/api.ts";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      setMostrarCadastro(false);
      return;
    }

    try {
     const { data } = await api.post("/login", {email, senha});

     localStorage.setItem("token", data.token);
     localStorage.setItem("usuario", JSON.stringify(data.usuario));

     api.defaults.headers.Authorization = `Bearer ${data.token}`;

      window.location.href = "../home/Home.tsx";

    } catch (error) {
      setErro("Email ou senha incorretos.");
      setMostrarCadastro(true);
      console.error(error);
    }
  };

  return (
    // Fundo da tela com cores da Home para ambientação
    <div className="relative min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(to bottom right, #f8f9fa 50%, #e9ecef 100%)' }}
    >
        {/* Banner de topo simulado para manter o visual da Home */}
        <div className="absolute top-0 left-0 w-full h-32" 
            style={{ backgroundImage: 'linear-gradient(to right, #20c997, #007bff)' }}
        ></div>

      {/* Card Principal com Glassmorphism e Sombra */}
      <div 
            className=" mt-40
                bg-white/60                   /* Fundo branco com 60% de opacidade */
                backdrop-blur-lg              /* Efeito de desfoque */
                w-full max-w-md p-10 md:p-12  /* Padding maior e responsivo */
                rounded-3xl                   /* Cantos mais arredondados */
                shadow-2xl                    /* Sombra forte */
                border border-white/30        /* Borda sutil para o efeito de vidro */
                z-10                          /* Garante que fique acima do banner simulado */
            "
        >

        {/* Título "Login" com Gradiente (como o "PROMOÇÃO DA SEMANA") */}
        <h1 
            className="
                text-5xl font-extrabold text-center promo-title-styled mb-1 
                /* O promo-title-styled deve conter o text-shadow no seu CSS/SCSS */
            "
            style={{
                backgroundImage: "linear-gradient(to right, #20c997, #007bff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent"
            }}
        >
            Login
        </h1>

        {erro && (
          <p className="text-red-500 text-center font-medium mb-4">{erro}</p>
        )}

        {/* Input de Email com Ícone e Sombra Interna - mb-0 (ESPAÇAMENTO ZERADO) */}
        <div className="relative mb-0"> 
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
                    w-full p-4 pl-12
                    bg-white/80 border border-gray-300 rounded-xl 
                    shadow-inner                          
                    focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent
                "
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
        </div>

        {/* Input de Senha com Ícone e Sombra Interna - mb-4 (ESPAÇAMENTO PEQUENO ANTES DO BOTÃO) */}
        <div className="relative mb-4"> 
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="
                    w-full p-4 pl-12
                    bg-white/80 border border-gray-300 rounded-xl 
                    shadow-inner
                    focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent
                "
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
        </div>
        
        {/* Botão Entrar com Gradiente e Hover Dinâmico */}
        <button
          onClick={handleLogin}
          className="
                w-full font-bold py-4 rounded-xl 
                bg-gradient-to-r from-blue-500 to-blue-700 
                text-white shadow-lg 
                hover:from-blue-600 hover:to-blue-800 
                transition duration-300 ease-in-out transform hover:-translate-y-0.5
            "
        >
          Entrar
        </button>

        {mostrarCadastro && (
          <div className="text-center mt-6">
            <p className="text-gray-700 mb-3">Não tem conta?</p>
            <Link
              to="/register"
              className="
                    inline-block font-semibold py-3 px-6 rounded-xl text-lg
                    bg-gradient-to-r from-green-500 to-green-700 
                    text-white shadow-md
                    hover:from-green-600 hover:to-green-800
                    transition duration-300 ease-in-out
                "
            >
              Criar conta
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;