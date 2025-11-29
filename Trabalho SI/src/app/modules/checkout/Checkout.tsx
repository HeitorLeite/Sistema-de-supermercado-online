import React, { useState } from 'react';

interface StatusInfo {
    index: number;
    label: string;
    color: string;
}

interface Order {
    id: string;
    customerName: string;
    items: string[];
    status: keyof typeof STATUS_MAP;
    deliveryAddress: string;
}

const STATUS_MAP: { [key: string]: StatusInfo } = {
    'PENDENTE': { index: 0, label: 'Pedido Confirmado', color: '!bg-slate-500' },
    'EM_PREPARACAO': { index: 1, label: 'Separação de Itens', color: '!bg-indigo-400' },
    'A_CAMINHO': { index: 2, label: 'Em Rota de Entrega', color: '!bg-indigo-600' },
    'ENTREGUE': { index: 3, label: 'Entregue', color: '!bg-blue-800' }
};

const CUSTOMER_ORDER_ID = 'PED-001';

const mockCustomerOrder: Order = {
    id: CUSTOMER_ORDER_ID,
    customerName: 'Cliente VIP Teste',
    items: [
        'Pão de forma integral (1x)',
        'Leite desnatado (2L)',
        'Ovos grandes (1 dúzia)',
        'Maçãs Gala (5 unidades)'
    ],
    status: 'A_CAMINHO',
    deliveryAddress: 'Rua das Flores, 123 - Centro',
};

const mockAdminOrders: Order[] = [
    { ...mockCustomerOrder, id: 'PED-001', status: 'A_CAMINHO' },
    { ...mockCustomerOrder, id: 'PED-002', customerName: 'João Silva', status: 'PENDENTE' },
    { ...mockCustomerOrder, id: 'PED-003', customerName: 'Maria Antunes', status: 'EM_PREPARACAO' },
    { ...mockCustomerOrder, id: 'PED-004', customerName: 'Roberto Paz', status: 'ENTREGUE' },
];

interface ModalProps {
    title: string;
    message: string;
    onClose: () => void;
}

