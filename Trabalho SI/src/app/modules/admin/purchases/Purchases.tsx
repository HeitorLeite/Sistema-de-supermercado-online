import { useState, useEffect } from "react";
import api from "../../../../services/api";
import { 
  Truck, 
  Plus, 
  ShoppingCart, 
  Building2, 
  Search, 
  PackageCheck,
  Trash2,
  CheckCircle, 
  AlertCircle, 
  X 
} from "lucide-react";

// --- TIPOS ---
type Supplier = {
  id_fornecedor: number;
  nome: string;
  cnpj: string;
  cidade: string;
  telefone: string;
  email: string;
};

type Product = {
  id_produto: number;
  nome: string;
  preco_venda: number;
  estoque: number;
};

type OrderItem = {
  id_produto: number;
  nome: string;
  quantidade: number;
  custo: number;
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

export default function Purchases() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'order'>('order');
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [newSupplier, setNewSupplier] = useState({ nome: "", cnpj: "", cidade: "", telefone: "", email: "" });
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSuppliers, resProducts] = await Promise.all([
        api.get("/fornecedores"),
        api.get("/produtos")
      ]);
      setSuppliers(resSuppliers.data);
      setProducts(resProducts.data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
      showNotification("Erro ao carregar dados do servidor.", "error");
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.nome || !newSupplier.cnpj) {
      showNotification("Nome e CNPJ são obrigatórios", "warning");
      return;
    }
    try {
      await api.post("/administrador/cadastroFornecedor", newSupplier);
      showNotification("Fornecedor cadastrado com sucesso!", "success");
      setNewSupplier({ nome: "", cnpj: "", cidade: "", telefone: "", email: "" });
      fetchData();
    } catch (error) {
      showNotification("Erro ao cadastrar fornecedor.", "error");
    }
  };

  const addItemToOrder = () => {
    if (!selectedProductId || !quantity || !costPrice) {
      showNotification("Preencha o produto, quantidade e custo.", "warning");
      return;
    }
    
    const product = products.find(p => p.id_produto === Number(selectedProductId));
    if (!product) return;

    const newItem: OrderItem = {
      id_produto: product.id_produto,
      nome: product.nome,
      quantidade: Number(quantity),
      custo: Number(costPrice)
    };

    setOrderItems([...orderItems, newItem]);
    setQuantity("");
    setCostPrice("");
    showNotification("Item adicionado à lista.", "success");
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleFinalizeOrder = async () => {
    if (!selectedSupplierId || orderItems.length === 0) {
      showNotification("Selecione um fornecedor e adicione itens.", "warning");
      return;
    }

    try {
      const resOrder = await api.post("/compra", {
        id_fornecedor: Number(selectedSupplierId),
        status_pedido: "Entregue"
      });
      
      const orderId = resOrder.data.id_pedido;

      for (const item of orderItems) {
        await api.post("/compra/itens", {
          id_pedido: orderId,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_custo_unitario: item.custo
        });
      }

      showNotification(`Compra #${orderId} realizada e estoque atualizado!`, "success");
      setOrderItems([]);
      setSelectedSupplierId("");
      
      fetchData(); 
      
    } catch (error) {
      console.error(error);
      showNotification("Erro ao processar pedido de compra.", "error");
    }
  };

  const totalOrderValue = orderItems.reduce((acc, item) => acc + (item.custo * item.quantidade), 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4 sm:px-8 relative">
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Truck className="text-blue-600" size={32} /> Gestão de Compras
            </h1>
            <p className="text-gray-500 mt-1">Gerencie fornecedores e reponha seu estoque.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('order')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'order' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShoppingCart size={16} /> Nova Compra
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'suppliers' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Building2 size={16} /> Fornecedores
            </button>
          </div>
        </header>

        {activeTab === 'suppliers' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-blue-500"/> Novo Fornecedor
              </h3>
              <div className="space-y-3">
                <input placeholder="Nome da Empresa" className="w-full p-2.5 border rounded-lg" value={newSupplier.nome} onChange={e => setNewSupplier({...newSupplier, nome: e.target.value})} />
                <input placeholder="CNPJ" className="w-full p-2.5 border rounded-lg" value={newSupplier.cnpj} onChange={e => setNewSupplier({...newSupplier, cnpj: e.target.value})} />
                <input placeholder="Cidade" className="w-full p-2.5 border rounded-lg" value={newSupplier.cidade} onChange={e => setNewSupplier({...newSupplier, cidade: e.target.value})} />
                <input placeholder="Telefone" className="w-full p-2.5 border rounded-lg" value={newSupplier.telefone} onChange={e => setNewSupplier({...newSupplier, telefone: e.target.value})} />
                <input placeholder="Email" className="w-full p-2.5 border rounded-lg" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
                <button onClick={handleAddSupplier} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">Cadastrar</button>
              </div>
            </div>


            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Fornecedores Cadastrados</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="py-3 px-4">Nome</th>
                      <th className="py-3 px-4">CNPJ</th>
                      <th className="py-3 px-4">Cidade</th>
                      <th className="py-3 px-4">Contato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map(sup => (
                      <tr key={sup.id_fornecedor} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{sup.nome}</td>
                        <td className="py-3 px-4">{sup.cnpj}</td>
                        <td className="py-3 px-4">{sup.cidade}</td>
                        <td className="py-3 px-4">{sup.telefone}</td>
                      </tr>
                    ))}
                    {suppliers.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhum fornecedor encontrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Montar Pedido</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fornecedor</label>
                    <select 
                      className="w-full p-3 border rounded-lg bg-gray-50"
                      value={selectedSupplierId}
                      onChange={e => setSelectedSupplierId(e.target.value)}
                    >
                      <option value="">Selecione um fornecedor...</option>
                      {suppliers.map(s => <option key={s.id_fornecedor} value={s.id_fornecedor}>{s.nome}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Produto</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <select 
                        className="w-full p-3 pl-10 border rounded-lg bg-white"
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                      >
                        <option value="">Buscar produto no sistema...</option>
                        {products.map(p => <option key={p.id_produto} value={p.id_produto}>{p.nome} (Estoque atual: {p.estoque})</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quantidade</label>
                    <input 
                      type="number" 
                      className="w-full p-3 border rounded-lg" 
                      placeholder="Qtd" 
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Custo Unitário (R$)</label>
                    <input 
                      type="number" 
                      className="w-full p-3 border rounded-lg" 
                      placeholder="0.00" 
                      step="0.01"
                      value={costPrice}
                      onChange={e => setCostPrice(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={addItemToOrder}
                  className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-black transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Adicionar Item à Lista
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between">
                  Itens do Pedido
                  <span className="text-blue-600">Total: R$ {totalOrderValue.toFixed(2)}</span>
                </h3>
                
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                    Nenhum item adicionado à lista.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {orderItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-800">{item.nome}</p>
                          <p className="text-xs text-gray-500">{item.quantidade}x R$ {item.custo.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-700">R$ {(item.quantidade * item.custo).toFixed(2)}</p>
                          <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="h-fit space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <h3 className="text-xl font-extrabold text-gray-800 mb-4">Resumo</h3>
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>Fornecedor:</span>
                    <span className="font-medium text-right truncate w-32">
                      {suppliers.find(s => s.id_fornecedor === Number(selectedSupplierId))?.nome || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Itens:</span>
                    <span className="font-medium">{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100 text-base font-bold text-gray-900">
                    <span>Total Estimado:</span>
                    <span>R$ {totalOrderValue.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleFinalizeOrder}
                  disabled={orderItems.length === 0}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2
                    ${orderItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200'}
                  `}
                >
                  <PackageCheck size={20} /> Confirmar Compra
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}