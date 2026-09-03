import React, { useState } from "react";
import { Gym, GymBilling, Client, UserAccount, UserRole } from "../../types";
import {
  Building2,
  Users,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  ChevronRight,
  TrendingUp,
  Edit,
  Trash2,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  UserCheck,
} from "lucide-react";

interface SuperAdminViewProps {
  gyms: Gym[];
  onAddGym: (
    gym: Omit<Gym, "id" | "createdAt">,
    adminCredentials?: { name: string; username: string; password: string; email: string }
  ) => void;
  onEditGym: (gym: Gym) => void;
  onDeleteGym: (gymId: string) => void;
  onUpdateGymStatus: (gymId: string, status: Gym["billingStatus"]) => void;
  gymBillings: GymBilling[];
  onMarkBillPaid: (billId: string) => void;
  onGenerateBill: (gymId: string, month: string, amount: number) => void;
  onEditGymBilling: (bill: GymBilling) => void;
  onDeleteGymBilling: (billId: string) => void;
  clients: Client[];
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onEditUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  gyms,
  onAddGym,
  onEditGym,
  onDeleteGym,
  onUpdateGymStatus,
  gymBillings,
  onMarkBillPaid,
  onGenerateBill,
  onEditGymBilling,
  onDeleteGymBilling,
  clients,
  onEditClient,
  onDeleteClient,
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<"gyms" | "cobros" | "clients" | "users">("gyms");
  const [isAddGymOpen, setIsAddGymOpen] = useState(false);
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit states
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [editingBill, setEditingBill] = useState<GymBilling | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showEditUserPassword, setShowEditUserPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [userId: string]: boolean }>({});
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userGymFilter, setUserGymFilter] = useState<string>("all");

  const [itemToDelete, setItemToDelete] = useState<{
    type: "gym" | "bill" | "client" | "user";
    id: string;
    name: string;
  } | null>(null);

  // Form states for new gym (with admin account)
  const [newGymName, setNewGymName] = useState("");
  const [newGymCode, setNewGymCode] = useState("");
  const [newGymAddress, setNewGymAddress] = useState("");
  const [newGymPhone, setNewGymPhone] = useState("");
  const [newGymEmail, setNewGymEmail] = useState("");
  const [newGymFee, setNewGymFee] = useState(150);
  const [newGymPlan, setNewGymPlan] = useState<"Básico" | "Pro" | "Enterprise">("Pro");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("Gym123");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Form states for new user
  const [userFormName, setUserFormName] = useState("");
  const [userFormUsername, setUserFormUsername] = useState("");
  const [userFormPassword, setUserFormPassword] = useState("Afm123");
  const [userFormEmail, setUserFormEmail] = useState("");
  const [userFormRole, setUserFormRole] = useState<UserRole>("gym_admin");
  const [userFormGymId, setUserFormGymId] = useState(gyms[0]?.id || "");
  const [showUserFormPassword, setShowUserFormPassword] = useState(false);

  // Form states for new bill
  const [selectedGymForBill, setSelectedGymForBill] = useState(gyms[0]?.id || "");
  const [billMonth, setBillMonth] = useState("Octubre 2026");
  const [billAmount, setBillAmount] = useState(150);

  const totalGyms = gyms.length;
  const totalGlobalClients = clients.length;
  const totalMonthlySaaSRevenue = gyms.reduce((acc, g) => acc + g.monthlyFee, 0);
  const pendingBillsCount = gymBillings.filter((b) => b.status === "pendiente").length;

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGymName || !newGymCode) return;
    onAddGym(
      {
        name: newGymName,
        code: newGymCode.toUpperCase(),
        address: newGymAddress || "S/D",
        phone: newGymPhone || "-",
        email: newGymEmail || "-",
        monthlyFee: Number(newGymFee) || 150,
        billingStatus: "al_dia",
        totalMembers: 0,
        plan: newGymPlan,
      },
      newAdminUsername
        ? {
            name: newAdminName || `Admin ${newGymName}`,
            username: newAdminUsername.trim().toLowerCase(),
            password: newAdminPassword || "Gym123",
            email: newAdminEmail || newGymEmail || "-",
          }
        : undefined
    );
    setNewGymName("");
    setNewGymCode("");
    setNewGymAddress("");
    setNewGymPhone("");
    setNewGymEmail("");
    setNewAdminName("");
    setNewAdminUsername("");
    setNewAdminPassword("Gym123");
    setNewAdminEmail("");
    setIsAddGymOpen(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormUsername || !userFormPassword || !userFormName) return;
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: userFormName,
      username: userFormUsername.trim().toLowerCase(),
      password: userFormPassword,
      email: userFormEmail || `${userFormUsername.toLowerCase()}@gymcore.saas`,
      role: userFormRole,
      gymId: userFormRole !== "super_admin" ? userFormGymId : undefined,
    };
    onAddUser(newUser);
    setUserFormName("");
    setUserFormUsername("");
    setUserFormPassword("Afm123");
    setUserFormEmail("");
    setIsAddUserOpen(false);
  };

  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onEditUser(editingUser);
    setEditingUser(null);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGymForBill) return;
    onGenerateBill(selectedGymForBill, billMonth, Number(billAmount));
    setIsNewBillOpen(false);
  };

  const filteredGyms = gyms.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gymName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const gym = gyms.find((g) => g.id === u.gymId);
    const gymName = gym?.name?.toLowerCase() || "";
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      gymName.includes(query);
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchesGym = userGymFilter === "all" || u.gymId === userGymFilter;
    return matchesSearch && matchesRole && matchesGym;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                <Building2 className="w-5 h-5" />
              </span>
              Super Administrador de la Plataforma
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Control multi-inquilino de gimnasios afiliados, cobros por gimnasio y clientes globales.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="superadmin-new-user-btn"
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              Crear Usuario
            </button>
            <button
              id="superadmin-new-gym-btn"
              onClick={() => setIsAddGymOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              Nuevo Gimnasio
            </button>
            <button
              id="superadmin-new-bill-btn"
              onClick={() => setIsNewBillOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Generar Cobro Gym
            </button>
          </div>
        </div>

        {/* 4 Metric Cards with Geometric Balance Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gimnasios Activos</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono">{totalGyms}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-1">100% en la nube</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-3.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Clientes Totales</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono">{totalGlobalClients}</p>
                <p className="text-xs text-slate-400 mt-1">Entre todos los gimnasios</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-3.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-4/5 rounded-full"></div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Ingresos Mensuales SaaS</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">${totalMonthlySaaSRevenue} USD</p>
                <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Cuotas de plataforma
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-3.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cobros Pendientes</p>
                <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">{pendingBillsCount}</p>
                <p className="text-xs text-slate-400 mt-1">Gimnasios por pagar cuota</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-3.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-1/3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Geometric Balance Tabs */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="border-b border-slate-800 flex px-4 bg-slate-950/60">
          <button
            id="superadmin-tab-gyms"
            onClick={() => setActiveTab("gyms")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "gyms"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Gimnasios ({gyms.length})
          </button>

          <button
            id="superadmin-tab-cobros"
            onClick={() => setActiveTab("cobros")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "cobros"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Cobros por Gimnasio ({gymBillings.length})
          </button>

          <button
            id="superadmin-tab-clients"
            onClick={() => setActiveTab("clients")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "clients"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Clientes Globales ({clients.length})
          </button>

          <button
            id="superadmin-tab-users"
            onClick={() => setActiveTab("users")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "users"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Usuarios & Accesos ({users.length})
          </button>
        </div>

        {/* Search bar inside tab */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline font-mono">
            Modo Super Administrador (Vista Multi-Gimnasio)
          </span>
        </div>

        {/* TAB 1: GIMNASIOS */}
        {activeTab === "gyms" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Gimnasio</th>
                  <th className="py-3 px-4">Plan SaaS</th>
                  <th className="py-3 px-4">Cuota Mensual</th>
                  <th className="py-3 px-4">Socios Activos</th>
                  <th className="py-3 px-4">Estado Cobro</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{gym.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Código: <span className="font-mono font-semibold text-emerald-400">{gym.code}</span> • {gym.address}
                      </div>
                      <div className="text-[11px] text-slate-500">{gym.email} • {gym.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-emerald-500/30 font-mono">
                        {gym.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${gym.monthlyFee} USD/mes
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-white">{gym.totalMembers}</span> atletas
                    </td>
                    <td className="py-3.5 px-4">
                      {gym.billingStatus === "al_dia" && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 text-[10px] font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Al Día
                        </span>
                      )}
                      {gym.billingStatus === "pendiente" && (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 text-[10px] font-mono">
                          <Clock className="w-3.5 h-3.5" /> Pago Pendiente
                        </span>
                      )}
                      {gym.billingStatus === "suspendido" && (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/30 text-[10px] font-mono">
                          <AlertTriangle className="w-3.5 h-3.5" /> Suspendido
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={gym.billingStatus}
                          onChange={(e) => onUpdateGymStatus(gym.id, e.target.value as any)}
                          className="text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="al_dia">Al Día</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="suspendido">Suspendido</option>
                        </select>
                        <button
                          onClick={() => setEditingGym(gym)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                          title="Editar Gimnasio"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: "gym", id: gym.id, name: gym.name })}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                          title="Eliminar Gimnasio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: COBROS POR GIMNASIO */}
        {activeTab === "cobros" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Factura</th>
                  <th className="py-3 px-4">Gimnasio</th>
                  <th className="py-3 px-4">Período</th>
                  <th className="py-3 px-4">Monto Cuota</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {gymBillings.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {bill.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {bill.gymName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {bill.month}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${bill.amount} USD
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {bill.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      {bill.status === "pagado" ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 text-[10px] font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pagado {bill.paidDate ? `(${bill.paidDate})` : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 text-[10px] font-mono">
                          <Clock className="w-3.5 h-3.5" /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {bill.status !== "pagado" && (
                          <button
                            onClick={() => onMarkBillPaid(bill.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded transition-colors cursor-pointer"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          onClick={() => setEditingBill(bill)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                          title="Editar Factura / Cobro"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: "bill", id: bill.id, name: `${bill.invoiceNumber} - ${bill.gymName}` })}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                          title="Eliminar Factura"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: CLIENTES GLOBALES */}
        {activeTab === "clients" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Gimnasio Afiliado</th>
                  <th className="py-3 px-4">Plan de Membresía</th>
                  <th className="py-3 px-4">Cuota</th>
                  <th className="py-3 px-4">Control de Deuda</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{client.name}</div>
                      <div className="text-[11px] text-slate-400">{client.email} • {client.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400 font-mono">
                      {client.gymName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {client.membershipPlan}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      ${client.monthlyFee} USD/mes
                    </td>
                    <td className="py-3.5 px-4">
                      {client.debtAmount > 0 ? (
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/30 font-mono text-[10px]">
                          Debe: ${client.debtAmount} USD
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 font-mono text-[10px]">
                          ✓ Al día
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          client.status === "activo"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {client.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingClient(client)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                          title="Editar Socio"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: "client", id: client.id, name: client.name })}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                          title="Eliminar Socio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: USUARIOS & ACCESOS */}
        {activeTab === "users" && (
          <div className="p-4 space-y-4">
            {/* Sub-filters & New User CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Filtrar por Rol:
                </span>
                <button
                  onClick={() => setUserRoleFilter("all")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    userRoleFilter === "all"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter("super_admin")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    userRoleFilter === "super_admin"
                      ? "bg-purple-500 text-white font-bold"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  Super Admin ({users.filter((u) => u.role === "super_admin").length})
                </button>
                <button
                  onClick={() => setUserRoleFilter("gym_admin")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    userRoleFilter === "gym_admin"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  Admin Gimnasio ({users.filter((u) => u.role === "gym_admin").length})
                </button>
                <button
                  onClick={() => setUserRoleFilter("client")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    userRoleFilter === "client"
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  Clientes / Atletas ({users.filter((u) => u.role === "client").length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userGymFilter}
                  onChange={(e) => setUserGymFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg focus:border-emerald-500"
                >
                  <option value="all">Todas las Sedes</option>
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo Usuario
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Usuario / Cuenta</th>
                    <th className="py-3 px-4">Rol en Sistema</th>
                    <th className="py-3 px-4">Sede Asignada</th>
                    <th className="py-3 px-4">Contraseña (Password)</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No se encontraron usuarios con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const userGym = gyms.find((g) => g.id === user.gymId);
                      const isRevealed = !!revealedPasswords[user.id];

                      return (
                        <tr key={user.id} className="hover:bg-slate-850/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase border ${
                                  user.role === "super_admin"
                                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                    : user.role === "gym_admin"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                }`}
                              >
                                {user.username.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                  {user.name}
                                </div>
                                <div className="text-[11px] text-emerald-400 font-mono">
                                  @{user.username}
                                </div>
                                <div className="text-[10px] text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {user.role === "super_admin" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
                                <Shield className="w-3 h-3 text-purple-400" /> SUPER ADMIN
                              </span>
                            )}
                            {user.role === "gym_admin" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                                <Building2 className="w-3 h-3 text-emerald-400" /> ADMIN GIMNASIO
                              </span>
                            )}
                            {user.role === "client" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                                <Users className="w-3 h-3 text-cyan-400" /> CLIENTE ATLETA
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {user.role === "super_admin" ? (
                              <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                                🌐 Toda la plataforma
                              </span>
                            ) : userGym ? (
                              <div>
                                <div className="font-semibold text-white">{userGym.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Cód: {userGym.code}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Sede no asignada</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                                  isRevealed
                                    ? "bg-slate-950 text-emerald-400 border-emerald-500/40"
                                    : "bg-slate-950 text-slate-400 border-slate-800 tracking-wider"
                                }`}
                              >
                                {isRevealed ? user.password : "••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedPasswords((prev) => ({
                                    ...prev,
                                    [user.id]: !prev[user.id],
                                  }))
                                }
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title={isRevealed ? "Ocultar contraseña" : "Ver contraseña"}
                              >
                                {isRevealed ? (
                                  <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowEditUserPassword(false);
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                                title="Editar Usuario y Contraseña"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setItemToDelete({
                                    type: "user",
                                    id: user.id,
                                    name: `${user.name} (@${user.username})`,
                                  })
                                }
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                                title="Eliminar Usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD GYM */}
      {isAddGymOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Building2 className="w-5 h-5 text-emerald-400" /> Nuevo Gimnasio (Tenant)
              </h3>
              <button
                onClick={() => setIsAddGymOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateGym} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre del Gimnasio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Olympia Fitness Club"
                  value={newGymName}
                  onChange={(e) => setNewGymName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Código Único</label>
                  <input
                    type="text"
                    required
                    placeholder="OLYM-04"
                    value={newGymCode}
                    onChange={(e) => setNewGymCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg uppercase font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Plan SaaS</label>
                  <select
                    value={newGymPlan}
                    onChange={(e) => setNewGymPlan(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Básico">Básico ($99)</option>
                    <option value="Pro">Pro ($150)</option>
                    <option value="Enterprise">Enterprise ($220)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Dirección</label>
                <input
                  type="text"
                  placeholder="Av. Central 500"
                  value={newGymAddress}
                  onChange={(e) => setNewGymAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+54 11 1234-5678"
                    value={newGymPhone}
                    onChange={(e) => setNewGymPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cobro Plataforma ($/mes)</label>
                  <input
                    type="number"
                    value={newGymFee}
                    onChange={(e) => setNewGymFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Email de Contacto</label>
                <input
                  type="email"
                  placeholder="admin@olympia.com"
                  value={newGymEmail}
                  onChange={(e) => setNewGymEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              {/* Sección: Cuenta de Usuario y Contraseña para el Administrador del Gimnasio */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 font-mono uppercase">
                    <KeyRound className="w-3.5 h-3.5" /> Cuenta Admin del Gimnasio
                  </span>
                  <span className="text-[10px] text-slate-400">Acceso al sistema</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nombre Administrador</label>
                    <input
                      type="text"
                      placeholder="Ej: Marcelo Gómez"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Usuario (Login)</label>
                    <input
                      type="text"
                      placeholder={newGymCode ? `admin_${newGymCode.toLowerCase()}` : "admin_gym"}
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-mono focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-emerald-500 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-white"
                      >
                        {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Email del Admin</label>
                    <input
                      type="email"
                      placeholder="admin@sede.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Esta cuenta se creará automáticamente con rol <strong className="text-slate-300">Admin Gimnasio</strong> asociada a esta sede.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGymOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm transition-colors"
                >
                  Guardar Gimnasio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE BILL */}
      {isNewBillOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <FileText className="w-5 h-5 text-emerald-400" /> Generar Factura / Cobro Gym
              </h3>
              <button
                onClick={() => setIsNewBillOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBill} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Gimnasio</label>
                <select
                  value={selectedGymForBill}
                  onChange={(e) => {
                    setSelectedGymForBill(e.target.value);
                    const found = gyms.find((g) => g.id === e.target.value);
                    if (found) setBillAmount(found.monthlyFee);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-semibold focus:border-emerald-500"
                >
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Cuota: ${g.monthlyFee} USD)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Período / Mes de Cobro</label>
                <input
                  type="text"
                  required
                  value={billMonth}
                  onChange={(e) => setBillMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Monto a Cobrar ($ USD)</label>
                <input
                  type="number"
                  required
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-bold font-mono text-emerald-400 focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBillOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm transition-colors"
                >
                  Emitir Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GYM */}
      {editingGym && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Gimnasio ({editingGym.code})
              </h3>
              <button
                onClick={() => setEditingGym(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditGym(editingGym);
                setEditingGym(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre del Gimnasio</label>
                <input
                  type="text"
                  required
                  value={editingGym.name}
                  onChange={(e) => setEditingGym({ ...editingGym, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Código Único</label>
                  <input
                    type="text"
                    required
                    value={editingGym.code}
                    onChange={(e) => setEditingGym({ ...editingGym, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg uppercase font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Plan SaaS</label>
                  <select
                    value={editingGym.plan}
                    onChange={(e) => setEditingGym({ ...editingGym, plan: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cuota SaaS ($ USD)</label>
                  <input
                    type="number"
                    value={editingGym.monthlyFee}
                    onChange={(e) => setEditingGym({ ...editingGym, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estado de Cobro</label>
                  <select
                    value={editingGym.billingStatus}
                    onChange={(e) => setEditingGym({ ...editingGym, billingStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="al_dia">Al Día</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Dirección</label>
                <input
                  type="text"
                  value={editingGym.address}
                  onChange={(e) => setEditingGym({ ...editingGym, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editingGym.phone}
                    onChange={(e) => setEditingGym({ ...editingGym, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={editingGym.email}
                    onChange={(e) => setEditingGym({ ...editingGym, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGym(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BILLING */}
      {editingBill && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Factura ({editingBill.invoiceNumber})
              </h3>
              <button
                onClick={() => setEditingBill(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditGymBilling(editingBill);
                setEditingBill(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Gimnasio</label>
                <input
                  type="text"
                  disabled
                  value={editingBill.gymName}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Período / Mes</label>
                  <input
                    type="text"
                    required
                    value={editingBill.month}
                    onChange={(e) => setEditingBill({ ...editingBill, month: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Monto ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={editingBill.amount}
                    onChange={(e) => setEditingBill({ ...editingBill, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha Vencimiento</label>
                  <input
                    type="text"
                    value={editingBill.dueDate}
                    onChange={(e) => setEditingBill({ ...editingBill, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estado de Pago</label>
                  <select
                    value={editingBill.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as "pagado" | "pendiente";
                      setEditingBill({
                        ...editingBill,
                        status: newStatus,
                        paidDate: newStatus === "pagado" ? (editingBill.paidDate || new Date().toISOString().split("T")[0]) : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                  </select>
                </div>
              </div>
              {editingBill.status === "pagado" && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha de Pago Efectuado</label>
                  <input
                    type="text"
                    value={editingBill.paidDate || ""}
                    onChange={(e) => setEditingBill({ ...editingBill, paidDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              )}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GLOBAL CLIENT */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Socio ({editingClient.name})
              </h3>
              <button
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditClient(editingClient);
                setEditingClient(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Plan de Membresía</label>
                  <input
                    type="text"
                    value={editingClient.membershipPlan}
                    onChange={(e) => setEditingClient({ ...editingClient, membershipPlan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cuota ($ USD/mes)</label>
                  <input
                    type="number"
                    value={editingClient.monthlyFee}
                    onChange={(e) => setEditingClient({ ...editingClient, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Saldo Deuda ($ USD)</label>
                  <input
                    type="number"
                    value={editingClient.debtAmount}
                    onChange={(e) => setEditingClient({ ...editingClient, debtAmount: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-rose-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estado</label>
                  <select
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <KeyRound className="w-5 h-5 text-emerald-400" /> Crear Nuevo Usuario y Acceso
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rol en Sistema</label>
                  <select
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 font-semibold"
                  >
                    <option value="gym_admin">Admin Gimnasio</option>
                    <option value="client">Cliente Atleta</option>
                    <option value="super_admin">Super Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sede Asignada</label>
                  <select
                    disabled={userFormRole === "super_admin"}
                    value={userFormGymId}
                    onChange={(e) => setUserFormGymId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 disabled:opacity-50"
                  >
                    {userFormRole === "super_admin" ? (
                      <option value="">(Plataforma Global)</option>
                    ) : (
                      gyms.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo de la Persona</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Rossi"
                  value={userFormName}
                  onChange={(e) => {
                    setUserFormName(e.target.value);
                    if (!userFormUsername) {
                      const auto = e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, "");
                      setUserFormUsername(auto);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Usuario (Login / Username)</label>
                  <input
                    type="text"
                    required
                    placeholder="usuario123"
                    value={userFormUsername}
                    onChange={(e) => setUserFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="usuario@correo.com"
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">Contraseña (Password)</label>
                  <button
                    type="button"
                    onClick={() => setUserFormPassword(generateRandomPassword())}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Generar Clave Segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showUserFormPassword ? "text" : "password"}
                    required
                    value={userFormPassword}
                    onChange={(e) => setUserFormPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserFormPassword(!showUserFormPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showUserFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  El usuario podrá iniciar sesión inmediatamente con este usuario y contraseña.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" /> Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Usuario y Contraseña
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateUserSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Usuario (Username)</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value.toLowerCase().replace(/\s+/g, ""),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">Contraseña (Password)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingUser({ ...editingUser, password: generateRandomPassword() })
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerar Clave
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditUserPassword ? "text" : "password"}
                    required
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditUserPassword(!showEditUserPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showEditUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rol</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as UserRole,
                        gymId: e.target.value === "super_admin" ? undefined : editingUser.gymId,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 font-semibold"
                  >
                    <option value="gym_admin">Admin Gimnasio</option>
                    <option value="client">Cliente Atleta</option>
                    <option value="super_admin">Super Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sede Asignada</label>
                  <select
                    disabled={editingUser.role === "super_admin"}
                    value={editingUser.gymId || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, gymId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="">(Sin asignar / Global)</option>
                    {gyms.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-rose-500/40 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Confirmar Eliminación
              </h3>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-300">
                ¿Estás seguro de que deseas eliminar permanentemente:
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-semibold text-rose-300">
                {itemToDelete.name}
              </div>
              <p className="text-slate-500 text-[11px]">
                {itemToDelete.type === "gym" && "Nota: Eliminar esta sede también removerá sus registros asociados."}
                {itemToDelete.type === "bill" && "Nota: Esta factura se eliminará de la base contable."}
                {itemToDelete.type === "client" && "Nota: Se eliminará al socio y sus historiales."}
                {itemToDelete.type === "user" && "Nota: Esta cuenta de usuario perderá inmediatamente el acceso al sistema."}
              </p>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="px-3.5 py-1.5 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (itemToDelete.type === "gym") onDeleteGym(itemToDelete.id);
                    if (itemToDelete.type === "bill") onDeleteGymBilling(itemToDelete.id);
                    if (itemToDelete.type === "client") onDeleteClient(itemToDelete.id);
                    if (itemToDelete.type === "user") onDeleteUser(itemToDelete.id);
                    setItemToDelete(null);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-sm transition-colors"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
