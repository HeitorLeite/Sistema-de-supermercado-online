import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface NavItem {
    name: string;
    icon: string;
    target: string;
}

interface FirestoreInterface {
    db: () => any;
    collection: (db: any, path: string) => string;
    addDoc: (ref: string, data: any) => Promise<{ id: string }>;
    doc: (db: any, path: string, id: string) => string;
    updateDoc: (ref: string, data: any) => Promise<void>;
    deleteDoc: (ref: string) => Promise<void>;
    query: (ref: string, ...constraints: string[]) => string;
    where: (field: string, op: string, value: any) => string;
    onSnapshot: (q: string, callback: (snapshot: any) => void, onError?: (err: any) => void) => () => void;
}

interface Delivery {
    id: string;
    packageId: string;
    address: string;
    status: 'pendente' | 'em rota' | 'entregue' | string;
    createdAt?: number;
}

interface Task {
    id: string;
    name: string;
    completed: boolean;
    createdAt: number;
}

interface ContentProps {
    firestore: FirestoreInterface;
    userId: string | null;
    appId: string;
    isAuthReady: boolean;
    currentUserType: keyof typeof navigation;
}

type UserRole = 'admin' | 'supplier' | 'delivery' | 'client';


const firebaseImports: { [key: string]: any } = {
    initializeApp: (config: any) => ({}),
    getAuth: (app: any) => ({}),
    signInAnonymously: (auth: any) => ({ user: { uid: 'simulated-user-id-from-auth-call' } }), 
    signInWithCustomToken: (auth: any, token: string) => ({ user: { uid: 'simulated-user-id-from-token-call' } }),
    onAuthStateChanged: (auth: any, callback: (user: { uid: string } | null) => void) => {
        const user = { uid: 'simulated-user-id-initial' };
        callback(user);
        return () => {};
    },
    getFirestore: (app: any) => ({}),
    setLogLevel: () => {},
    onSnapshot: (q: string, callback: (snapshot: any) => void, onError: (err: any) => void) => {
        const mockData = [
            { id: 't1', data: () => ({ name: 'Revisar logs', completed: false, createdAt: 1678886400000 }) },
            { id: 't2', data: () => ({ name: 'Responder ticket 45', completed: true, createdAt: 1678886400001 }) },
            { id: 'd1', data: () => ({ id: 'd1', packageId: 'P-1001', address: 'Rua A, 123', status: 'pendente', createdAt: 1678886400002 }) },
            { id: 'd2', data: () => ({ id: 'd2', packageId: 'P-1002', address: 'Av. B, 456', status: 'em rota', createdAt: 1678886400003 }) },
        ];
        
        const mockSnapshot = {
            docs: mockData.filter(doc => (q.includes('adminTasks') && doc.id.startsWith('t')) || (q.includes('deliveries') && doc.id.startsWith('d'))),
            map: Array.prototype.map.bind(mockData)
        };
        
        setTimeout(() => callback(mockSnapshot), 500);
        return () => {};
    },
    collection: (db: any, path: string) => path,
    addDoc: async (ref: string, data: any) => { console.log('Mock Add:', ref, data); return { id: `new-doc-${Date.now()}` }; },
    doc: (db: any, path: string, id: string) => `${path}/${id}`,
    updateDoc: async (ref: string, data: any) => console.log('Mock Update:', ref, data),
    deleteDoc: async (ref: string) => console.log('Mock Delete:', ref),
    query: (ref: string, ...constraints: string[]) => ref + constraints.join(''), 
    where: (field: string, op: string, value: any) => `|where ${field} ${op} ${value}`, 
};

let app: any, db: any, auth: any;

