import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../services/api';

type CartItem = {
  id_produto: number;
  nome: string;
  preco_venda: number;
  imagem?: string;
  quantity: number;
  estoque?: number;
  descricao?: string;
};

export type Address = {
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  complemento?: string;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (productId: number, qty?: number) => Promise<{ success: boolean; message?: string }>;
  increase: (productId: number) => Promise<boolean>;
  decrease: (productId: number) => void;
  removeItem: (productId: number) => void;
  subtotal: number;
  totalItems: number;
  couponCode: string | null;
  applyCoupon: (code: string) => { success: boolean; discount: number };
  address: Address | null;
  setAddress: (addr: Address) => void;
  checkout: (paymentMethod: string) => Promise<{ success: boolean; vendaId?: number; message?: string }>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const PRESET_COUPONS: Record<string, { type: 'fixed' | 'percent'; value: number }> = {
  'PRIMEIRACOMPRA': { type: 'fixed', value: 5.0 },
  'PROMO10': { type: 'percent', value: 10 },
  'BLACKFRIDAY': { type: 'percent', value: 20 },
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    console.debug('[CartProvider] mounted');
  }, []);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      if (!raw) return [];
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  });
  const [couponCode, setCouponCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cart_coupon');
    } catch (e) {
      return null;
    }
  });
  const [address, setAddressState] = useState<Address | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } catch (e) {
      console.warn('[CartProvider] could not persist cart items', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (couponCode) localStorage.setItem('cart_coupon', couponCode);
      else localStorage.removeItem('cart_coupon');
    } catch (e) {

      console.warn('[CartProvider] could not persist coupon code', e);
    }
  }, [couponCode]);

  const subtotal = items.reduce((acc, i) => acc + (Number(i.preco_venda) || 0) * i.quantity, 0);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  const fetchProduct = async (id: number) => {
    try {
      const res = await api.get(`/produtos/${id}`);
      return res.data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  };

  const addToCart = async (productId: number, qty = 1) => {
    const product = await fetchProduct(productId);
    if (!product) return { success: false, message: 'Produto não encontrado' };
    const estoque = Number(product.estoque ?? 0);
    const preco = Number(String(product.preco_venda ?? 0));
    setItems(prev => {
      const exists = prev.find(i => i.id_produto === productId);
      if (exists) {
        const newQty = Math.min(exists.quantity + qty, estoque);
        return prev.map(i => i.id_produto === productId ? { ...i, quantity: newQty } : i);
      }
      const novo: CartItem = {
        id_produto: product.id_produto,
        nome: product.nome,
        preco_venda: preco,
        imagem: product.imagem,
        quantity: Math.min(qty, estoque),
        estoque,
        descricao: product.descricao,
      };
      return [...prev, novo];
    });
    return { success: true };
  };

  const increase = async (productId: number) => {
    const product = await fetchProduct(productId);
    if (!product) return false;
    const estoque = Number(product.estoque ?? 0);
    let ok = false;
    setItems(prev => prev.map(i => {
      if (i.id_produto === productId) {
        const newQty = Math.min(i.quantity + 1, estoque);
        ok = newQty > i.quantity;
        return { ...i, quantity: newQty, estoque };
      }
      return i;
    }));
    return ok;
  };

  const decrease = (productId: number) => {
    setItems(prev => prev.map(i => i.id_produto === productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.id_produto !== productId));
  };

  const applyCoupon = (code: string) => {
    const upper = (code || '').toUpperCase().trim();
    const coupon = PRESET_COUPONS[upper];
    if (!coupon) return { success: false, discount: 0 };
    setCouponCode(upper);
    return { success: true, discount: coupon.type === 'fixed' ? coupon.value : (subtotal * coupon.value) / 100 };
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setAddressState(null);
  };

  const checkout = async (paymentMethod: string) => {
    for (const item of items) {
      const product = await fetchProduct(item.id_produto);
      const estoque = Number(product?.estoque ?? 0);
      if (item.quantity > estoque) {
        return { success: false, message: `Estoque insuficiente para ${item.nome}` };
      }
    }

    let idCliente = null;
    try {
        const storedUser = localStorage.getItem('usuario');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);

            idCliente = userObj.id_cliente ? Number(userObj.id_cliente) : null;
        }
    } catch (e) {
        console.error("Erro ao recuperar usuário para checkout", e);
    }

    if (!idCliente) {
        return { success: false, message: "Erro: Usuário não identificado. Faça login novamente." };
    }

    const desconto = couponCode ? (PRESET_COUPONS[couponCode]?.type === 'fixed' ? PRESET_COUPONS[couponCode].value : (subtotal * PRESET_COUPONS[couponCode].value) / 100) : 0;
    const total_venda = subtotal - desconto;

    try {
      const vendaRes = await api.post('/venda', { 
          id_cliente: idCliente,
          total_venda, 
          metodo_pagamento: paymentMethod 
      });
      
      const venda = vendaRes.data;
      const id_venda = venda.id_venda || vendaRes.data.id_venda || vendaRes.data.id || undefined;
      
      for (const item of items) {
        await api.post('/venda/itens', { 
            id_venda: id_venda ?? 0, 
            id_produto: item.id_produto, 
            quantidade: item.quantity, 
            preco_unitario_venda: Number(item.preco_venda) 
        });
      }

      clearCart();
      return { success: true, vendaId: id_venda };
    } catch (error) {
      console.error('Erro ao finalizar venda', error);
      return { success: false, message: 'Erro ao processar o pedido no servidor.' };
    }
  };

  console.debug('[CartProvider] itemsCount=', items.length, 'couponCode=', couponCode);
  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      increase,
      decrease,
      removeItem,
      subtotal,
      totalItems,
      couponCode,
      applyCoupon,
      address,
      setAddress: setAddressState,
      checkout,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('[useCart] context is undefined — useCart is being called outside CartProvider');
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;