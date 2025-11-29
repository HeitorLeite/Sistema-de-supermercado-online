import { useState } from 'react';
import { Trash2, ShoppingBag, MapPin, CreditCard, Gift, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useCart, PRESET_COUPONS } from '../../context/CartContext';
import type { Address } from '../../context/CartContext';

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { name: 'Carrinho', icon: ShoppingBag, index: 1 },
    { name: 'Endereço', icon: MapPin, index: 2 },
    { name: 'Pagamento', icon: CreditCard, index: 3 },
  ];

  return (
    <div className="flex justify-between items-center w-full max-w-xl mx-auto mb-8 relative">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2" />
      {steps.map((step) => (
        <div key={step.index} className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300
            ${step.index <= currentStep
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-400 border border-gray-300'
            }`}>
            {step.index < currentStep ? <CheckCircle size={18} /> : <step.icon size={18} />}
          </div>
          <p className={`mt-2 text-sm ${step.index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{step.name}</p>
        </div>
      ))}
    </div>
  );
};

const AddressForm = ({ handleNext, handleBack, setAddress }: { handleNext: () => void, handleBack: () => void, setAddress: (addr: Address) => void }) => {
  const [form, setForm] = useState<Address>({ cep: '', rua: '', numero: '', bairro: '', complemento: '', cidade: '', uf: '' });
  return (
    <div className="lg:col-span-2 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">2. Detalhes do Endereço</h2>
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input value={form.cep} onChange={(e) => setForm(s => ({ ...s, cep: e.target.value }))} type="text" placeholder="CEP" className="p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" required />
          <input value={form.rua} onChange={(e) => setForm(s => ({ ...s, rua: e.target.value }))} type="text" placeholder="Rua / Avenida" className="p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" required />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <input value={form.numero} onChange={(e) => setForm(s => ({ ...s, numero: e.target.value }))} type="text" placeholder="Número" className="p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" required />
          <input value={form.bairro} onChange={(e) => setForm(s => ({ ...s, bairro: e.target.value }))} type="text" placeholder="Bairro" className="p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" required />
          <input value={form.complemento} onChange={(e) => setForm(s => ({ ...s, complemento: e.target.value }))} type="text" placeholder="Complemento (opcional)" className="p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <input value={form.cidade} onChange={(e) => setForm(s => ({ ...s, cidade: e.target.value }))} type="text" placeholder="Cidade" className="p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" required />
          <input value={form.uf} onChange={(e) => setForm(s => ({ ...s, uf: e.target.value }))} type="text" placeholder="Estado (UF)" className="p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" required />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={handleBack} className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition"><ChevronLeft size={20} /><span>Voltar ao Carrinho</span></button>
        <button onClick={() => { setAddress(form); handleNext(); }} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"><span>Ir para o Pagamento</span><ChevronRight size={20} /></button>
      </div>
    </div>
  );
};

const PaymentForm = ({ handleBack, onConfirm }: { handleBack: () => void, onConfirm: (method: string) => Promise<void> }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');

  const buttonClass = (method: string) =>
    `flex-1 p-3 rounded-xl font-medium transition duration-300 ${paymentMethod === method ? 'border-2 border-blue-600 bg-blue-50 text-blue-800 shadow-inner' : 'border border-gray-300 text-gray-600 hover:border-blue-300 bg-white'}`;

  return (
    <div className="lg:col-span-2 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">3. Forma de Pagamento</h2>
      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="flex space-x-4">
          <button onClick={() => setPaymentMethod('credit')} className={buttonClass('credit')}>Cartão de Crédito</button>
          <button onClick={() => setPaymentMethod('debit')} className={buttonClass('debit')}>Cartão de Débito</button>
          <button onClick={() => setPaymentMethod('pix')} className={buttonClass('pix')}>Pix</button>
        </div>
        <div className="space-y-4">
          {paymentMethod === 'credit' && (
            <div>
              <input type="text" placeholder="Nome no Cartão" className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Número do Cartão" className="w-full p-3 border border-gray-300 rounded-lg mt-2" />
            </div>
          )}
          {paymentMethod === 'pix' && (
            <div className="text-center p-4">Simulação Pix: copie a chave e confirme.</div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={handleBack} className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition"><ChevronLeft size={20} /><span>Voltar ao Endereço</span></button>
        <button onClick={() => onConfirm(paymentMethod)} className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"><span>Confirmar Pedido</span><CheckCircle size={20} /></button>
      </div>
    </div>
  );
};

export default function Sacola() {
  const { items, increase, decrease, removeItem, subtotal, totalItems, applyCoupon, couponCode, checkout, setAddress, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [localCoupon, setLocalCoupon] = useState(couponCode || '');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const handleNext = () => setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
  const handleBack = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  const handleApplyCoupon = () => {
    const res = applyCoupon(localCoupon);
    if (!res.success) alert('Cupom inválido');
    else alert('Cupom aplicado');
  };

  // compute discount using exported PRESET_COUPONS from context
  const coupon = couponCode ? PRESET_COUPONS[couponCode as keyof typeof PRESET_COUPONS] : undefined;
  const discount = coupon ? (coupon.type === 'fixed' ? coupon.value : (subtotal * coupon.value) / 100) : 0;
  const delivery = 0;
  const total = subtotal - discount + delivery;

  const onConfirm = async (method: string) => {
    setLoadingCheckout(true);
    const res = await checkout(method);
    setLoadingCheckout(false);
    if (res.success) {
      alert('Pedido finalizado com sucesso!');
      clearCart();
      setCurrentStep(1);
    } else {
      alert(`Erro: ${res.message}`);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">1. Itens no Carrinho</h2>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <span className="text-sm font-medium text-gray-600">{totalItems} {totalItems === 1 ? 'item' : 'itens'} selecionados</span>
              <button className="text-sm text-gray-500 hover:text-gray-900 transition">Mover tudo para Lista de Desejos</button>
            </div>

            {items.map(item => (
              <div key={item.id_produto} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition duration-300">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600 transition duration-150" />
                <img src={item.imagem || `https://placehold.co/80x80/e0e0e0/333?text=Imagem`} alt={item.nome} className="w-20 h-20 object-cover rounded-lg border border-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{item.nome}</h2>
                    <button className="text-gray-400 hover:text-red-600 transition duration-150 p-1 rounded-full" onClick={() => removeItem(item.id_produto)} aria-label={`Remover ${item.nome}`}><Trash2 size={18} /></button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.descricao || ''}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">R$ {(Number(item.preco_venda) * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-500"><span className="font-medium">R$ {(Number(item.preco_venda)).toFixed(2)}</span> / un.</p>
                </div>
                <div className="flex items-center border border-gray-300 rounded-full h-8 px-1">
                  <button onClick={() => decrease(item.id_produto)} className="w-6 h-6 text-gray-700 hover:text-gray-900 transition disabled:opacity-50" disabled={item.quantity <= 1}>-</button>
                  <span className="mx-2 text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button onClick={async () => { const ok = await increase(item.id_produto); if (!ok) alert('Quantidade máxima atingida.') }} className="w-6 h-6 text-gray-700 hover:text-gray-900 transition">+</button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <button onClick={() => setCurrentStep(2)} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Continuar para Endereço <ChevronRight size={20} /></button>
            </div>
          </div>
        );
      case 2:
        return <AddressForm handleNext={handleNext} handleBack={handleBack} setAddress={(addr) => setAddress(addr)} />;
      case 3:
        return <PaymentForm handleBack={handleBack} onConfirm={onConfirm} />;
      default:
        return <div>Erro: Passo inválido</div>;
    }
  };

  return (
    <div className="mt-30 min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      <Stepper currentStep={currentStep} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {renderContent()}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center justify-between">Presente? <Gift className="text-purple-600" size={24} /></h3>
            <p className="text-sm text-gray-600 mb-3">Adicione uma mensagem personalizada e embalagem de presente.</p>
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700 transition">Adicionar Embalagem</button>
          </div>

          {currentStep === 1 && (
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Cupom de Desconto</h3>
              <div className="flex items-center space-x-2">
                <input type="text" value={localCoupon} onChange={(e) => setLocalCoupon(e.target.value)} placeholder="Código do cupom" className="flex-1 p-2 border border-gray-300 rounded-lg text-sm" />
                <button onClick={handleApplyCoupon} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">Aplicar</button>
              </div>
              <p className="text-green-600 text-xs mt-2 font-medium">{couponCode ? `Cupom aplicado: ${couponCode}` : 'Nenhum cupom aplicado'}</p>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 sticky top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do Pedido</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({totalItems} itens)</span><span>R$ {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-green-600"><span>Desconto de Cupom</span><span>- R$ {discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Entrega</span><span className="font-medium text-green-600">Grátis</span></div>
            </div>
            <div className="border-t border-dashed border-gray-200 my-4 pt-4">
              <div className="flex justify-between text-xl font-bold text-gray-900"><span>Total:</span><span>R$ {total.toFixed(2)}</span></div>
              <p className="text-xs text-gray-500 mt-1">Impostos e taxas incluídos</p>
            </div>
            {currentStep < 3 && (<button onClick={() => setCurrentStep(currentStep + 1)} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition">{currentStep === 1 ? 'Continuar para Endereço' : 'Continuar para Pagamento'}</button>)}
            {currentStep === 3 && (<button disabled={loadingCheckout} onClick={() => onConfirm('credit')} className={`w-full mt-6 py-3 rounded-xl font-bold text-lg ${loadingCheckout ? 'bg-emerald-400 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 transition'}`}>{loadingCheckout ? 'Processando...' : `Finalizar e Pagar R$ ${total.toFixed(2)}`}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}