const navigation: { [key in UserRole]: NavItem[] } = {
    admin: [
        { name: 'Dashboard Admin', icon: 'bar-chart-3', target: 'admin-dashboard' },
        { name: 'Gestão de Usuários', icon: 'users', target: 'admin-users' },
        { name: 'Tarefas Pendentes', icon: 'clipboard-list', target: 'admin-tasks' },
        { name: 'Configurações', icon: 'settings', target: 'admin-settings' },
    ],
    supplier: [
        { name: 'Visão Geral', icon: 'package', target: 'supplier-overview' },
        { name: 'Meus Produtos', icon: 'boxes', target: 'supplier-products' },
        { name: 'Pedidos Recebidos', icon: 'truck', target: 'supplier-orders' },
        { name: 'Pagamentos', icon: 'wallet', target: 'supplier-payments' },
    ],
    delivery: [
        { name: 'Minhas Entregas', icon: 'map-pin', target: 'delivery-map' },
        { name: 'Próximos Pedidos', icon: 'package-open', target: 'delivery-queue' },
        { name: 'Histórico', icon: 'history', target: 'delivery-history' },
    ],
    client: [
        { name: 'Catálogo', icon: 'store', target: 'client-catalog' },
        { name: 'Meus Pedidos', icon: 'shopping-bag', target: 'client-orders' },
        { name: 'Meu Perfil', icon: 'user', target: 'client-profile' },
    ]
};

const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-5 h-5' }) => {
    return (
        <div className={`icon-box ${className}`} style={{ minWidth: '20px', minHeight: '20px', display: 'flex', alignItems: 'center' }}>
            <svg data-lucide={name} className={className}></svg>
        </div>
    );
};


