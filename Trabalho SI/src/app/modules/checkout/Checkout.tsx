import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Package, Truck, Check, Clock } from 'lucide-react';

interface StatusInfo {
    index: number;
    label: string;
    color: string;
    icon: any;
}

// Mapa de Status
const STATUS_MAP: { [key: string]: StatusInfo } = {
    'PENDENTE': { index: 0, label: 'Confirmado', color: '!bg-slate-500', icon: Clock },
    'EM_PREPARACAO': { index: 1, label: 'Em Preparação', color: '!bg-indigo-400', icon: Package },
    'A_CAMINHO': { index: 2, label: 'A Caminho', color: '!bg-indigo-600', icon: Truck },
    'ENTREGUE': { index: 3, label: 'Entregue', color: '!bg-green-600', icon: Check }
};

type ItemVenda = {
    id_produto: number;
    quantidade: number;
    produtos: {
        nome: string;
    }
}

type Order = {
    id_venda: number;
    data_venda: string;
    total_venda: string;
    status: string;
    metodo_pagamento: string;
    clientes: {
        nome: string;
        endereco: string;
    };
    itens_venda: ItemVenda[];
}

const StatusBar: React.FC<{ status: string }> = ({ status }) => {
    // Normaliza status para garantir compatibilidade
    const currentKey = Object.keys(STATUS_MAP).includes(status) ? status : 'PENDENTE';
    const statusData = STATUS_MAP[currentKey];
    const currentIndex = statusData.index;
    const totalSteps = Object.keys(STATUS_MAP).length;
    const widthPercent = (currentIndex / (totalSteps - 1)) * 100;
    
    return (
        <div className="relative mb-12 pt-6 px-4">
            <div className="h-1.5 bg-gray-200 rounded-full w-full absolute top-1/2 -translate-y-1/2 left-0 z-0"></div>
            <div 
                className="h-1.5 bg-indigo-500 rounded-full absolute top-1/2 -translate-y-1/2 left-0 z-0 transition-all duration-500" 
                style={{ width: `${widthPercent}%` }}
            ></div>
            
            <div className="relative w-full flex justify-between z-10">
                {Object.entries(STATUS_MAP).map(([key, data], index) => {
                    const isActive = index <= currentIndex;
                    const Icon = data.icon;
                    return (
                        <div key={key} className="flex flex-col items-center">
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-sm
                                ${isActive ? 'bg-indigo-600 text-white scale-110' : 'bg-gray-300 text-gray-500'}`}
                            >
                                <Icon size={18} />
                            </div>
                            <span className={`text-xs mt-2 font-bold ${isActive ? 'text-indigo-700' : 'text-gray-400'}`}>
                                {data.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OrderCard: React.FC<{ order: Order, isAdmin: boolean, onStatusChange?: (id: number, status: string) => void }> = ({ order, isAdmin, onStatusChange }) => {
    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP['PENDENTE'];
    const date = new Date(order.data_venda).toLocaleDateString('pt-BR');

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Header do Card */}
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Pedido #{order.id_venda}</h3>
                    <p className="text-xs text-gray-500">{date} • {order.metodo_pagamento === 'credit' ? 'Cartão de Crédito' : order.metodo_pagamento}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${statusInfo.color.replace('!', '')}`}>
                    {statusInfo.label}
                </div>
            </div>

            {/* Corpo do Card */}
            <div className="p-5">
                {/* Se for Cliente, mostra barra de progresso detalhada */}
                {!isAdmin && <StatusBar status={order.status} />}

                <div className="flex flex-col md:flex-row gap-6 mt-4">
                    {/* Informações de Entrega */}
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Entrega</h4>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="font-bold text-gray-800">{order.clientes?.nome || 'Cliente Removido'}</p>
                            <p className="text-sm text-gray-600 mt-1">{order.clientes?.endereco || 'Endereço não disponível'}</p>
                        </div>
                    </div>

                    {/* Lista de Itens */}
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Itens</h4>
                        <ul className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2 max-h-40 overflow-y-auto">
                            {order.itens_venda.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex justify-between border-b border-gray-200 pb-1 last:border-0 last:pb-0">
                                    <span>{item.produtos?.nome || 'Produto Indisponível'}</span>
                                    <span className="font-bold text-gray-900">x{item.quantidade}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Área de Ação do Admin */}
                {isAdmin && onStatusChange && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Atualizar Status</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(STATUS_MAP).map((statusKey) => (
                                <button
                                    key={statusKey}
                                    onClick={() => onStatusChange(order.id_venda, statusKey)}
                                    disabled={order.status === statusKey}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors
                                        ${order.status === statusKey 
                                            ? 'bg-gray-800 text-white cursor-default' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 border border-gray-200'
                                        }
                                    `}
                                >
                                    {STATUS_MAP[statusKey].label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer com Total */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Total do Pedido</span>
                <span className="text-xl font-extrabold text-indigo-700">R$ {Number(order.total_venda).toFixed(2)}</span>
            </div>
        </div>
    );
};

const Checkout = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'admin' | 'cliente' | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem("usuario");
            if (!storedUser) return; // Redirecionar se não logado seria ideal

            const userObj = JSON.parse(storedUser);
            const isAdmin = !!userObj.id_adm;
            const id = isAdmin ? userObj.id_adm : userObj.id_cliente;

            setUserRole(isAdmin ? 'admin' : 'cliente');

            const endpoint = isAdmin 
                ? "/vendas" 
                : `/vendas/cliente/${id}`;

            const response = await api.get(endpoint);
            setOrders(response.data);
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            await api.put(`/vendas/${orderId}/status`, { status: newStatus });
            // Atualiza a lista localmente para refletir a mudança instantaneamente
            setOrders(orders.map(order => 
                order.id_venda === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            alert("Erro ao atualizar status do pedido.");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 pt-24">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            {userRole === 'admin' ? 'Painel de Pedidos' : 'Meus Pedidos'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {userRole === 'admin' 
                                ? 'Gerencie o status e visualize todos os pedidos da loja.' 
                                : 'Acompanhe o status e histórico das suas compras.'}
                        </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 mt-4 md:mt-0">
                        <span className="text-sm text-gray-500 font-medium">Total de Pedidos: </span>
                        <span className="text-lg font-bold text-indigo-600">{orders.length}</span>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">Nenhum pedido encontrado</h3>
                        <p className="text-gray-500">Parece que ainda não há histórico de compras.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <OrderCard 
                                key={order.id_venda} 
                                order={order} 
                                isAdmin={userRole === 'admin'}
                                onStatusChange={userRole === 'admin' ? handleStatusChange : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;