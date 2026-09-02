import React, { useState } from "react";
import { Gym, GymBilling, Client } from "../../types";
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
} from "lucide-react";

interface SuperAdminViewProps {
  gyms: Gym[];
  onAddGym: (gym: Omit<Gym, "id" | "createdAt">) => void;
  onUpdateGymStatus: (gymId: string, status: Gym["billingStatus"]) => void;
  gymBillings: GymBilling[];
  onMarkBillPaid: (billId: string) => void;
  onGenerateBill: (gymId: string, month: string, amount: number) => void;
  clients: Client[];
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  gyms,
  onAddGym,
  onUpdateGymStatus,
  gymBillings,
  onMarkBillPaid,
  onGenerateBill,
  clients,
}) => {
  const [activeTab, setActiveTab] = useState<"gyms" | "cobros" | "clients">("gyms");
  const [isAddGymOpen, setIsAddGymOpen] = useState(false);
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states for new gym
  const [newGymName, setNewGymName] = useState("");
  const [newGymCode, setNewGymCode] = useState("");
  const [newGymAddress, setNewGymAddress] = useState("");
  const [newGymPhone, setNewGymPhone] = useState("");
  const [newGymEmail, setNewGymEmail] = useState("");
  const [newGymFee, setNewGymFee] = useState(150);
  const [newGymPlan, setNewGymPlan] = useState<"Básico" | "Pro" | "Enterprise">("Pro");

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
    onAddGym({
      name: newGymName,
      code: newGymCode.toUpperCase(),
      address: newGymAddress || "S/D",
      phone: newGymPhone || "-",
      email: newGymEmail || "-",
      monthlyFee: Number(newGymFee) || 150,
      billingStatus: "al_dia",
      totalMembers: 0,
      plan: newGymPlan,
    });
    setNewGymName("");
    setNewGymCode("");
    setNewGymAddress("");
    setNewGymPhone("");
    setNewGymEmail("");
    setIsAddGymOpen(false);
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
          <div className="flex items-center gap-2">
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
                      <select
                        value={gym.billingStatus}
                        onChange={(e) => onUpdateGymStatus(gym.id, e.target.value as any)}
                        className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="al_dia">Marcar: Al Día</option>
                        <option value="pendiente">Marcar: Pendiente</option>
                        <option value="suspendido">Marcar: Suspendido</option>
                      </select>
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
                      {bill.status !== "pagado" && (
                        <button
                          onClick={() => onMarkBillPaid(bill.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] px-3 py-1 rounded transition-colors"
                        >
                          Registrar Pago
                        </button>
                      )}
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
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};
