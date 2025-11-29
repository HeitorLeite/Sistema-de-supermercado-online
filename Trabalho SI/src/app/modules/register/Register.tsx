import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api.ts";

function Register() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleRegister = async () => {
    if (
      !nome ||
      !email ||
      !senha ||
      !cpf ||
      !telefone ||
      !endereco ||
      !dataNascimento
    ) {
      setErro("Preencha todos os campos.");
      return;
    }

    setErro("");
    setSucesso("");

    try {
      // Converter data para formato ISO-8601
      const dataISO = dataNascimento ? new Date(dataNascimento).toISOString() : null;
      
      await api.post("/cadastro", {
        nome,
        email,
        senha,
        cpf,
        telefone,
        endereco,
        data_nascimento: dataISO
      });

      setSucesso("Cadastro realizado com sucesso! Redirecionando para login...");
      
      // Limpar campos
      setNome("");
      setEmail("");
      setSenha("");
      setCpf("");
      setTelefone("");
      setEndereco("");
      setDataNascimento("");
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error(error);
      const mensagem = (error instanceof Error) ? error.message : "Erro ao cadastrar. Tente novamente.";
      setErro(mensagem);
    }
  };

  return (
    <div className=" relative h-screen flex items-center justify-center p-4 py-12 overflow-y-auto"
        style={{ background: 'linear-gradient(to bottom right, #f8f9fa 50%, #e9ecef 100%)' }}
    >
        <div className="absolute top-0 left-0 w-full h-32" 
            style={{ backgroundImage: 'linear-gradient(to right, #20c997, #007bff)' }}
        ></div>

      <div 
            className="mt-150
                bg-white/60                   
                backdrop-blur-lg              
                w-full max-w-lg p-10 md:p-12  
                rounded-3xl                   
                shadow-2xl                    
                border border-white/30        
                space-y-4                     
                z-10                          
            "
        >

        <h1 
            className="
                text-5xl font-extrabold text-center promo-title-styled mb-8 
            "
            style={{
                backgroundImage: "linear-gradient(to right, #20c997, #007bff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent"
            }}
        >
            Criar Conta
        </h1>

        {erro && <p className="text-red-500 text-center">{erro}</p>}
        {sucesso && <p className="text-green-600 text-center">{sucesso}</p>}
        
        {/* Nome completo */}
        <div className="relative">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-4 pl-12 bg-white/80 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent"
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 pl-12 bg-white/80 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent"
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
        </div>

        {/* Senha */}
        <div className="relative">
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-4 pl-12 bg-white/80 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent"
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
        </div>

        {/* CPF */}
        <div className="relative">
          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full p-4 pl-12 bg-white/80 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent"
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707l-.707-.707V8a6 6 0 00-6-6zM10 18a3 3 0 110-6 3 3 0 010 6z" /></svg>
        </div>

        {/* Telefone */}
        <div className="relative">
          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full p-4 pl-12 bg-white/80 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent"
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 3.683a1 1 0 01-1.616.91l-1.47-1.218a.994.994 0 00-.547-.145c-1.4 0-2.583 1.183-2.583 2.583v.547c0 .241.066.471.19.673l1.47 1.218a1 1 0 01.145 1.616l-3.683.74A1 1 0 013 18H2a1 1 0 01-1-1v-2.153a1 1 0 01.836-.986l3.683-.74a1 1 0 01.91-1.616l-1.218-1.47a.994.994 0 00-.145-.547c0-1.4 1.183-2.583 2.583-2.583h.547c.241 0 .471.066.673.19l1.218 1.47a1 1 0 011.616.91l.74-3.683A1 1 0 0118 3v13a1 1 0 01-1 1h-2a1 1 0 01-1-1V5.053a1 1 0 00-.836-.986l-3.683-.74A1 1 0 0011 3z"></path></svg>
        </div>

        {/* Endereço */}
        <div className="relative">
          <input
            type="text"
            placeholder="Endereço completo (Rua, Número, CEP)"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full p-4 pl-12 bg-white/80 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent"
          />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
        </div>

        {/* Data de Nascimento */}
        <label className="text-gray-700 font-semibold pt-2 block">Data de Nascimento</label>
        <input
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="w-full p-4 bg-white/80 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent"
        />

        {/* BOTÃO REGISTRAR */}
        <button
          onClick={handleRegister}
          className="
                w-full font-bold py-4 rounded-xl mt-6 
                bg-gradient-to-r from-green-500 to-green-700 
                text-white shadow-lg 
                hover:from-green-600 hover:to-green-800 
                transition duration-300 ease-in-out transform hover:-translate-y-0.5
            "
        >
          Registrar
        </button>

        {/* Link para Login */}
        <p className="text-center text-sm text-gray-600 pt-2">
          Já tem conta?{" "}
          <a href="/login" className="text-blue-600 font-semibold hover:underline transition">
            Fazer login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;