const MessageModal: React.FC<ModalProps> = ({ title, message, onClose }) => {
    return (
        <div className="fixed inset-0 !bg-gray-900 !bg-opacity-50 flex items-center justify-center z-50">
            <div className="!bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
                <p className="text-gray-600 mb-5">{message}</p>
                <button
                    onClick={onClose}
                    className="!bg-blue-600 hover:!bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
};

const StatusBar: React.FC<{ status: keyof typeof STATUS_MAP }> = ({ status }) => {
    const statusData = STATUS_MAP[status];
    const currentIndex = statusData ? statusData.index : -1;
    const totalSteps = Object.keys(STATUS_MAP).length;
    const widthPercent = currentIndex >= 0 ? (currentIndex / (totalSteps - 1)) * 100 : 0;
    
    const dotStyle = "status-dot flex-col w-10 h-10 text-white rounded-full flex items-center justify-center transition duration-300";

    return (
        <div className="relative mb-12 pt-4">
            <div className="status-bar h-1.5 !bg-gray-200 rounded-full">
                <div className="status-line h-full rounded-full !bg-indigo-500 transition-all duration-500 ease-in-out" style={{ width: `${widthPercent}%` }}></div>
            </div>
            
            <div className="absolute w-full flex justify-between top-0">
                {Object.values(STATUS_MAP).map((data, index) => (
                    <div key={data.index} className="flex flex-col items-center relative -mt-4">
                        <div className={`${dotStyle} ${index <= currentIndex ? '!bg-indigo-600 shadow-xl scale-110' : '!bg-gray-300'}`}>
                        </div>
                        <span className={`text-xs mt-3 w-32 text-center font-semibold transition duration-300 ${index <= currentIndex ? 'text-indigo-700' : 'text-gray-500'}`}>
                            {data.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminOrderCard: React.FC<{ order: Order, onStatusChange: (status: keyof typeof STATUS_MAP) => void }> = ({ order, onStatusChange }) => {
    const statusInfo = STATUS_MAP[order.status] || { label: 'Desconhecido', color: '!bg-gray-400' };

    const borderColor = statusInfo.color.replace('!bg-', 'border-');

    return (
        <div className={`p-5 border-l-4 rounded-xl shadow-lg transition duration-200 !bg-white hover:shadow-xl ${borderColor}`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-gray-800">Pedido #{order.id}</h4>
                <span className={`font-semibold text-xs p-1.5 rounded-full text-white shadow-md ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Cliente: {order.customerName}</p>
            <p className="text-sm text-gray-600 mb-3 truncate">Endereço: {order.deliveryAddress}</p>
            
            <div className="flex flex-wrap gap-1.5 mb-4 border-b pb-3">
                {order.items.map((item, index) => (
                    <span key={index} className="inline-block !bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                        {item.split('(')[0].trim()}
                    </span>
                ))}
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
                {Object.entries(STATUS_MAP).map(([statusKey, data]) => (
                    <button 
                        key={statusKey}
                        onClick={() => onStatusChange(statusKey as keyof typeof STATUS_MAP)}
                        className={`text-xs font-semibold py-1 px-3 rounded-full transition duration-150 whitespace-nowrap shadow-sm
                        ${order.status === statusKey ? '!bg-gray-200 text-gray-500 cursor-not-allowed shadow-inner' : '!bg-blue-100 text-blue-700 hover:!bg-blue-600 hover:text-white'}`}
                        disabled={order.status === statusKey}
                    >
                        Marcar como {data.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Adicionando a prop onStatusChange para permitir a atualização do status pelo cliente
const CustomerView: React.FC<{ order: Order, onStatusChange: (status: keyof typeof STATUS_MAP) => void }> = ({ order, onStatusChange }) => {
    const statusInfo = STATUS_MAP[order.status];
    const canConfirmDelivery = order.status === 'A_CAMINHO';

    return (
        <div className="p-6 sm:p-8 rounded-xl shadow-2xl !bg-white">
            <h2 className="text-3xl font-bold mb-8 text-indigo-700 text-center">Acompanhe Sua Entrega</h2>

            <div className="p-6 !bg-blue-50 rounded-xl border border-blue-200 shadow-inner">
                <h3 className="text-xl font-bold text-indigo-800 mb-6">Pedido #{order.id} - {order.customerName}</h3>
                
                <StatusBar status={order.status} />

                <p className="text-sm text-gray-700 mt-10 p-4 !bg-white rounded-lg shadow-md border-l-4 border-indigo-400">
                    <span className="font-semibold">Status Atual:</span> 
                    <span className={`font-bold ml-2 p-1 rounded-md text-white shadow-sm ${statusInfo.color}`}>{statusInfo.label}</span>
                </p>
                
                {/* Botão para o cliente confirmar a entrega */}
                {canConfirmDelivery && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => onStatusChange('ENTREGUE')}
                            className="w-full !bg-green-500 hover:!bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200 disabled:!bg-gray-400"
                        >
                            Confirmar Entrega Recebida
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Apenas clique quando tiver recebido o seu pedido.
                        </p>
                    </div>
                )}

                <div className="mt-8 border-t pt-6">
                    <p className="font-semibold text-gray-800 mb-2">Endereço de Entrega:</p>
                    <p className="text-gray-600 mb-4 !bg-gray-50 p-2 rounded-lg">{order.deliveryAddress}</p>

                    <p className="font-semibold text-gray-800 mb-2">Itens do Pedido:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 p-2 !bg-gray-50 rounded-lg">
                        {order.items.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const AdminView: React.FC<{ orders: Order[], onStatusChange: (orderId: string, status: keyof typeof STATUS_MAP) => void }> = ({ orders, onStatusChange }) => {
    return (
        <div className="p-6 sm:p-8 rounded-xl shadow-2xl !bg-white">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Painel de Administração de Pedidos (Layout)</h2>
            
            <div className="!bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
                <p className="text-sm text-red-700 font-medium">⚠️ Este é apenas o layout. A funcionalidade de alteração de status é simulada.</p>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-700">Pedidos Recebidos ({orders.length})</h3>
                <button
                    onClick={() => onStatusChange('LAYOUT_ONLY', 'PENDENTE')}
                    className="!bg-indigo-500 hover:!bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 text-sm"
                >
                    Adicionar Pedido de Exemplo (Simulado)
                </button>
            </div>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <p className="text-gray-500 italic">Nenhum pedido mockado.</p>
                ) : (
                    orders.map(order => (
                        <AdminOrderCard 
                            key={order.id} 
                            order={order} 
                            onStatusChange={(status) => onStatusChange(order.id, status)} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [mode, setMode] = useState<'customer' | 'admin'>('customer');
    const [modal, setModal] = useState<{ title: string; message: string; visible: boolean }>({ title: '', message: '', visible: false });
    const [customerStatus, setCustomerStatus] = useState<keyof typeof STATUS_MAP>(mockCustomerOrder.status);

    const showModal = (title: string, message: string) => {
        setModal({ title, message, visible: true });
    };

    const closeModal = () => {
        setModal({ ...modal, visible: false });
    };
    
    // Função unificada de atualização de status para simular
    const simulateStatusUpdate = (orderId: string, newStatus: keyof typeof STATUS_MAP) => {
        if (orderId === CUSTOMER_ORDER_ID) {
            setCustomerStatus(newStatus);
            showModal('Status Alterado (Simulação)', `O status do pedido ${orderId} foi simuladamente alterado para: ${STATUS_MAP[newStatus].label}`);
        } else if (orderId === 'LAYOUT_ONLY') {
            showModal('Adicionar Pedido (Simulação)', 'Esta é a área para o botão "Adicionar". O layout está correto.');
        } else {
            showModal('Ação Simulada', `Ação de status para ${orderId} simulada: ${STATUS_MAP[newStatus].label}.`);
        }
    }

    // Função específica para o CustomerView usar (passa apenas o novo status)
    const handleCustomerStatusChange = (newStatus: keyof typeof STATUS_MAP) => {
        simulateStatusUpdate(CUSTOMER_ORDER_ID, newStatus);
    }

    const currentCustomerOrder: Order = { ...mockCustomerOrder, status: customerStatus };

    return (
        <div className="!bg-gray-100 min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto pt-4">

                <div className="mt-30 flex justify-center mb-10 !bg-white p-2 rounded-xl shadow-2xl">
                    <button
                        onClick={() => setMode('customer')}
                        className={`p-3 w-1/2 text-center text-base font-bold rounded-lg transition duration-200 ${mode === 'customer' ? '!bg-indigo-600 text-white shadow-xl' : 'text-gray-700 hover:!bg-gray-100'}`}
                    >
                        Visão do Cliente
                    </button>
                    <button
                        onClick={() => setMode('admin')}
                        className={`p-3 w-1/2 text-center text-base font-bold rounded-lg transition duration-200 ${mode === 'admin' ? '!bg-indigo-600 text-white shadow-xl' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Painel Admin
                    </button>
                </div>

                {mode === 'customer' 
                    ? <CustomerView order={currentCustomerOrder} onStatusChange={handleCustomerStatusChange} /> 
                    : <AdminView orders={mockAdminOrders} onStatusChange={simulateStatusUpdate} />}

                {modal.visible && <MessageModal title={modal.title} message={modal.message} onClose={closeModal} />}
            </div>
        </div>
    );
};

export default App;