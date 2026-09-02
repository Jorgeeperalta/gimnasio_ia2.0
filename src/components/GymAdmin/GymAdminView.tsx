import React, { useState } from "react";
import {
  Gym,
  Client,
  Routine,
  Exercise,
  Payment,
  ExtraItem,
  ClientExtraPurchase,
  GymTip,
  MuscleGroup,
} from "../../types";
import {
  Users,
  Dumbbell,
  CreditCard,
  Coffee,
  Lightbulb,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  Search,
  Filter,
  Trash2,
  Edit,
} from "lucide-react";

interface GymAdminViewProps {
  currentGym: Gym;
  clients: Client[];
  onAddClient: (client: Omit<Client, "id" | "joinDate">) => void;
  routines: Routine[];
  onAddRoutine: (routine: Omit<Routine, "id">) => void;
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, "id" | "date">) => void;
  extraItems: ExtraItem[];
  extraPurchases: ClientExtraPurchase[];
  onAddExtraPurchase: (purchase: Omit<ClientExtraPurchase, "id" | "date">) => void;
  onAddExtraItem: (item: Omit<ExtraItem, "id">) => void;
  tips: GymTip[];
  onAddTip: (tip: Omit<GymTip, "id" | "date">) => void;
}

export const GymAdminView: React.FC<GymAdminViewProps> = ({
  currentGym,
  clients,
  onAddClient,
  routines,
  onAddRoutine,
  payments,
  onAddPayment,
  extraItems,
  extraPurchases,
  onAddExtraPurchase,
  onAddExtraItem,
  tips,
  onAddTip,
}) => {
  const [activeTab, setActiveTab] = useState<"clientes" | "rutinas" | "pagos" | "extras" | "tips">("clientes");

  // Filter gym specific data
  const gymClients = clients.filter((c) => c.gymId === currentGym.id);
  const gymRoutines = routines.filter((r) => r.gymId === currentGym.id);
  const gymPayments = payments.filter((p) => p.gymId === currentGym.id);
  const gymExtraPurchases = extraPurchases.filter((p) => p.gymId === currentGym.id);
  const gymTips = tips.filter((t) => t.gymId === currentGym.id);

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExtraSaleModalOpen, setIsExtraSaleModalOpen] = useState(false);
  const [isNewExtraItemModalOpen, setIsNewExtraItemModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  // Form states: New Client
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPlan, setClientPlan] = useState("Plan Mensual Ilimitado");
  const [clientFee, setClientFee] = useState(45);
  const [clientInitialDebt, setClientInitialDebt] = useState(45);

  // Form states: New Routine
  const [routineName, setRoutineName] = useState("");
  const [routineMuscleGroup, setRoutineMuscleGroup] = useState<MuscleGroup>("Pecho");
  const [routineDay, setRoutineDay] = useState<Routine["day"]>("Lunes");
  const [routineMinutes, setRoutineMinutes] = useState(50);
  const [routineLevel, setRoutineLevel] = useState<Routine["level"]>("Intermedio");
  const [routineNotes, setRoutineNotes] = useState("");
  const [routineExercises, setRoutineExercises] = useState<Array<{ name: string; sets: number; reps: string; rest: string }>>([
    { name: "Press de Banca con Barra", sets: 4, reps: "8-10", rest: "90 seg" },
  ]);

  // Form states: New Payment
  const [payClientId, setPayClientId] = useState(gymClients[0]?.id || "");
  const [payAmount, setPayAmount] = useState(45);
  const [payConcept, setPayConcept] = useState("Cuota Mensual");
  const [payMethod, setPayMethod] = useState<Payment["paymentMethod"]>("Efectivo");

  // Form states: Extra Sale
  const [saleClientId, setSaleClientId] = useState(gymClients[0]?.id || "");
  const [saleItemId, setSaleItemId] = useState(extraItems[0]?.id || "");
  const [saleQty, setSaleQty] = useState(1);
  const [saleIsPaid, setSaleIsPaid] = useState(false); // false = genera deuda en el cliente

  // Form states: New Extra Item
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<ExtraItem["category"]>("Suplemento");
  const [itemPrice, setItemPrice] = useState(5);
  const [itemStock, setItemStock] = useState(50);

  // Form states: New Tip
  const [tipTitle, setTipTitle] = useState("");
  const [tipCategory, setTipCategory] = useState<GymTip["category"]>("Nutrición");
  const [tipContent, setTipContent] = useState("");
  const [tipAuthor, setTipAuthor] = useState("Coach Principal");

  // Calculation summaries
  const totalGymClients = gymClients.length;
  const clientsWithDebt = gymClients.filter((c) => c.debtAmount > 0);
  const totalOutstandingDebt = gymClients.reduce((acc, c) => acc + c.debtAmount, 0);
  const totalCollectedMonth = gymPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;
    onAddClient({
      gymId: currentGym.id,
      gymName: currentGym.name,
      name: clientName,
      email: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      phone: clientPhone || "+54 11 0000-0000",
      membershipPlan: clientPlan,
      monthlyFee: Number(clientFee),
      debtAmount: Number(clientInitialDebt),
      status: "activo",
    });
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setIsClientModalOpen(false);
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName) return;
    const mappedExercises: Exercise[] = routineExercises.map((ex, idx) => ({
      id: `ex-${Date.now()}-${idx}`,
      name: ex.name,
      muscleGroup: routineMuscleGroup,
      sets: Number(ex.sets),
      reps: ex.reps,
      rest: ex.rest,
    }));

    onAddRoutine({
      gymId: currentGym.id,
      name: routineName,
      muscleGroup: routineMuscleGroup,
      day: routineDay,
      estimatedMinutes: Number(routineMinutes),
      level: routineLevel,
      notes: routineNotes,
      exercises: mappedExercises,
    });
    setRoutineName("");
    setRoutineNotes("");
    setIsRoutineModalOpen(false);
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const c = gymClients.find((cl) => cl.id === payClientId);
    if (!c) return;
    onAddPayment({
      gymId: currentGym.id,
      clientId: c.id,
      clientName: c.name,
      amount: Number(payAmount),
      concept: payConcept,
      paymentMethod: payMethod,
      status: "completado",
    });
    setIsPaymentModalOpen(false);
  };

  const handleCreateExtraSale = (e: React.FormEvent) => {
    e.preventDefault();
    const c = gymClients.find((cl) => cl.id === saleClientId);
    const item = extraItems.find((it) => it.id === saleItemId);
    if (!c || !item) return;
    const total = item.price * Number(saleQty);
    onAddExtraPurchase({
      gymId: currentGym.id,
      clientId: c.id,
      clientName: c.name,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      quantity: Number(saleQty),
      total,
      isPaid: saleIsPaid,
    });
    setIsExtraSaleModalOpen(false);
  };

  const handleCreateExtraItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    onAddExtraItem({
      gymId: currentGym.id,
      name: itemName,
      category: itemCategory,
      price: Number(itemPrice),
      stock: Number(itemStock),
    });
    setItemName("");
    setIsNewExtraItemModalOpen(false);
  };

  const handleCreateTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipTitle || !tipContent) return;
    onAddTip({
      gymId: currentGym.id,
      title: tipTitle,
      category: tipCategory,
      content: tipContent,
      author: tipAuthor || "Staff Gimnasio",
    });
    setTipTitle("");
    setTipContent("");
    setIsTipModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Gym Name & Quick Stats */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                Sede: {currentGym.code}
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">Plan {currentGym.plan}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Panel de Administración: {currentGym.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión completa de clientes, asignación de rutinas, control de pagos y deuda, cafetería/extras y tips.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-new-payment-btn"
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-emerald-500/10"
            >
              <DollarSign className="w-4 h-4" /> Cobrar Cuota
            </button>
            <button
              id="admin-new-client-btn"
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> Nuevo Cliente
            </button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Socios Registrados</p>
              <p className="text-xl font-bold text-white font-mono mt-0.5">{totalGymClients}</p>
              <p className="text-[11px] text-slate-400">{gymClients.filter(c => c.status === "activo").length} activos</p>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rutinas Disponibles</p>
              <p className="text-xl font-bold text-white font-mono mt-0.5">{gymRoutines.length}</p>
              <p className="text-[11px] text-slate-400">Lunes a Sábado</p>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-4/5 rounded-full"></div>
            </div>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cobrado este Mes</p>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">${totalCollectedMonth} USD</p>
              <p className="text-[11px] text-slate-400">{gymPayments.length} recibos emitidos</p>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deuda Total Clientes</p>
              <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">${totalOutstandingDebt} USD</p>
              <p className="text-[11px] text-slate-400">{clientsWithDebt.length} clientes con saldo</p>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-1/3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Geometric Balance Tab Navigation */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="border-b border-slate-800 flex flex-wrap px-4 bg-slate-950/60">
          <button
            id="tab-clientes"
            onClick={() => setActiveTab("clientes")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "clientes"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            1. Clientes ({gymClients.length})
          </button>

          <button
            id="tab-rutinas"
            onClick={() => setActiveTab("rutinas")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "rutinas"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            2. Rutinas & Musculación ({gymRoutines.length})
          </button>

          <button
            id="tab-pagos"
            onClick={() => setActiveTab("pagos")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "pagos"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            3. Pagos & Caja ({gymPayments.length})
          </button>

          <button
            id="tab-extras"
            onClick={() => setActiveTab("extras")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "extras"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coffee className="w-4 h-4" />
            4. Extras & Cafetería ({extraItems.length})
          </button>

          <button
            id="tab-tips"
            onClick={() => setActiveTab("tips")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "tips"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            5. Tips & Consejos ({gymTips.length})
          </button>
        </div>

        {/* TAB CONTENT: 1. CLIENTES */}
        {activeTab === "clientes" && (
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold text-white">
                Padrón de Clientes de {currentGym.name}
              </h2>
              <button
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" /> Inscribir Cliente
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Membresía</th>
                    <th className="py-3 px-4">Cuota Mensual</th>
                    <th className="py-3 px-4">Estado de Deuda</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gymClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{client.name}</div>
                        <div className="text-[11px] text-slate-400">{client.email} • {client.phone}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Ingresó: {client.joinDate}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {client.membershipPlan}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ${client.monthlyFee} USD/mes
                      </td>
                      <td className="py-3.5 px-4">
                        {client.debtAmount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/30 font-mono text-[10px]">
                            Debe: ${client.debtAmount} USD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 font-mono text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Al Día
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          {client.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setPayClientId(client.id);
                            setPayAmount(client.debtAmount > 0 ? client.debtAmount : client.monthlyFee);
                            setIsPaymentModalOpen(true);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] px-3 py-1 rounded-lg transition-colors shadow-sm"
                        >
                          Cobrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 2. RUTINAS & MUSCULACIÓN */}
        {activeTab === "rutinas" && (
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Catálogo de Rutinas por Día y Grupo Muscular
                </h2>
                <p className="text-xs text-slate-400">
                  Estas rutinas alimentan las respuestas del Chatbot DeepSeek y el plan semanal de los atletas.
                </p>
              </div>
              <button
                onClick={() => setIsRoutineModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" /> Crear Nueva Rutina
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gymRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                      {routine.day}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {routine.muscleGroup}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{routine.name}</h3>
                  <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> {routine.estimatedMinutes} min • Nivel: {routine.level}
                  </p>

                  <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-lg border border-slate-800 mb-3 text-xs">
                    <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                      Ejercicios ({routine.exercises.length}):
                    </p>
                    {routine.exercises.slice(0, 4).map((ex, i) => (
                      <div key={ex.id || i} className="flex justify-between items-center text-slate-300 text-[11px]">
                        <span className="font-medium truncate max-w-[170px]">• {ex.name}</span>
                        <span className="font-mono text-emerald-400 text-[10px] font-semibold">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                    {routine.exercises.length > 4 && (
                      <p className="text-[10px] text-emerald-400 font-semibold pt-1 font-mono">
                        + {routine.exercises.length - 4} ejercicios más
                      </p>
                    )}
                  </div>

                  {routine.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                      💡 {routine.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 3. PAGOS */}
        {activeTab === "pagos" && (
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Libro Diario de Pagos & Cobranza
                </h2>
                <p className="text-xs text-slate-400">
                  Historial de cobros por cuotas mensuales, inscripciones o cancelaciones de deuda.
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto shadow-sm"
              >
                <DollarSign className="w-4 h-4" /> Registrar Pago
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gymPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {pay.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {pay.clientName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {pay.concept}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-750">
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-400 text-sm">
                        +${pay.amount} USD
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Completado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 4. EXTRAS & CAFETERÍA */}
        {activeTab === "extras" && (
          <div className="p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Tienda, Suplementación & Servicios Extras
                </h2>
                <p className="text-xs text-slate-400">
                  Venta de batidos de proteína, isotónicas, accesorios y sesiones de personal trainer.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsNewExtraItemModalOpen(true)}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Agregar Producto
                </button>
                <button
                  onClick={() => setIsExtraSaleModalOpen(true)}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Coffee className="w-3.5 h-3.5" /> Registrar Consumo a Cliente
                </button>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {extraItems.map((item) => (
                <div key={item.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-white text-xs mt-1.5">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">Stock: {item.stock} unidades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold font-mono text-emerald-400">${item.price} USD</p>
                    <button
                      onClick={() => {
                        setSaleItemId(item.id);
                        setIsExtraSaleModalOpen(true);
                      }}
                      className="mt-1 text-[10px] font-bold text-emerald-400 hover:underline"
                    >
                      Vender a Cliente →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Purchases by clients */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Últimos Consumos Registrados a Clientes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Cliente</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3">Cant.</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Estado de Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {gymExtraPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-slate-850/30">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{purchase.date}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{purchase.clientName}</td>
                        <td className="py-2.5 px-3 text-slate-300">{purchase.itemName}</td>
                        <td className="py-2.5 px-3 font-mono">{purchase.quantity}</td>
                        <td className="py-2.5 px-3 font-bold font-mono text-emerald-400">${purchase.total} USD</td>
                        <td className="py-2.5 px-3">
                          {purchase.isPaid ? (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30 font-mono">
                              Pagado al instante
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[10px] border border-amber-500/30 font-mono">
                              Cargado a Deuda
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 5. TIPS */}
        {activeTab === "tips" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Tips & Consejos de Entrenamiento del Gimnasio
                </h2>
                <p className="text-xs text-slate-400">
                  Publica consejos que los clientes pueden leer y que el Asistente DeepSeek utiliza en sus consultas.
                </p>
              </div>
              <button
                onClick={() => setIsTipModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" /> Publicar Tip
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gymTips.map((tip) => (
                <div key={tip.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                      {tip.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{tip.date}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{tip.content}</p>
                  <p className="text-[10px] font-semibold text-slate-400">Por: {tip.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD CLIENT */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Users className="w-5 h-5 text-emerald-400" /> Inscribir Nuevo Cliente
              </h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleCreateClient} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Santoro"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="laura@gmail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+54 11 ..."
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Plan de Membresía</label>
                <select
                  value={clientPlan}
                  onChange={(e) => setClientPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                >
                  <option value="Plan Mensual Ilimitado">Plan Mensual Ilimitado ($45)</option>
                  <option value="Plan Trimestral VIP">Plan Trimestral VIP ($120)</option>
                  <option value="Plan Básico Estudiante">Plan Básico Estudiante ($30)</option>
                  <option value="Pase Libre 10 Clases">Pase Libre 10 Clases ($40)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cuota Mensual ($)</label>
                  <input
                    type="number"
                    value={clientFee}
                    onChange={(e) => setClientFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Deuda Inicial ($)</label>
                  <input
                    type="number"
                    value={clientInitialDebt}
                    onChange={(e) => setClientInitialDebt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-rose-400 focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Atleta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROUTINE */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Dumbbell className="w-5 h-5 text-emerald-400" /> Diseñar Nueva Rutina
              </h3>
              <button onClick={() => setIsRoutineModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleCreateRoutine} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre de la Rutina</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Espalda Densidad & Tracción Pesada"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Grupo Muscular</label>
                  <select
                    value={routineMuscleGroup}
                    onChange={(e) => setRoutineMuscleGroup(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Pecho">Pecho</option>
                    <option value="Espalda">Espalda</option>
                    <option value="Piernas">Piernas</option>
                    <option value="Hombros">Hombros</option>
                    <option value="Bíceps">Bíceps</option>
                    <option value="Tríceps">Tríceps</option>
                    <option value="Abdomen / Core">Abdomen / Core</option>
                    <option value="Cardio & Full Body">Cardio & Full Body</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Día Correspondiente</label>
                  <select
                    value={routineDay}
                    onChange={(e) => setRoutineDay(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duración (min)</label>
                  <input
                    type="number"
                    value={routineMinutes}
                    onChange={(e) => setRoutineMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nivel</label>
                  <select
                    value={routineLevel}
                    onChange={(e) => setRoutineLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Ejercicios de la Rutina</label>
                <div className="space-y-2">
                  {routineExercises.map((ex, i) => (
                    <div key={i} className="flex gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <input
                        type="text"
                        placeholder="Nombre ejercicio"
                        value={ex.name}
                        onChange={(e) => {
                          const copy = [...routineExercises];
                          copy[i].name = e.target.value;
                          setRoutineExercises(copy);
                        }}
                        className="flex-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                      />
                      <input
                        type="number"
                        placeholder="Series"
                        value={ex.sets}
                        onChange={(e) => {
                          const copy = [...routineExercises];
                          copy[i].sets = Number(e.target.value);
                          setRoutineExercises(copy);
                        }}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => {
                          const copy = [...routineExercises];
                          copy[i].reps = e.target.value;
                          setRoutineExercises(copy);
                        }}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRoutineExercises([...routineExercises, { name: "Nuevo Ejercicio", sets: 3, reps: "10-12", rest: "60 seg" }])}
                    className="text-xs text-emerald-400 font-bold hover:underline"
                  >
                    + Añadir otro ejercicio
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tips de Técnica / Notas</label>
                <textarea
                  rows={2}
                  value={routineNotes}
                  onChange={(e) => setRoutineNotes(e.target.value)}
                  placeholder="Instrucciones para el atleta..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsRoutineModalOpen(false)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Publicar Rutina</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER PAYMENT */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Registrar Cobro a Cliente
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleCreatePayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Seleccionar Cliente</label>
                <select
                  value={payClientId}
                  onChange={(e) => {
                    setPayClientId(e.target.value);
                    const c = gymClients.find((cl) => cl.id === e.target.value);
                    if (c) setPayAmount(c.debtAmount > 0 ? c.debtAmount : c.monthlyFee);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-semibold text-slate-200 focus:border-emerald-500"
                >
                  {gymClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Deuda: ${c.debtAmount} USD
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Monto Cobrado ($ USD)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-emerald-400 text-sm focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Este monto se descontará automáticamente de la deuda del cliente.</p>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Concepto</label>
                <input
                  type="text"
                  required
                  value={payConcept}
                  onChange={(e) => setPayConcept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Método de Pago</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Confirmar Cobro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SALE EXTRA */}
      {isExtraSaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Coffee className="w-5 h-5 text-emerald-400" /> Registrar Venta de Extra
              </h3>
              <button onClick={() => setIsExtraSaleModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleCreateExtraSale} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Cliente</label>
                <select
                  value={saleClientId}
                  onChange={(e) => setSaleClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                >
                  {gymClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Producto / Servicio Extra</label>
                <select
                  value={saleItemId}
                  onChange={(e) => setSaleItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-semibold text-slate-200 focus:border-emerald-500"
                >
                  {extraItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (${it.price} USD)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={saleQty}
                  onChange={(e) => setSaleQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-white focus:border-emerald-500"
                />
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={saleIsPaid}
                    onChange={(e) => setSaleIsPaid(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>¿Pagó en el momento?</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  Si no está marcado, se sumará automáticamente al **Control de Deuda** del cliente.
                </p>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsExtraSaleModalOpen(false)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Registrar Consumo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW EXTRA ITEM */}
      {isNewExtraItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Plus className="w-5 h-5 text-emerald-400" /> Nuevo Producto para Tienda / Barra
              </h3>
              <button onClick={() => setIsNewExtraItemModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleCreateExtraItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Creatina Micronizada 300g"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoría</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Suplemento">Suplemento</option>
                    <option value="Bebida">Bebida</option>
                    <option value="Snack">Snack</option>
                    <option value="Accesorio">Accesorio</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Precio ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Stock Inicial</label>
                <input
                  type="number"
                  value={itemStock}
                  onChange={(e) => setItemStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewExtraItemModalOpen(false)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW TIP */}
      {isTipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Lightbulb className="w-5 h-5 text-emerald-400" /> Publicar Tip de Entrenamiento
              </h3>
              <button onClick={() => setIsTipModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleCreateTip} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Título del Consejo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calentamiento de Manguito Rotador"
                  value={tipTitle}
                  onChange={(e) => setTipTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoría</label>
                  <select
                    value={tipCategory}
                    onChange={(e) => setTipCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Nutrición">Nutrición</option>
                    <option value="Técnica">Técnica</option>
                    <option value="Motivación">Motivación</option>
                    <option value="Descanso">Descanso</option>
                    <option value="Seguridad">Seguridad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Autor / Entrenador</label>
                  <input
                    type="text"
                    value={tipAuthor}
                    onChange={(e) => setTipAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Contenido del Tip</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribe la recomendación para los alumnos..."
                  value={tipContent}
                  onChange={(e) => setTipContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                ></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsTipModalOpen(false)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Publicar para Clientes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
