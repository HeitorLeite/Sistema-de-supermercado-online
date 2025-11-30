import { useState } from 'react';
import { Trash2, ShoppingBag, MapPin, CreditCard, Gift, CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { useCart, PRESET_COUPONS } from '../../context/CartContext';
import type { Address } from '../../context/CartContext';

// --- COMPONENTES AUXILIARES ---

// Componente de Notificação (Toast)
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
    <div className={`fixed top-24 right-5 z-[100] flex items-center p-4 mb-4 text-white rounded-lg shadow-2xl transition-all duration-500 ease-in-out transform translate-y-0 ${bgColors[type]}`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20">
        {icons[type]}
      </div>
      <div className="ml-3 text-sm font-semibold pr-4">{message}</div>
      <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-white/20 inline-flex h-8 w-8" onClick={onClose}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { name: 'Carrinho', icon: ShoppingBag, index: 1 },
    { name: 'Endereço', icon: MapPin, index: 2 },
    { name: 'Pagamento', icon: CreditCard, index: 3 },
  ];

  // Cálculo da porcentagem da barra de progresso (0%, 50%, 100%)
  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="flex justify-between items-center w-full max-w-2xl mx-auto mb-10 relative px-4">
      {/* Container da linha de fundo para garantir alinhamento */}
      <div className="absolute top-6 left-0 w-full px-10"> {/* px-10 compensa a largura dos ícones para a linha começar no centro do primeiro */}
        <div className="h-1 bg-gray-200 rounded-full w-full">
           <div 
            className="h-1 bg-blue-600 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {steps.map((step) => {
        const isActive = step.index <= currentStep;
        const isCompleted = step.index < currentStep;

        return (
          <div key={step.index} className="flex flex-col items-center relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2
              ${isActive
                ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-lg'
                : 'bg-white text-gray-400 border-gray-300'
              }`}
            >
              {isCompleted ? <CheckCircle size={20} /> : <step.icon size={20} />}
            </div>
            <p className={`mt-2 text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
              {step.name}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// Componente de Endereço
const AddressForm = ({ form, setForm }: { form: Address, setForm: React.Dispatch<React.SetStateAction<Address>> }) => {
  return (
    <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
        <MapPin className="text-blue-600" /> Detalhes do Endereço
      </h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input value={form.cep} onChange={(e) => setForm(s => ({ ...s, cep: e.target.value }))} type="text" placeholder="CEP" className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          <input value={form.rua} onChange={(e) => setForm(s => ({ ...s, rua: e.target.value }))} type="text" placeholder="Rua / Avenida" className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <input value={form.numero} onChange={(e) => setForm(s => ({ ...s, numero: e.target.value }))} type="text" placeholder="Número" className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          <input value={form.bairro} onChange={(e) => setForm(s => ({ ...s, bairro: e.target.value }))} type="text" placeholder="Bairro" className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          <input value={form.complemento} onChange={(e) => setForm(s => ({ ...s, complemento: e.target.value }))} type="text" placeholder="Complemento (opcional)" className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <input value={form.cidade} onChange={(e) => setForm(s => ({ ...s, cidade: e.target.value }))} type="text" placeholder="Cidade" className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          <input value={form.uf} onChange={(e) => setForm(s => ({ ...s, uf: e.target.value }))} type="text" placeholder="Estado (UF)" className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
        </div>
      </div>
    </div>
  );
};

// Componente de Pagamento
const PaymentForm = ({ paymentMethod, setPaymentMethod }: { paymentMethod: string, setPaymentMethod: (m: string) => void }) => {
  const buttonClass = (method: string) =>
    `flex-1 p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${paymentMethod === method 
      ? 'border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]' 
      : 'border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50 bg-white'}`;

  return (
    <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
        <CreditCard className="text-blue-600" /> Forma de Pagamento
      </h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => setPaymentMethod('credit')} className={buttonClass('credit')}>Cartão de Crédito</button>
          <button onClick={() => setPaymentMethod('debit')} className={buttonClass('debit')}>Débito</button>
          <button onClick={() => setPaymentMethod('pix')} className={buttonClass('pix')}>Pix</button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[150px] flex items-center justify-center">
          {paymentMethod === 'credit' && (
            <div className="w-full space-y-3">
              <input type="text" placeholder="Nome no Cartão" className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
              <input type="text" placeholder="Número do Cartão" className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
              <div className="flex gap-4">
                <input type="text" placeholder="Validade (MM/AA)" className="w-1/2 p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
                <input type="text" placeholder="CVV" className="w-1/2 p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
              </div>
            </div>
          )}
          {paymentMethod === 'debit' && (
            <p className="text-gray-500">O pagamento será processado na entrega (Maquininha).</p>
          )}
          {paymentMethod === 'pix' && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Escaneie o QR Code ou use a chave abaixo:</p>
              <div className="bg-white p-3 border border-dashed border-gray-400 rounded text-xs font-mono select-all cursor-pointer hover:bg-gray-100">
                00020126330014BR.GOV.BCB.PIX011112345678900...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function Sacola() {
  const { items, increase, decrease, removeItem, subtotal, totalItems, applyCoupon, couponCode, checkout, setAddress: setContextAddress, clearCart } = useCart();
  
  // Estados Locais
  const [currentStep, setCurrentStep] = useState(1);
  const [localCoupon, setLocalCoupon] = useState(couponCode || '');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [addressForm, setAddressForm] = useState<Address>({ cep: '', rua: '', numero: '', bairro: '', complemento: '', cidade: '', uf: '' });
  const [paymentMethod, setPaymentMethod] = useState('credit');
  
  // Notificações
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApplyCoupon = () => {
    const res = applyCoupon(localCoupon);
    if (!res.success) showNotification('Cupom inválido', 'error');
    else showNotification('Cupom aplicado com sucesso!', 'success');
  };

  const handleIncreaseQuantity = async (id: number, currentQty: number, maxStock?: number) => {
    const limit = maxStock || 0;
    if (currentQty >= limit) {
      showNotification(`Estoque máximo atingido para este item (${limit} un).`, 'warning');
      return;
    }
    const ok = await increase(id);
    if (!ok) showNotification('Não foi possível adicionar mais itens.', 'error');
  };

  const coupon = couponCode ? PRESET_COUPONS[couponCode as keyof typeof PRESET_COUPONS] : undefined;
  const discount = coupon ? (coupon.type === 'fixed' ? coupon.value : (subtotal * coupon.value) / 100) : 0;
  const total = subtotal - discount;

  const handleMainAction = async () => {
    if (currentStep === 1) {
      if (items.length === 0) {
        showNotification("Seu carrinho está vazio.", 'warning');
        return;
      }
      setCurrentStep(2);
    } 
    else if (currentStep === 2) {
      if (!addressForm.rua || !addressForm.numero || !addressForm.cep) {
        showNotification("Por favor, preencha os campos obrigatórios do endereço.", 'warning');
        return;
      }
      setContextAddress(addressForm); 
      setCurrentStep(3);
    } 
    else if (currentStep === 3) {
      setLoadingCheckout(true);
      const res = await checkout(paymentMethod);
      setLoadingCheckout(false);
      
      if (res.success) {
        showNotification('Pedido realizado com sucesso! Redirecionando...', 'success');
        clearCart();
        setAddressForm({ cep: '', rua: '', numero: '', bairro: '', complemento: '', cidade: '', uf: '' });
        // Pequeno delay para o usuário ver a mensagem antes de voltar ao passo 1 ou redirecionar
        setTimeout(() => setCurrentStep(1), 2000);
      } else {
        showNotification(`Erro: ${res.message}`, 'error');
      }
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
              <ShoppingBag className="text-blue-600" /> Itens no Carrinho
            </h2>
            
            {items.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Seu carrinho está vazio.</p>
                </div>
            ) : (
                items.map(item => {
                  const stock = item.estoque ?? 0;
                  const isMaxStock = item.quantity >= stock;

                  return (
                    <div key={item.id_produto} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden">
                      {stock <= 0 && (
                        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                          <span className="bg-red-500 text-white font-bold px-3 py-1 rounded text-sm">ESGOTADO</span>
                        </div>
                      )}
                      
                      <img 
                          src={item.imagem || `https://placehold.co/80x80/e0e0e0/333?text=IMG`} 
                          alt={item.nome} 
                          className="w-24 h-24 object-cover rounded-xl border border-gray-100" 
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/80x80/e0e0e0/333?text=IMG` }}
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                        <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-lg font-bold text-gray-800 truncate pr-4">{item.nome}</h2>
                              <p className="text-xs text-gray-500">Estoque disponível: {stock}</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50" onClick={() => removeItem(item.id_produto)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-500">Unitário: R$ {Number(item.preco_venda).toFixed(2)}</p>
                                <p className="text-xl font-extrabold text-blue-700">R$ {(Number(item.preco_venda) * item.quantity).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-lg h-9 bg-gray-50">
                                <button onClick={() => decrease(item.id_produto)} className="w-8 h-full text-gray-600 hover:text-blue-600 transition font-bold disabled:opacity-30" disabled={item.quantity <= 1}>-</button>
                                <span className="mx-2 text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => handleIncreaseQuantity(item.id_produto, item.quantity, stock)} 
                                  className={`w-8 h-full transition font-bold ${isMaxStock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600'}`}
                                  disabled={isMaxStock}
                                >+</button>
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        );
      case 2:
        return <AddressForm form={addressForm} setForm={setAddressForm} />;
      case 3:
        return <PaymentForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />;
      default:
        return <div>Erro</div>;
    }
  };

  const getButtonText = () => {
      if (loadingCheckout) return "Processando...";
      if (currentStep === 1) return "Continuar para Endereço";
      if (currentStep === 2) return "Continuar para Pagamento";
      return `Finalizar Pedido (R$ ${total.toFixed(2)})`;
  };

  return (
    <div className="mt-20 min-h-screen bg-gray-50 font-sans p-4 md:p-8 relative">
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <Stepper currentStep={currentStep} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {renderContent()}

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Gift size={20} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-800">Embalagem de Presente</h3>
                <p className="text-xs text-gray-500 mt-1">
                    Se desejar, solicite embalagem para presente nas observações da entrega.
                </p>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Cupom de Desconto</h3>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    value={localCoupon} 
                    onChange={(e) => setLocalCoupon(e.target.value)} 
                    placeholder="Código" 
                    className="flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" 
                />
                <button onClick={handleApplyCoupon} className="px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition">
                    Aplicar
                </button>
              </div>
              {couponCode && <p className="text-green-600 text-xs mt-2 font-medium">Cupom aplicado: {couponCode}</p>}
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo do Pedido</h3>
            
            <div className="space-y-3 text-sm pb-6 border-b border-dashed border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} itens)</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Descontos</span>
                <span className="font-medium">- R$ {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Entrega</span>
                <span className="font-bold text-green-600">Grátis</span>
              </div>
            </div>

            <div className="py-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-2xl font-extrabold text-blue-700">R$ {total.toFixed(2)}</span>
            </div>

            <button 
                onClick={handleMainAction} 
                disabled={loadingCheckout || (currentStep === 1 && items.length === 0)}
                className={`
                    w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1
                    ${loadingCheckout || (currentStep === 1 && items.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-200'
                    }
                `}
            >
                {getButtonText()}
            </button>

            {currentStep > 1 && (
                <button 
                    onClick={() => setCurrentStep(s => s - 1)}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-800 hover:underline transition"
                >
                    Voltar para etapa anterior
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}