const DeliveryQueue: React.FC<ContentProps> = ({ firestore, userId, appId, isAuthReady }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fs: FirestoreInterface = firestore;

    useEffect(() => {
        if (!isAuthReady || !userId) return;

        const collectionPath = `artifacts/${appId}/users/${userId}/deliveries`;
        const deliveriesRef = fs.collection(fs.db(), collectionPath);
        
        const deliveriesQuery = fs.query(deliveriesRef, fs.where('status', 'in', ['pendente', 'em rota']));
        
        setIsLoading(true);
        setError('');

        const unsubscribe = fs.onSnapshot(deliveriesQuery, (snapshot: any) => {
            try {
                const fetchedDeliveries: Delivery[] = snapshot.docs
                    .filter((doc: any) => doc.id.startsWith('d')) 
                    .map((doc: any) => ({
                        id: doc.id,
                        ...(doc.data() as Omit<Delivery, 'id'>)
                    }));

                fetchedDeliveries.sort((a, b) => {
                    if (a.status === 'em rota' && b.status === 'pendente') return -1;
                    if (a.status === 'pendente' && b.status === 'em rota') return 1;
                    return (a.createdAt || 0) - (b.createdAt || 0);
                });
                setDeliveries(fetchedDeliveries);
                setIsLoading(false);
            } catch (e) {
                console.error("Erro ao carregar entregas:", e);
                setError("Erro ao carregar entregas. Verifique o console.");
                setIsLoading(false);
            }
        }, (err: any) => {
            console.error("Erro no onSnapshot de entregas:", err);
            setError("Falha na conexão em tempo real com o Firestore.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, userId, appId, fs]);

    const handleUpdateStatus = useCallback(async (id: string, newStatus: Delivery['status']) => {
        if (!isAuthReady || !userId) return;

        try {
            const collectionPath = `artifacts/${appId}/users/${userId}/deliveries`;
            const deliveryRef = fs.doc(fs.db(), collectionPath, id);
            await fs.updateDoc(deliveryRef, { status: newStatus });
            setError('');
        } catch (e) {
            console.error("Erro ao atualizar status:", e);
            setError("Falha ao atualizar o status da entrega.");
        }
    }, [isAuthReady, userId, appId, fs]);

    const StatusButton: React.FC<{ delivery: Delivery }> = ({ delivery }) => {
        if (delivery.status === 'em rota') {
            return (
                <button onClick={() => handleUpdateStatus(delivery.id, 'entregue')} className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white hover:bg-green-600 transition duration-150">
                    Concluir Entrega
                </button>
            );
        }
        if (delivery.status === 'pendente') {
            return (
                <button onClick={() => handleUpdateStatus(delivery.id, 'em rota')} className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition duration-150">
                    Iniciar Rota
                </button>
            );
        }
        return <span className="text-xs text-gray-500 capitalize">{delivery.status}</span>;
    };

    return (
        <div className="mt-30 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Próximos Pedidos (Dados Privados)</h3>
            
            {error && <div className="text-red-600 mb-4 p-3 bg-red-100 rounded-lg">{error}</div>}

            <div className="space-y-4">
                {isLoading ? (
                    <p className="text-center text-gray-500 italic">Carregando fila de entregas...</p>
                ) : deliveries.length === 0 ? (
                    <p className="text-center text-gray-500 italic">Sua fila de entregas está vazia. Bom trabalho!</p>
                ) : (
                    deliveries.map((delivery) => (
                        <div key={delivery.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition duration-150">
                            <div className="flex items-center space-x-4">
                                <span className={`icon-box w-10 h-10 flex items-center justify-center rounded-full ${delivery.status === 'em rota' ? 'bg-indigo-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}>
                                    <Icon name={delivery.status === 'em rota' ? 'bike' : 'package-open'} className="w-6 h-6" />
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-800">Pedido **#{delivery.packageId || 'N/A'}**</p>
                                    <p className="text-sm text-gray-600">{delivery.address || 'Endereço não informado'}</p>
                                    <p className="text-xs font-medium mt-1">Status: <span className={`capitalize font-bold ${delivery.status === 'em rota' ? 'text-indigo-500' : 'text-yellow-700'}`}>{delivery.status}</span></p>
                                </div>
                            </div>
                            <StatusButton delivery={delivery} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const AdminTasks: React.FC<ContentProps> = ({ firestore, appId, isAuthReady }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskName, setNewTaskName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fs: FirestoreInterface = firestore;

    useEffect(() => {
        if (!isAuthReady) return;

        const collectionPath = `artifacts/${appId}/public/data/adminTasks`;
        const tasksRef = fs.collection(fs.db(), collectionPath);
        
        const tasksQuery = fs.query(tasksRef); 
        
        setIsLoading(true);
        setError('');

        const unsubscribe = fs.onSnapshot(tasksQuery, (snapshot: any) => {
            try {
                const fetchedTasks: Task[] = snapshot.docs
                    .filter((doc: any) => doc.id.startsWith('t'))
                    .map((doc: any) => ({
                        id: doc.id,
                        ...(doc.data() as Omit<Task, 'id'>)
                    }));

                fetchedTasks.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1) || (a.createdAt - b.createdAt));
                
                setTasks(fetchedTasks);
                setIsLoading(false);
            } catch (e) {
                console.error("Erro ao carregar tarefas:", e);
                setError("Erro ao carregar tarefas. Verifique o console.");
                setIsLoading(false);
            }
        }, (err: any) => {
            console.error("Erro no onSnapshot de tarefas:", err);
            setError("Falha na conexão em tempo real com o Firestore.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, appId, fs]);

    const handleAddTask = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskName.trim() === '' || !isAuthReady) return;

        try {
            const collectionPath = `artifacts/${appId}/public/data/adminTasks`;
            const tasksRef = fs.collection(fs.db(), collectionPath);
            await fs.addDoc(tasksRef, {
                name: newTaskName,
                completed: false,
                createdAt: Date.now()
            });
            setNewTaskName('');
            setError('');
        } catch (e) {
            console.error("Erro ao adicionar a tarefa:", e);
            setError("Falha ao adicionar a tarefa.");
        }
    }, [newTaskName, isAuthReady, appId, fs]);

    const handleToggleTask = useCallback(async (id: string, completed: boolean) => {
        if (!isAuthReady) return;
        try {
            const collectionPath = `artifacts/${appId}/public/data/adminTasks`;
            const taskRef = fs.doc(fs.db(), collectionPath, id);
            await fs.updateDoc(taskRef, { completed: !completed });
            setError('');
        } catch (e) {
            console.error("Erro ao atualizar tarefa:", e);
            setError("Falha ao atualizar o status da tarefa.");
        }
    }, [isAuthReady, appId, fs]);

    const handleDeleteTask = useCallback(async (id: string) => {
        if (!isAuthReady) return;
        try {
            const collectionPath = `artifacts/${appId}/public/data/adminTasks`;
            const taskRef = fs.doc(fs.db(), collectionPath, id);
            await fs.deleteDoc(taskRef);
            setError('');
        } catch (e) {
            console.error("Erro ao deletar tarefa:", e);
            setError("Falha ao deletar a tarefa.");
        }
    }, [isAuthReady, appId, fs]);


    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Tarefas Administrativas (Dados Públicos)</h3>
            
            <form onSubmit={handleAddTask} className="flex mb-6 space-x-2">
                <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Adicionar nova tarefa..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150">
                    <Icon name="plus" className="w-5 h-5" />
                </button>
            </form>

            {error && <div className="text-red-600 mb-4 p-3 bg-red-100 rounded-lg">{error}</div>}

            <div className="space-y-3">
                {isLoading ? (
                    <p className="text-center text-gray-500 italic">Carregando tarefas...</p>
                ) : tasks.length === 0 ? (
                    <p className="text-center text-gray-500 italic">Nenhuma tarefa pendente. Tudo certo!</p>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleTask(task.id, task.completed)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className={`text-gray-800 ${task.completed ? 'line-through text-gray-500 italic' : 'font-medium'}`}>
                                    {task.name} 
                                </span>
                            </div>
                            <button 
                                onClick={() => handleDeleteTask(task.id)} 
                                className="p-1 text-red-500 hover:text-red-700 rounded-full transition duration-150"
                                aria-label="Excluir Tarefa"
                            >
                                <Icon name="trash-2" className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<ContentProps> = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">... Admin Metric 1 ...</div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">... Admin Metric 2 ...</div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">... Admin Metric 3 ...</div>
    </div>
); 
const SupplierOverview: React.FC<ContentProps> = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">... Supplier Metric 1 ...</div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">... Supplier Metric 2 ...</div>
    </div>
);
const ClientCatalog: React.FC<ContentProps> = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">... Product Card 1 ...</div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">... Product Card 2 ...</div>
    </div>
);


const FallbackContent: React.FC<ContentProps & { target: string, name: string }> = ({ name, currentUserType }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600">Este é o painel para **{name}**.</p>
        <p className="mt-4 text-sm text-gray-500">Funcionalidade em desenvolvimento para o perfil **{currentUserType}**.</p>
    </div>
);


const Sidebar: React.FC<{ userType: UserRole, currentView: string, onViewChange: (view: string) => void }> = ({ userType, currentView, onViewChange }) => {
    const items = navigation[userType] || [];

    return (
        <nav id="sidebar" className="w-64 bg-white shadow-xl p-4 transition-all duration-300 border-r border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Menu {userType.charAt(0).toUpperCase() + userType.slice(1)}</h2>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item.target}>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); onViewChange(item.target); }}
                            className={`flex items-center p-3 text-sm font-medium rounded-lg transition duration-200 
                                ${currentView === item.target ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-indigo-500 hover:text-white'}`
                            }
                        >
                            <Icon name={item.icon} className="w-5 h-5 mr-3" />
                            <span>{item.name}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const ContentRouter: React.FC<ContentProps & { currentView: string }> = ({ currentView, ...props }) => {
    
    let ContentComponent: React.FC<ContentProps> = FallbackContent as any;
    let title = 'Bem-vindo';
    let item: NavItem | undefined;

    for (const key in navigation) {
        item = navigation[key as UserRole].find(i => i.target === currentView);
        if (item) {
            title = item.name;
            break;
        }
    }
    
    switch (currentView) {
        case 'admin-dashboard': ContentComponent = AdminDashboard; break;
        case 'admin-tasks': ContentComponent = AdminTasks; break;
        case 'supplier-overview': ContentComponent = SupplierOverview; break;
        case 'delivery-queue': ContentComponent = DeliveryQueue; break;
        case 'client-catalog': ContentComponent = ClientCatalog; break;
        default: 
            ContentComponent = () => <FallbackContent {...props} target={currentView} name={item?.name || 'Página'} />;
            break;
    }

    return (
        <main id="main-content" className="main-content-area flex-1 p-8 overflow-y-auto">
             <div className="border-b pb-4 mb-6 flex justify-between items-center bg-gray-50 sticky top-0 z-0">
                <h2 className="text-3xl font-semibold text-gray-800">{title}</h2>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700">
                    Perfil: {props.currentUserType.charAt(0).toUpperCase() + props.currentUserType.slice(1)}
                </span>
            </div>
            
            <div className="content-wrapper">
                <ContentComponent {...props} />
            </div>
        </main>
    );
};

const Users: React.FC = () => {
    const [currentUserType, setCurrentUserType] = useState<UserRole>('admin');
    const [currentView, setCurrentView] = useState<string>('admin-dashboard');
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [dbStatus, setDbStatus] = useState<string>('Aguardando Conexão...');
    const [dbStatusClass, setDbStatusClass] = useState<string>('bg-yellow-100 text-yellow-700');

    const appId = useMemo(() => 'dynamic-user-screen-app', []);
    const firebaseConfig = useMemo(() => null, []); 
    const initialAuthToken = useMemo(() => null, []);
    
    const firestore: FirestoreInterface = useMemo(() => {
        if (!firebaseConfig) {
            return { db: () => firebaseImports.getFirestore(), ...firebaseImports } as FirestoreInterface;
        }
        return { db: () => db, ...firebaseImports } as FirestoreInterface;
    }, [firebaseConfig]);

    useEffect(() => {
        if (!firebaseConfig) {
            setDbStatus("Simulação de Dados (Offline)");
            setDbStatusClass('bg-yellow-100 text-yellow-700');
            setUserId(firebaseImports.signInAnonymously().user.uid);
            setIsAuthReady(true);
            return;
        }
    }, [firebaseConfig, initialAuthToken]);

    useEffect(() => {
        const firstTarget = navigation[currentUserType]?.[0]?.target || `${currentUserType}-dashboard`;
        setCurrentView(firstTarget);
    }, [currentUserType]);

    const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentUserType(e.target.value as UserRole);
    };

    const contentProps: ContentProps = { firestore, userId, appId, isAuthReady, currentUserType };

    if (!isAuthReady) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl font-medium text-gray-700">Conectando ao serviço de autenticação...</p>
            </div>
        );
    }

    return (
        <div id="app-container" className="mt-30 flex flex-col min-h-screen font-sans">
            <header className="flex items-center justify-between p-4 bg-white shadow-md z-10 sticky top-0 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-indigo-600 flex items-center">
                    <Icon name="layout-dashboard" className="w-6 h-6 mr-2" />
                    Dashboard Dinâmico
                </h1>

                <div className="flex items-center space-x-4">
                    <span id="db-status" className={`px-3 py-1 text-xs font-semibold rounded-full transition duration-300 ${dbStatusClass}`}>
                        {dbStatus}
                    </span>

                    <select id="user-selector" value={currentUserType} onChange={handleUserTypeChange} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="admin">👑 Admin</option>
                        <option value="supplier">📦 Fornecedor</option>
                        <option value="delivery">🛵 Entregador</option>
                        <option value="client">👤 Cliente</option>
                    </select>
                    <Icon name="user-circle" className="w-8 h-8 text-gray-400" />
                </div>
            </header>

            <div className="flex flex-1 bg-gray-50">
                <Sidebar 
                    userType={currentUserType} 
                    currentView={currentView} 
                    onViewChange={setCurrentView} 
                />

                <ContentRouter 
                    currentView={currentView} 
                    {...contentProps} 
                />
            </div>
        </div>
    );
};

export default Users;