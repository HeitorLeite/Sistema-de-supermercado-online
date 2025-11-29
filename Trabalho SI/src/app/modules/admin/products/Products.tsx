import { useState, useMemo } from "react"; 

type Categoria = { id_categoria: number; nome_categoria: string };

const api = {
  get: async (path: string) => {
    if (path === "/categorias") {
      return { data: [{ id_categoria: 1, nome_categoria: "Hortifruti" }] as Categoria[] };
    }
    return { data: [] };
  },
  post: async (path: string, data: any) => {
    if (path === "/categorias") {
      return { data: { id_categoria: Math.floor(Math.random() * 1000) + 10, ...data } as Categoria };
    }
    if (path === "/produtos") {
      return { data: { id_produto: Math.floor(Math.random() * 1000) + 100, ...data } };
    }
    return { data: {} };
  },
};

type Product = {
  id: number;
  title: string;
  price: string;
  image: string;
  category: string;
  descricao: string;
  estoque: string;
};

const CATEGORIES = ["Hortifruti", "Açougue & Peixaria", "Bebidas", "Padaria"];

function ProductManagement() { 
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [categoriasDb, setCategoriasDb] = useState<string[]>([]); 
  const [descricao, setDescricao] = useState("");
  const [estoque, setEstoque] = useState("");

  const adicionarProduto = async () => {
    if (!title || !price || !image || !descricao || !estoque) return;

    let id_categoria;
    try {
      const resCategorias = await api.get("/categorias");
      const categoriasApi: Categoria[] = resCategorias.data as Categoria[];
      
      let categoriaObj: Categoria | undefined = categoriasApi.find(cat => cat.nome_categoria === category);
      
      if (!categoriaObj) {
        const resNovaCat = await api.post("/categorias", { nome_categoria: category });
        categoriaObj = resNovaCat.data as Categoria;
      }
      
      // Correção: Usando o operador de asserção não nula (!) para resolver o erro do TypeScript
      id_categoria = categoriaObj!.id_categoria; 

      const response = await api.post("/produtos", {
        nome: title,
        descricao,
        id_categoria,
        preco_venda: parseFloat(price),
        estoque: parseInt(estoque),
        imagem: image,
      });
      const novoProduto = response.data;
      setProducts([...products, {
        id: novoProduto.id_produto,
        title: novoProduto.nome,
        price: novoProduto.preco_venda.toFixed(2), 
        image: novoProduto.imagem,
        category,
        descricao: novoProduto.descricao,
        estoque: novoProduto.estoque?.toString() || "0",
      }]);
      setTitle("");
      setPrice("");
      setImage("");
      setDescricao("");
      setEstoque("");
    } catch (error) {
      alert("Erro ao cadastrar produto ou categoria!");
      console.error(error);
    }
  };

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);


  return (
    <div className="mt-30 min-h-screen bg-gray-50 p-4 sm:p-10 font-sans">

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl mx-auto border-t-8 border-blue-500/80 transform hover:shadow-blue-300/50 transition duration-500">
        
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 border-b pb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cadastrar Novo Produto
        </h2>
        
        <div className="space-y-4">
          
          <div className="relative">
            <select
              value={category}
              onChange={async (e) => {
                const selected = e.target.value;
                setCategory(selected);
                try {
                  const resCategorias = await api.get("/categorias");
                  const categoriasApi: Categoria[] = resCategorias.data as Categoria[];
                  const categoriaObj = categoriasApi.find((cat: any) => cat.nome_categoria === selected);
                  if (!categoriaObj) {
                    await api.post("/categorias", { nome_categoria: selected });
                  }
                } catch (error) {
                  console.error("Erro ao verificar/criar categoria", error);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white appearance-none pr-10 text-gray-700"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="🏷️ Nome do Produto (ex: Maçã Gala)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="📝 Descrição detalhada do Produto"
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
          />
          
          <div className="flex space-x-4">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="💰 Preço (ex: 15.99)"
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <input
              type="number"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              placeholder="📦 Estoque"
              className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
          </div>
          
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="🖼️ URL da Imagem"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />

          <button 
            onClick={adicionarProduto} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01]"
          >
            Adicionar Produto ao Catálogo
          </button>
        </div>
      </div>

      <div className="mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {Object.keys(groupedProducts).map(categoryName => (
          
          <div key={categoryName} className="mb-14">
            <h3 className="text-3xl font-extrabold text-gray-800 border-b-4 border-blue-500/50 pb-3 mb-8 mt-12 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.782a1 1 0 01-.867.987l-2.01-.301A.75.75 0 007 6.03V7.25c0 .307.247.555.555.555h4.89A.75.75 0 0013 7.25v-.318c.03-.012.061-.023.091-.033l2.01.301a1 1 0 01.867.987V17.5a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 013 17.5v-13a1 1 0 01.867-.987l2.01-.301A.75.75 0 007 3.97V2.5a.5.5 0 011 0v1.47a.75.75 0 00.867.737l2.01.301A1 1 0 0112 5.218V3a1 1 0 011-1h1zM5 16h10V9H5v7z" clipRule="evenodd" />
              </svg>
              {categoryName} <span className="ml-3 text-lg font-medium text-blue-600">({groupedProducts[categoryName].length} itens)</span>
            </h3>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              
              {groupedProducts[categoryName].map(product => (

                <div 
                  key={product.id} 
                  className="bg-white rounded-xl shadow-lg p-5 transition duration-300 hover:shadow-2xl hover:border-blue-500 border border-gray-100 flex flex-col space-y-4"
                >
                  
                  <div className="flex justify-center h-48 overflow-hidden rounded-xl border border-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null; 
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e0e0e0/5c5c5c?text=Sem+Imagem`;
                      }}
                      className="w-full h-full object-cover transition duration-500 transform hover:scale-105" 
                    />
                  </div>

                  <div className="flex-grow">
                    <p className="font-semibold text-xl text-gray-900 leading-tight truncate">{product.title}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2" title={product.descricao}>{product.descricao || 'Sem descrição.'}</p>
                  </div>
                  
                  <div className="flex justify-between items-end border-t pt-3">
                    <p className="text-3xl font-black text-green-600">
                      R$ {product.price}
                    </p>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Estoque: {product.estoque}
                    </span>
                  </div>
              
                  <button
                    onClick={() => console.log(`Remover produto ${product.id}`)}
                    className="mt-4 bg-red-500 text-white p-3 rounded-xl text-md font-medium hover:bg-red-600 transition shadow-sm"
                  >
                    Remover Produto
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-white p-10 rounded-xl shadow-lg mt-12 max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <p className="text-center text-gray-600 font-medium">
              Nenhum produto cadastrado. Use o formulário acima para começar a popular o seu catálogo!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManagement;