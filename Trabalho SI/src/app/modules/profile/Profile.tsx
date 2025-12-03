import { useState, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  UserPlus, 
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Edit,
  Search,
  Shield,
  X
} from "lucide-react";
import api from "../../../services/api";

type UserData = {
  id_cliente?: number;
  id_adm?: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
  data_nascimento?: string;
  senha?: string;
};

type Task = {
  id_tarefa: number;
  descricao: string;
  concluida: boolean;
};

type DashboardStats = {
  vendas: number;
  clientes: number;
  produtos: number;
  pedidos: number;
};

const Notification = ({ msg, type }: { msg: string, type: 'success' | 'error' }) => {
  if (!msg) return null;
  return (
    <div className={`p-4 mb-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span>{msg}</span>
    </div>
  );
};

const ClientProfile = ({ user }: { user: UserData }) => {
  const [formData, setFormData] = useState<UserData>(user);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.id_cliente) return;
    setLoading(true);
    setMsg(null);
    try {
      await api.put(`/cliente/${formData.id_cliente}`, formData);
      localStorage.setItem("usuario", JSON.stringify(formData));
      setMsg({ text: "Dados atualizados com sucesso!", type: "success" });
    } catch (error) {
      console.error(error);
      setMsg({ text: "Erro ao atualizar dados.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-4 mb-8 border-b pb-4">
        <div className="bg-blue-100 p-4 rounded-full">
          <User size={40} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Minha Conta</h2>
          <p className="text-gray-500">Gerencie suas informações pessoais</p>
        </div>
      </div>

      {msg && <Notification msg={msg.text} type={msg.type} />}

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Não editável)</label>
            <input 
              value={formData.cpf} 
              disabled 
              className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
            <input 
              name="telefone"
              value={formData.telefone || ""}
              onChange={handleChange}
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
            <input 
              name="endereco"
              value={formData.endereco || ""}
              onChange={handleChange}
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all shadow-md
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:-translate-y-0.5'}
          `}
        >
          <Save size={20} />
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
};


const AdminStats = () => {
  const [stats, setStats] = useState<DashboardStats>({ vendas: 0, clientes: 0, produtos: 0, pedidos: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Erro ao carregar stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">Faturamento Total</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              R$ {Number(stats.vendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              Vendas realizadas
            </p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><LayoutDashboard size={28}/></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Clientes</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.clientes}</h3>
            <p className="text-xs text-blue-500 mt-1">Usuários cadastrados</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={28}/></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">Produtos em Estoque</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.produtos}</h3>
            <p className="text-xs text-orange-500 mt-1">Total de SKUs</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ClipboardList size={28}/></div>
        </div>
      </div>
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSave }: { user: UserData, onClose: () => void, onSave: (u: UserData) => void }) => {
  const [form, setForm] = useState(user);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between items-center">
          Editar Usuário
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </h3>
        <div className="space-y-3">
          <input className="w-full p-2 border rounded-lg" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome" />
          <input className="w-full p-2 border rounded-lg" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" />
          <input className="w-full p-2 border rounded-lg" value={form.telefone || ''} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="Telefone" />
          <input className="w-full p-2 border rounded-lg" value={form.endereco || ''} onChange={e => setForm({...form, endereco: e.target.value})} placeholder="Endereço" />
          
          <button 
            onClick={() => onSave(form)} 
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [view, setView] = useState<'clientes' | 'admins'>('clientes');
  const [users, setUsers] = useState<UserData[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [view]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = view === 'clientes' ? "/clientes" : "/administradores";
      const res = await api.get(endpoint);
      setUsers(res.data);
    } catch (error) {
      console.error("Erro ao buscar usuários", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updatedUser: UserData) => {
    try {
      const id = updatedUser.id_cliente || updatedUser.id_adm;

      const endpoint = view === 'clientes' 
        ? `/cliente/${id}` 
        : `/administrador/cadastro/${id}`;

      await api.put(endpoint, updatedUser);
      

      setUsers(users.map(u => {
        const uId = u.id_cliente || u.id_adm;
        return uId === id ? { ...u, ...updatedUser } : u;
      }));
      
      setEditingUser(null);
      alert("Usuário atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar usuário.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {view === 'clientes' ? <Users className="text-blue-600"/> : <Shield className="text-purple-600"/>}
          Gestão de {view === 'clientes' ? 'Clientes' : 'Administradores'}
        </h2>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('clientes')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${view === 'clientes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Clientes
          </button>
          <button 
            onClick={() => setView('admins')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${view === 'admins' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Admins
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder={`Buscar ${view}...`} 
          className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-2">Nome</th>
              <th className="py-3 px-2">Email</th>
              <th className="py-3 px-2">Telefone</th>
              <th className="py-3 px-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8">Carregando...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhum usuário encontrado.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id_cliente || user.id_adm} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-3 px-2 font-medium">{user.nome}</td>
                  <td className="py-3 px-2">{user.email}</td>
                  <td className="py-3 px-2">{user.telefone || '-'}</td>
                  <td className="py-3 px-2 text-right">

                    <button 
                      onClick={() => setEditingUser(user)}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleUpdateUser} 
        />
      )}
    </div>
  );
};

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tarefas");
      setTasks(res.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas", error);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    try {
      const res = await api.post("/tarefas", { descricao: newTaskText });
      setTasks([res.data, ...tasks]);
      setNewTaskText("");
    } catch (error) {
      console.error("Erro ao adicionar tarefa", error);
    }
  };

  const toggleTask = async (task: Task) => {
    try {

      const newStatus = !task.concluida;
      setTasks(tasks.map(t => t.id_tarefa === task.id_tarefa ? { ...t, concluida: newStatus } : t));
      
      await api.put(`/tarefas/${task.id_tarefa}`, { concluida: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar tarefa", error);
      fetchTasks();
    }
  };

  const removeTask = async (id: number) => {
    try {
      await api.delete(`/tarefas/${id}`);
      setTasks(tasks.filter(t => t.id_tarefa !== id));
    } catch (error) {
      console.error("Erro ao remover tarefa", error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ClipboardList className="text-orange-500" /> Tarefas Pendentes
      </h2>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Adicionar nova tarefa..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button 
          onClick={addTask}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={24} />
        </button>
      </div>

      <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {tasks.length === 0 && <p className="text-center text-gray-400 py-4">Nenhuma tarefa pendente.</p>}
        {tasks.map((task) => (
          <li 
            key={task.id_tarefa} 
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200
              ${task.concluida ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 hover:shadow-md hover:border-orange-200'}
            `}
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleTask(task)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${task.concluida ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-orange-500'}
                `}
              >
                <CheckCircle size={14} />
              </button>
              <span className={`text-sm ${task.concluida ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                {task.descricao}
              </span>
            </div>
            
            <button 
              onClick={() => removeTask(task.id_tarefa)}
              className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const NewAdminForm = () => {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", cpf: "", telefone: "", endereco: "", data_nascimento: "" });
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const dataIso = form.data_nascimento ? new Date(form.data_nascimento).toISOString() : null;
      
      await api.post("/administrador/cadastro", { ...form, data_nascimento: dataIso });
      setMsg({ text: "Administrador cadastrado com sucesso!", type: "success" });
      setForm({ nome: "", email: "", senha: "", cpf: "", telefone: "", endereco: "", data_nascimento: "" });
    } catch (error) {
      console.error(error);
      setMsg({ text: "Erro ao cadastrar administrador.", type: "error" });
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserPlus className="text-blue-600"/> Cadastrar Novo Administrador
      </h3>
      
      {msg && <Notification msg={msg.text} type={msg.type} />}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required placeholder="Nome Completo" className="p-3 border rounded-lg" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
        <input required placeholder="CPF" className="p-3 border rounded-lg" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
        <input required type="email" placeholder="Email Corporativo" className="p-3 border rounded-lg" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input required type="password" placeholder="Senha de Acesso" className="p-3 border rounded-lg" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
        <input placeholder="Telefone" className="p-3 border rounded-lg" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
        <input placeholder="Endereço" className="p-3 border rounded-lg" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 ml-1">Data de Nascimento</label>
          <input type="date" className="w-full p-3 border rounded-lg" value={form.data_nascimento} onChange={e => setForm({...form, data_nascimento: e.target.value})} />
        </div>
        
        <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
          Cadastrar Administrador
        </button>
      </form>
    </div>
  );
};

const AdminPanel = ({ user }: { user: UserData }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'tasks' | 'new-admin'>('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Gestão de Usuários', icon: Users },
    { id: 'tasks', label: 'Tarefas Pendentes', icon: ClipboardList },
    { id: 'new-admin', label: 'Novo Administrador', icon: UserPlus },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[600px]">
 
      <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit">
        <div className="mb-6 px-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Painel Admin</p>
          <h2 className="text-xl font-bold text-gray-800 truncate">{user.nome.split(' ')[0]}</h2>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        {activeTab === 'dashboard' && <AdminStats />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'new-admin' && <NewAdminForm />}
      </main>
    </div>
  );
};

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao ler usuário", e);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = !!user.id_adm;

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isAdmin ? "Painel Administrativo" : "Meu Perfil"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? "Gerencie a plataforma e visualize métricas." : "Mantenha seus dados atualizados para agilizar suas compras."}
          </p>
        </header>

        {isAdmin ? <AdminPanel user={user} /> : <ClientProfile user={user} />}
      </div>
    </div>
  );
}