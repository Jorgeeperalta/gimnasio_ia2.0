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
  UserAccount,
  UserRole,
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
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  RefreshCw,
  UserPlus,
  UserCheck,
  Check,
  Star,
  ClipboardList,
} from "lucide-react";

interface GymAdminViewProps {
  currentGym: Gym;
  clients: Client[];
  onAddClient: (
    client: Omit<Client, "id" | "joinDate">,
    credentials?: { username: string; password: string }
  ) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  routines: Routine[];
  onAddRoutine: (routine: Omit<Routine, "id">) => void;
  onEditRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, "id" | "date">) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => void;
  extraItems: ExtraItem[];
  onAddExtraItem: (item: Omit<ExtraItem, "id">) => void;
  onEditExtraItem: (item: ExtraItem) => void;
  onDeleteExtraItem: (itemId: string) => void;
  extraPurchases: ClientExtraPurchase[];
  onAddExtraPurchase: (purchase: Omit<ClientExtraPurchase, "id" | "date">) => void;
  onEditExtraPurchase: (purchase: ClientExtraPurchase) => void;
  onDeleteExtraPurchase: (purchaseId: string) => void;
  tips: GymTip[];
  onAddTip: (tip: Omit<GymTip, "id" | "date">) => void;
  onEditTip: (tip: GymTip) => void;
  onDeleteTip: (tipId: string) => void;
  users?: UserAccount[];
  onAddUser?: (user: Omit<UserAccount, "id">) => void;
  onEditUser?: (user: UserAccount) => void;
  onDeleteUser?: (userId: string) => void;
  onAssignRoutinesToClient?: (clientId: string, routineIds: string[]) => void;
  onAssignClientsToRoutine?: (routineId: string, clientIds: string[]) => void;
  onRemoveRoutineFromClient?: (clientId: string, routineId: string) => void;
  onUnassignAllRoutinesFromClient?: (clientId: string) => void;
}

export const GymAdminView: React.FC<GymAdminViewProps> = ({
  currentGym,
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient,
  routines,
  onAddRoutine,
  onEditRoutine,
  onDeleteRoutine,
  payments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  extraItems,
  onAddExtraItem,
  onEditExtraItem,
  onDeleteExtraItem,
  extraPurchases,
  onAddExtraPurchase,
  onEditExtraPurchase,
  onDeleteExtraPurchase,
  tips,
  onAddTip,
  onEditTip,
  onDeleteTip,
  users = [],
  onAddUser,
  onEditUser,
  onDeleteUser,
  onAssignRoutinesToClient,
  onAssignClientsToRoutine,
  onRemoveRoutineFromClient,
  onUnassignAllRoutinesFromClient,
}) => {
  const [activeTab, setActiveTab] = useState<"clientes" | "rutinas" | "pagos" | "extras" | "tips" | "usuarios">("clientes");

  // Filter gym specific data
  const gymClients = clients.filter((c) => c.gymId === currentGym.id);
  const gymRoutines = routines.filter((r) => r.gymId === currentGym.id);
  const gymPayments = payments.filter((p) => p.gymId === currentGym.id);
  const gymExtraPurchases = extraPurchases.filter((p) => p.gymId === currentGym.id);
  const gymTips = tips.filter((t) => t.gymId === currentGym.id);
  const gymUsers = users.filter((u) => u.gymId === currentGym.id);

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExtraSaleModalOpen, setIsExtraSaleModalOpen] = useState(false);
  const [isNewExtraItemModalOpen, setIsNewExtraItemModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Routine Assignment States
  const [assigningClient, setAssigningClient] = useState<Client | null>(null);
  const [selectedRoutineIdsForClient, setSelectedRoutineIdsForClient] = useState<string[]>([]);
  const [assigningRoutine, setAssigningRoutine] = useState<Routine | null>(null);
  const [routineAssignScope, setRoutineAssignScope] = useState<"all" | "specific">("all");
  const [selectedClientIdsForRoutine, setSelectedClientIdsForRoutine] = useState<string[]>([]);
  const [assignAthleteSearch, setAssignAthleteSearch] = useState("");
  const [newRoutineScope, setNewRoutineScope] = useState<"all" | "specific">("all");
  const [newRoutineClientIds, setNewRoutineClientIds] = useState<string[]>([]);
  const [clientInitialRoutineIds, setClientInitialRoutineIds] = useState<string[]>([]);
  const [isQuickAssignModalOpen, setIsQuickAssignModalOpen] = useState(false);
  const [quickAssignClientId, setQuickAssignClientId] = useState<string>("");
  const [quickAssignRoutineIds, setQuickAssignRoutineIds] = useState<string[]>([]);

  // Edit states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingExtraItem, setEditingExtraItem] = useState<ExtraItem | null>(null);
  const [editingExtraPurchase, setEditingExtraPurchase] = useState<ClientExtraPurchase | null>(null);
  const [editingTip, setEditingTip] = useState<GymTip | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Helper functions for routine assignments
  const getClientAssignedRoutines = (client: Client) => {
    const ids = client.assignedRoutineIds || (client.assignedRoutineId ? [client.assignedRoutineId] : []);
    return gymRoutines.filter(
      (r) => ids.includes(r.id) || (r.assignedClientIds && r.assignedClientIds.includes(client.id))
    );
  };

  const getRoutineAssignedClients = (routine: Routine) => {
    if (!routine.assignedClientIds || routine.assignedClientIds.length === 0) return [];
    return gymClients.filter((c) => routine.assignedClientIds?.includes(c.id));
  };

  const openClientAssignmentModal = (client: Client) => {
    setAssigningClient(client);
    const assigned = getClientAssignedRoutines(client);
    setSelectedRoutineIdsForClient(assigned.map((r) => r.id));
  };

  const handleSaveClientRoutines = () => {
    if (!assigningClient) return;
    if (onAssignRoutinesToClient) {
      onAssignRoutinesToClient(assigningClient.id, selectedRoutineIdsForClient);
    } else {
      onEditClient({
        ...assigningClient,
        assignedRoutineId: selectedRoutineIdsForClient[0] || undefined,
        assignedRoutineIds: selectedRoutineIdsForClient,
      });
    }
    setAssigningClient(null);
  };

  const openRoutineAssignmentModal = (routine: Routine) => {
    setAssigningRoutine(routine);
    const assigned = routine.assignedClientIds || [];
    setRoutineAssignScope(assigned.length > 0 ? "specific" : "all");
    setSelectedClientIdsForRoutine(assigned);
    setAssignAthleteSearch("");
  };

  const handleSaveRoutineClients = () => {
    if (!assigningRoutine) return;
    const clientIdsToAssign = routineAssignScope === "specific" ? selectedClientIdsForRoutine : [];
    if (onAssignClientsToRoutine) {
      onAssignClientsToRoutine(assigningRoutine.id, clientIdsToAssign);
    } else {
      onEditRoutine({
        ...assigningRoutine,
        assignedClientIds: clientIdsToAssign,
      });
    }
    setAssigningRoutine(null);
  };

  const openQuickAssignModal = () => {
    const firstClient = gymClients[0];
    if (firstClient) {
      setQuickAssignClientId(firstClient.id);
      const assigned = getClientAssignedRoutines(firstClient);
      setQuickAssignRoutineIds(assigned.map((r) => r.id));
    }
    setIsQuickAssignModalOpen(true);
  };

  const handleSaveQuickAssign = () => {
    if (!quickAssignClientId) return;
    if (onAssignRoutinesToClient) {
      onAssignRoutinesToClient(quickAssignClientId, quickAssignRoutineIds);
    } else {
      const c = gymClients.find((cl) => cl.id === quickAssignClientId);
      if (c) {
        onEditClient({
          ...c,
          assignedRoutineId: quickAssignRoutineIds[0] || undefined,
          assignedRoutineIds: quickAssignRoutineIds,
        });
      }
    }
    setIsQuickAssignModalOpen(false);
  };

  const handleRemoveRoutineAssignment = (clientId: string, routineId: string) => {
    if (onRemoveRoutineFromClient) {
      onRemoveRoutineFromClient(clientId, routineId);
    } else if (onAssignRoutinesToClient) {
      const client = gymClients.find((c) => c.id === clientId);
      if (client) {
        const currentRots = client.assignedRoutineIds || (client.assignedRoutineId ? [client.assignedRoutineId] : []);
        onAssignRoutinesToClient(clientId, currentRots.filter((id) => id !== routineId));
      }
    } else {
      const client = gymClients.find((c) => c.id === clientId);
      if (client) {
        const currentRots = client.assignedRoutineIds || (client.assignedRoutineId ? [client.assignedRoutineId] : []);
        const updated = currentRots.filter((id) => id !== routineId);
        onEditClient({
          ...client,
          assignedRoutineId: updated[0] || undefined,
          assignedRoutineIds: updated,
        });
      }
    }

    if (assigningClient && assigningClient.id === clientId) {
      setSelectedRoutineIdsForClient((prev) => prev.filter((id) => id !== routineId));
    }
    if (assigningRoutine && assigningRoutine.id === routineId) {
      setSelectedClientIdsForRoutine((prev) => prev.filter((id) => id !== clientId));
    }
    if (editingClient && editingClient.id === clientId) {
      const currentRots = editingClient.assignedRoutineIds || (editingClient.assignedRoutineId ? [editingClient.assignedRoutineId] : []);
      const updated = currentRots.filter((id) => id !== routineId);
      setEditingClient({
        ...editingClient,
        assignedRoutineId: updated[0] || undefined,
        assignedRoutineIds: updated,
      });
    }
    if (editingRoutine && editingRoutine.id === routineId) {
      const currentClients = editingRoutine.assignedClientIds || [];
      const updated = currentClients.filter((id) => id !== clientId);
      setEditingRoutine({
        ...editingRoutine,
        assignedClientIds: updated,
      });
    }
  };

  const handleUnassignAllRoutinesFromAthlete = (clientId: string) => {
    if (onUnassignAllRoutinesFromClient) {
      onUnassignAllRoutinesFromClient(clientId);
    } else if (onAssignRoutinesToClient) {
      onAssignRoutinesToClient(clientId, []);
    } else {
      const client = gymClients.find((c) => c.id === clientId);
      if (client) {
        onEditClient({
          ...client,
          assignedRoutineId: undefined,
          assignedRoutineIds: [],
        });
      }
    }

    if (assigningClient && assigningClient.id === clientId) {
      setSelectedRoutineIdsForClient([]);
    }
    if (editingClient && editingClient.id === clientId) {
      setEditingClient({
        ...editingClient,
        assignedRoutineId: undefined,
        assignedRoutineIds: [],
      });
    }
  };

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "client" | "routine" | "payment" | "extraItem" | "extraPurchase" | "tip" | "user" | "unassign_routine" | "unassign_all_routines";
    id: string;
    name: string;
    clientId?: string;
    clientName?: string;
    routineId?: string;
    routineName?: string;
  } | null>(null);

  // Form states: New Client
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPlan, setClientPlan] = useState("Plan Mensual Ilimitado");
  const [clientFee, setClientFee] = useState(45);
  const [clientInitialDebt, setClientInitialDebt] = useState(45);
  const [clientCreateUserAccount, setClientCreateUserAccount] = useState(true);
  const [clientUsername, setClientUsername] = useState("");
  const [clientPassword, setClientPassword] = useState("123456");
  const [showClientPassword, setShowClientPassword] = useState(false);

  // Form states: New User (Staff / Admin / Client)
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("123456");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("client");
  const [userClientId, setUserClientId] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showEditingUserPassword, setShowEditingUserPassword] = useState(false);
  const [userFilterRole, setUserFilterRole] = useState<"all" | UserRole>("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const filteredGymUsers = gymUsers.filter((u) => {
    const matchesRole = userFilterRole === "all" || u.role === userFilterRole;
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 9; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

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
    const creds =
      clientCreateUserAccount && clientUsername.trim()
        ? {
            username: clientUsername.toLowerCase().trim(),
            password: clientPassword || "123456",
          }
        : undefined;

    onAddClient(
      {
        gymId: currentGym.id,
        gymName: currentGym.name,
        name: clientName,
        email: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        phone: clientPhone || "+54 11 0000-0000",
        membershipPlan: clientPlan,
        monthlyFee: Number(clientFee),
        debtAmount: Number(clientInitialDebt),
        assignedRoutineId: clientInitialRoutineIds[0] || undefined,
        assignedRoutineIds: clientInitialRoutineIds,
        status: "activo",
      },
      creds
    );
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setClientUsername("");
    setClientPassword("123456");
    setClientInitialRoutineIds([]);
    setIsClientModalOpen(false);
  };

  const handleCreateGymUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userUsername || !userPassword) return;
    if (onAddUser) {
      onAddUser({
        name: userName,
        username: userUsername.toLowerCase().trim().replace(/\s+/g, ""),
        password: userPassword,
        email: userEmail || `${userUsername.toLowerCase()}@${currentGym.code.toLowerCase()}.com`,
        role: userRole,
        gymId: currentGym.id,
        clientId: userClientId || undefined,
      });
    }
    setUserName("");
    setUserUsername("");
    setUserPassword("123456");
    setUserEmail("");
    setUserRole("client");
    setUserClientId("");
    setIsAddUserModalOpen(false);
  };

  const handleUpdateGymUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !onEditUser) return;
    onEditUser(editingUser);
    setEditingUser(null);
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
      assignedClientIds: newRoutineScope === "specific" ? newRoutineClientIds : [],
    });
    setRoutineName("");
    setRoutineNotes("");
    setNewRoutineScope("all");
    setNewRoutineClientIds([]);
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="admin-new-user-btn"
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
              title="Crear cuenta de usuario y contraseña para administradores o clientes"
            >
              <KeyRound className="w-4 h-4" /> Crear Usuario
            </button>
            <button
              id="admin-new-payment-btn"
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" /> Cobrar Cuota
            </button>
            <button
              id="admin-new-client-btn"
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
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

          <button
            id="tab-usuarios"
            onClick={() => setActiveTab("usuarios")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "usuarios"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            6. Usuarios & Accesos ({gymUsers.length})
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
                    <th className="py-3 px-4">Rutina Asignada</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gymClients.map((client) => {
                    const clientAssignedRoutines = getClientAssignedRoutines(client);
                    return (
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
                          {clientAssignedRoutines.length > 0 ? (
                            <div className="space-y-1.5 min-w-[190px]">
                              <div className="flex items-center justify-between gap-1">
                                <div className="inline-flex items-center gap-1 text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                                  <Dumbbell className="w-3 h-3 text-emerald-400" />
                                  <span>{clientAssignedRoutines.length} {clientAssignedRoutines.length === 1 ? "rutina" : "rutinas"}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openClientAssignmentModal(client)}
                                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                                >
                                  Gestionar
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {clientAssignedRoutines.map((r) => (
                                  <span
                                    key={r.id}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-750 text-[10px] text-slate-200 group hover:border-rose-500/40 transition-colors"
                                    title={`${r.day}: ${r.name} (${r.muscleGroup})`}
                                  >
                                    <span className="text-emerald-400 font-mono font-bold text-[9px]">{r.day.slice(0, 3)}</span>
                                    <span className="truncate max-w-[85px]">{r.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteConfirm({
                                          type: "unassign_routine",
                                          id: `${client.id}___${r.id}`,
                                          name: `Rutina "${r.name}" (${r.day}) asignada a ${client.name}`,
                                          clientId: client.id,
                                          clientName: client.name,
                                          routineId: r.id,
                                          routineName: r.name,
                                        });
                                      }}
                                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                                      title={`Eliminar rutina "${r.name}" asignada a ${client.name}`}
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </span>
                                ))}
                              </div>

                              {clientAssignedRoutines.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirm({
                                      type: "unassign_all_routines",
                                      id: client.id,
                                      name: `Todas las rutinas (${clientAssignedRoutines.length}) asignadas a ${client.name}`,
                                      clientId: client.id,
                                      clientName: client.name,
                                    });
                                  }}
                                  className="text-[9px] text-rose-400/80 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> Quitar todas las asignadas
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 inline-block">
                                General Sede
                              </span>
                              <button
                                type="button"
                                onClick={() => openClientAssignmentModal(client)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" /> Asignar rutina
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                            {client.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPayClientId(client.id);
                                setPayAmount(client.debtAmount > 0 ? client.debtAmount : client.monthlyFee);
                                setIsPaymentModalOpen(true);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                              Cobrar
                            </button>
                            <button
                              onClick={() => openClientAssignmentModal(client)}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 transition-colors cursor-pointer"
                              title="Asignar Rutinas al Atleta"
                            >
                              <Dumbbell className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingClient(client)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                              title="Editar Cliente"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: "client", id: client.id, name: client.name })}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                              title="Eliminar Cliente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  Crea rutinas y asígnalas directamente a clientes/atletas específicos o a toda la sede.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={openQuickAssignModal}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Asignar a Cliente
                </button>
                <button
                  onClick={() => setIsRoutineModalOpen(true)}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Crear Nueva Rutina
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gymRoutines.map((routine) => {
                const assignedClients = getRoutineAssignedClients(routine);
                return (
                  <div
                    key={routine.id}
                    className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                          {routine.day}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {routine.muscleGroup}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm mb-1">{routine.name}</h3>
                      <p className="text-[11px] text-slate-400 mb-2.5 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" /> {routine.estimatedMinutes} min • Nivel: {routine.level}
                      </p>

                      {/* Assignment Status Pill */}
                      {assignedClients.length > 0 ? (
                        <div className="mb-3 space-y-1.5">
                          <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                              <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                              Asignada a {assignedClients.length} {assignedClients.length === 1 ? "atleta" : "atletas"}
                            </span>
                            <button
                              type="button"
                              onClick={() => openRoutineAssignmentModal(routine)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                            >
                              Gestionar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {assignedClients.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-750 text-[10px] text-slate-200 group hover:border-rose-500/40 transition-colors"
                              >
                                <span className="truncate max-w-[90px]">{c.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirm({
                                      type: "unassign_routine",
                                      id: `${c.id}___${routine.id}`,
                                      name: `Rutina "${routine.name}" asignada a ${c.name}`,
                                      clientId: c.id,
                                      clientName: c.name,
                                      routineId: routine.id,
                                      routineName: routine.name,
                                    });
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                                  title={`Eliminar rutina "${routine.name}" de ${c.name}`}
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">
                            🌐 General (Toda la sede)
                          </span>
                          <span className="text-[10px] text-slate-500">Todos los atletas</span>
                        </div>
                      )}

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
                        <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800 mb-2">
                          💡 {routine.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-800/80 mt-2">
                      <button
                        onClick={() => openRoutineAssignmentModal(routine)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded border border-emerald-500/30 transition-colors cursor-pointer"
                        title="Asignar esta rutina a atletas específicos"
                      >
                        <Users className="w-3 h-3 text-emerald-400" /> Asignar
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingRoutine(routine)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-750 px-2 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3 h-3" /> Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: "routine", id: routine.id, name: routine.name })}
                          className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    <th className="py-3 px-4 text-right">Acción</th>
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingPayment(pay)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                            title="Editar Pago"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: "payment", id: pay.id, name: `${pay.concept} - ${pay.clientName} ($${pay.amount} USD)` })}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                            title="Eliminar Pago"
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
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Agregar Producto
                </button>
                <button
                  onClick={() => setIsExtraSaleModalOpen(true)}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
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
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-base font-bold font-mono text-emerald-400">${item.price} USD</p>
                    <button
                      onClick={() => {
                        setSaleItemId(item.id);
                        setIsExtraSaleModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                    >
                      Vender a Cliente →
                    </button>
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => setEditingExtraItem(item)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                        title="Editar Producto"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: "extraItem", id: item.id, name: item.name })}
                        className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                        title="Eliminar Producto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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
                      <th className="py-2.5 px-3 text-right">Acción</th>
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
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingExtraPurchase(purchase)}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                              title="Editar Consumo"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: "extraPurchase", id: purchase.id, name: `${purchase.itemName} (${purchase.clientName})` })}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                              title="Eliminar Consumo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
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
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg self-start sm:self-auto shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Publicar Tip
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gymTips.map((tip) => (
                <div key={tip.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                        {tip.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{tip.date}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{tip.title}</h4>
                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">{tip.content}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2">
                    <p className="text-[10px] font-semibold text-slate-400">Por: {tip.author}</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingTip(tip)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
                        title="Editar Tip"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: "tip", id: tip.id, name: tip.title })}
                        className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors cursor-pointer"
                        title="Eliminar Tip"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 6. USUARIOS & ACCESOS */}
        {activeTab === "usuarios" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" /> Cuentas & Contraseñas de {currentGym.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Crea y gestiona las credenciales de inicio de sesión para administradores de sede y atletas clientes.
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Nuevo Usuario
              </button>
            </div>

            {/* Filter and search bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, username o email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={userFilterRole}
                  onChange={(e) => setUserFilterRole(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="all">Todos los Roles ({gymUsers.length})</option>
                  <option value="admin">Admins Gimnasio ({gymUsers.filter((u) => u.role === "admin").length})</option>
                  <option value="client">Clientes Atletas ({gymUsers.filter((u) => u.role === "client").length})</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol de Sistema</th>
                    <th className="py-3 px-4">Contraseña</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGymUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No se encontraron usuarios para esta sede con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredGymUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs border border-slate-700">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white">{user.name}</p>
                              <p className="text-[11px] font-mono text-emerald-400">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <Shield className="w-3 h-3" /> Admin Gimnasio
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              <Users className="w-3 h-3" /> Cliente Atleta
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="text-slate-300">
                              {revealedPasswords[user.id] ? user.password : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedPasswords((prev) => ({
                                  ...prev,
                                  [user.id]: !prev[user.id],
                                }))
                              }
                              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                              title={revealedPasswords[user.id] ? "Ocultar contraseña" : "Ver contraseña"}
                            >
                              {revealedPasswords[user.id] ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setShowEditingUserPassword(false);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                              title="Editar usuario y contraseña"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "user",
                                  id: user.id,
                                  name: `${user.name} (@${user.username})`,
                                })
                              }
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
            <form onSubmit={handleCreateClient} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Santoro"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (!clientUsername || clientUsername === clientName.toLowerCase().replace(/\s+/g, "_").slice(0, 15)) {
                      setClientUsername(e.target.value.toLowerCase().replace(/\s+/g, "_").slice(0, 15));
                    }
                  }}
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

              {/* Credenciales de Acceso para el Atleta */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clientCreateUserAccount}
                      onChange={(e) => {
                        setClientCreateUserAccount(e.target.checked);
                        if (e.target.checked && !clientUsername && clientName) {
                          setClientUsername(clientName.toLowerCase().replace(/\s+/g, "_").slice(0, 15));
                        }
                      }}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    Crear usuario y contraseña para la app
                  </label>
                </div>

                {clientCreateUserAccount && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nombre de Usuario (Login)
                      </label>
                      <input
                        type="text"
                        required={clientCreateUserAccount}
                        placeholder="ej: laura_santoro"
                        value={clientUsername}
                        onChange={(e) => setClientUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-300">Contraseña</label>
                        <button
                          type="button"
                          onClick={() => setClientPassword(generateRandomPassword())}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <RefreshCw className="w-3 h-3" /> Generar segura
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showClientPassword ? "text" : "password"}
                          required={clientCreateUserAccount}
                          value={clientPassword}
                          onChange={(e) => setClientPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs pr-9 focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowClientPassword(!showClientPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showClientPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ASIGNACIÓN DE RUTINAS AL CLIENTE */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Asignar Rutinas Semanales
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {clientInitialRoutineIds.length} seleccionada(s)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Selecciona qué rutinas de la sede estarán asignadas a este atleta:
                </p>
                {gymRoutines.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No hay rutinas creadas en la sede aún.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {gymRoutines.map((r) => {
                      const isChecked = clientInitialRoutineIds.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setClientInitialRoutineIds([...clientInitialRoutineIds, r.id]);
                                } else {
                                  setClientInitialRoutineIds(clientInitialRoutineIds.filter((id) => id !== r.id));
                                }
                              }}
                              className="rounded text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-[11px]">{r.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <span className="text-emerald-400">{r.day}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{r.muscleGroup}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm cursor-pointer">Guardar Atleta</button>
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

              {/* ASIGNACIÓN DE LA RUTINA A CLIENTES / ATLETAS */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Asignar Rutina a Atletas
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {newRoutineScope === "all" ? "Pública Sede" : `${newRoutineClientIds.length} Atleta(s)`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewRoutineScope("all")}
                    className={`py-1.5 px-2 rounded-lg border font-semibold text-center transition-colors cursor-pointer ${
                      newRoutineScope === "all"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🌐 Toda la Sede (General)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRoutineScope("specific")}
                    className={`py-1.5 px-2 rounded-lg border font-semibold text-center transition-colors cursor-pointer ${
                      newRoutineScope === "specific"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    👤 Atletas Específicos
                  </button>
                </div>

                {newRoutineScope === "specific" && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Selecciona los atletas para esta rutina:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewRoutineClientIds(gymClients.map((c) => c.id))}
                          className="text-emerald-400 hover:underline cursor-pointer font-bold"
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRoutineClientIds([])}
                          className="text-slate-400 hover:underline cursor-pointer"
                        >
                          Ninguno
                        </button>
                      </div>
                    </div>
                    {gymClients.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No hay clientes inscritos en la sede todavía.</p>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {gymClients.map((client) => {
                          const isChecked = newRoutineClientIds.includes(client.id);
                          return (
                            <label
                              key={client.id}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewRoutineClientIds([...newRoutineClientIds, client.id]);
                                    } else {
                                      setNewRoutineClientIds(newRoutineClientIds.filter((id) => id !== client.id));
                                    }
                                  }}
                                  className="rounded text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="font-semibold text-[11px]">{client.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{client.membershipPlan}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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

      {/* MODAL: EDIT CLIENT */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Cliente ({editingClient.name})
              </h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditClient(editingClient);
                if (onAssignRoutinesToClient) {
                  onAssignRoutinesToClient(editingClient.id, editingClient.assignedRoutineIds || []);
                }
                setEditingClient(null);
              }}
              className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto"
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
                  <label className="block text-slate-300 font-bold mb-1">Deuda Pendiente ($ USD)</label>
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

              {/* ASIGNACIÓN DE RUTINAS AL CLIENTE */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Rutinas Asignadas a este Atleta
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {(editingClient.assignedRoutineIds || (editingClient.assignedRoutineId ? [editingClient.assignedRoutineId] : [])).length} activa(s)
                    </span>
                    {(editingClient.assignedRoutineIds || (editingClient.assignedRoutineId ? [editingClient.assignedRoutineId] : [])).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingClient({
                            ...editingClient,
                            assignedRoutineId: undefined,
                            assignedRoutineIds: [],
                          });
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        title="Eliminar todas las asignaciones de este atleta"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Quitar todas
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Marca las rutinas que tendrá disponibles este atleta en su plan y en su DeepSeek Coach:
                </p>
                {gymRoutines.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No hay rutinas creadas en la sede aún.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {gymRoutines.map((r) => {
                      const currentAssigned = editingClient.assignedRoutineIds || (editingClient.assignedRoutineId ? [editingClient.assignedRoutineId] : []);
                      const isChecked = currentAssigned.includes(r.id);
                      return (
                        <div
                          key={r.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                            isChecked
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let next: string[];
                                if (e.target.checked) {
                                  next = [...currentAssigned, r.id];
                                } else {
                                  next = currentAssigned.filter((id) => id !== r.id);
                                }
                                setEditingClient({
                                  ...editingClient,
                                  assignedRoutineId: next[0] || undefined,
                                  assignedRoutineIds: next,
                                });
                              }}
                              className="rounded text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-[11px] truncate">{r.name}</span>
                          </label>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-[10px] font-mono">
                              <span className="text-emerald-400">{r.day}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">{r.muscleGroup}</span>
                            </div>
                            {isChecked && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = currentAssigned.filter((id) => id !== r.id);
                                  setEditingClient({
                                    ...editingClient,
                                    assignedRoutineId: next[0] || undefined,
                                    assignedRoutineIds: next,
                                  });
                                }}
                                className="text-slate-500 hover:text-rose-400 p-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title={`Eliminar rutina "${r.name}" de este cliente`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingClient(null)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ROUTINE */}
      {editingRoutine && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Rutina ({editingRoutine.name})
              </h3>
              <button onClick={() => setEditingRoutine(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditRoutine(editingRoutine);
                if (onAssignClientsToRoutine) {
                  onAssignClientsToRoutine(editingRoutine.id, editingRoutine.assignedClientIds || []);
                }
                setEditingRoutine(null);
              }}
              className="p-6 space-y-4 text-xs overflow-y-auto"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre de la Rutina</label>
                <input
                  type="text"
                  required
                  value={editingRoutine.name}
                  onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Día Asignado</label>
                  <select
                    value={editingRoutine.day}
                    onChange={(e) => setEditingRoutine({ ...editingRoutine, day: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Grupo Muscular</label>
                  <select
                    value={editingRoutine.muscleGroup}
                    onChange={(e) => setEditingRoutine({ ...editingRoutine, muscleGroup: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    {["Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Abdomen", "Cardio / Full Body"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duración Estimada (min)</label>
                  <input
                    type="number"
                    value={editingRoutine.estimatedMinutes}
                    onChange={(e) => setEditingRoutine({ ...editingRoutine, estimatedMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nivel</label>
                  <select
                    value={editingRoutine.level}
                    onChange={(e) => setEditingRoutine({ ...editingRoutine, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Notas / Instrucciones</label>
                <textarea
                  rows={2}
                  value={editingRoutine.notes || ""}
                  onChange={(e) => setEditingRoutine({ ...editingRoutine, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              {/* Exercises List in Routine */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-300 font-bold">Ejercicios ({editingRoutine.exercises.length})</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newEx = {
                        id: `ex-${Date.now()}`,
                        name: "Nuevo Ejercicio",
                        sets: 3,
                        reps: "10-12",
                        restSeconds: 60,
                      };
                      setEditingRoutine({
                        ...editingRoutine,
                        exercises: [...editingRoutine.exercises, newEx],
                      });
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    + Agregar Ejercicio
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingRoutine.exercises.map((ex, idx) => (
                    <div key={ex.id || idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...editingRoutine.exercises];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setEditingRoutine({ ...editingRoutine, exercises: updated });
                        }}
                        className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="number"
                        title="Series"
                        value={ex.sets}
                        onChange={(e) => {
                          const updated = [...editingRoutine.exercises];
                          updated[idx] = { ...updated[idx], sets: Number(e.target.value) };
                          setEditingRoutine({ ...editingRoutine, exercises: updated });
                        }}
                        className="w-12 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-400 font-mono text-center"
                      />
                      <span className="text-slate-500 font-mono">x</span>
                      <input
                        type="text"
                        title="Repeticiones"
                        value={ex.reps}
                        onChange={(e) => {
                          const updated = [...editingRoutine.exercises];
                          updated[idx] = { ...updated[idx], reps: e.target.value };
                          setEditingRoutine({ ...editingRoutine, exercises: updated });
                        }}
                        className="w-16 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-400 font-mono text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoutine({
                            ...editingRoutine,
                            exercises: editingRoutine.exercises.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASIGNACIÓN DE LA RUTINA A CLIENTES / ATLETAS */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Atletas Asignados a esta Rutina
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {(editingRoutine.assignedClientIds || []).length === 0
                      ? "Pública Sede (General)"
                      : `${(editingRoutine.assignedClientIds || []).length} Atleta(s)`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Selecciona qué atletas tienen acceso a esta rutina:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRoutine({ ...editingRoutine, assignedClientIds: gymClients.map((c) => c.id) })}
                      className="text-emerald-400 hover:underline cursor-pointer font-bold"
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRoutine({ ...editingRoutine, assignedClientIds: [] })}
                      className="text-slate-400 hover:underline cursor-pointer"
                    >
                      Ninguno (General)
                    </button>
                  </div>
                </div>
                {gymClients.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No hay clientes inscritos en la sede todavía.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {gymClients.map((client) => {
                      const isChecked = (editingRoutine.assignedClientIds || []).includes(client.id);
                      return (
                        <label
                          key={client.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const curr = editingRoutine.assignedClientIds || [];
                                const next = e.target.checked
                                  ? [...curr, client.id]
                                  : curr.filter((id) => id !== client.id);
                                setEditingRoutine({
                                  ...editingRoutine,
                                  assignedClientIds: next,
                                });
                              }}
                              className="rounded text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-[11px]">{client.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{client.membershipPlan}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingRoutine(null)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PAYMENT */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Pago / Recibo
              </h3>
              <button onClick={() => setEditingPayment(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditPayment(editingPayment);
                setEditingPayment(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Cliente</label>
                <input
                  type="text"
                  disabled
                  value={editingPayment.clientName}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha</label>
                  <input
                    type="text"
                    value={editingPayment.date}
                    onChange={(e) => setEditingPayment({ ...editingPayment, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Monto ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={editingPayment.amount}
                    onChange={(e) => setEditingPayment({ ...editingPayment, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Concepto</label>
                <input
                  type="text"
                  required
                  value={editingPayment.concept}
                  onChange={(e) => setEditingPayment({ ...editingPayment, concept: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Método de Pago</label>
                <select
                  value={editingPayment.paymentMethod}
                  onChange={(e) => setEditingPayment({ ...editingPayment, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="MercadoPago / QR">MercadoPago / QR</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingPayment(null)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXTRA ITEM */}
      {editingExtraItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Producto ({editingExtraItem.name})
              </h3>
              <button onClick={() => setEditingExtraItem(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditExtraItem(editingExtraItem);
                setEditingExtraItem(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingExtraItem.name}
                  onChange={(e) => setEditingExtraItem({ ...editingExtraItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoría</label>
                  <select
                    value={editingExtraItem.category}
                    onChange={(e) => setEditingExtraItem({ ...editingExtraItem, category: e.target.value as any })}
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
                    value={editingExtraItem.price}
                    onChange={(e) => setEditingExtraItem({ ...editingExtraItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Stock Disponible</label>
                <input
                  type="number"
                  value={editingExtraItem.stock}
                  onChange={(e) => setEditingExtraItem({ ...editingExtraItem, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingExtraItem(null)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXTRA PURCHASE */}
      {editingExtraPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Consumo Extra
              </h3>
              <button onClick={() => setEditingExtraPurchase(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditExtraPurchase(editingExtraPurchase);
                setEditingExtraPurchase(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Cliente</label>
                <input
                  type="text"
                  disabled
                  value={editingExtraPurchase.clientName}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Producto</label>
                <input
                  type="text"
                  value={editingExtraPurchase.itemName}
                  onChange={(e) => setEditingExtraPurchase({ ...editingExtraPurchase, itemName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={editingExtraPurchase.quantity}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      const unit = editingExtraPurchase.total / (editingExtraPurchase.quantity || 1);
                      setEditingExtraPurchase({ ...editingExtraPurchase, quantity: q, total: q * unit });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Total ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingExtraPurchase.total}
                    onChange={(e) => setEditingExtraPurchase({ ...editingExtraPurchase, total: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={editingExtraPurchase.isPaid}
                    onChange={(e) => setEditingExtraPurchase({ ...editingExtraPurchase, isPaid: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>¿Pagado al instante?</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  Si no está pagado, cuenta como saldo deudor en la ficha del cliente.
                </p>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingExtraPurchase(null)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TIP */}
      {editingTip && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Editar Tip de Entrenamiento
              </h3>
              <button onClick={() => setEditingTip(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditTip(editingTip);
                setEditingTip(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={editingTip.title}
                  onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoría</label>
                  <select
                    value={editingTip.category}
                    onChange={(e) => setEditingTip({ ...editingTip, category: e.target.value as any })}
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
                  <label className="block text-slate-300 font-bold mb-1">Autor</label>
                  <input
                    type="text"
                    value={editingTip.author}
                    onChange={(e) => setEditingTip({ ...editingTip, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Contenido del Tip</label>
                <textarea
                  rows={4}
                  required
                  value={editingTip.content}
                  onChange={(e) => setEditingTip({ ...editingTip, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                ></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingTip(null)} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <KeyRound className="w-5 h-5 text-emerald-400" /> Crear Usuario & Contraseña
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateGymUser} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Rol de Acceso</label>
                <select
                  value={userRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setUserRole(r);
                    if (r === "client" && gymClients.length > 0 && !userName) {
                      const firstCl = gymClients[0];
                      setUserClientId(firstCl.id);
                      setUserName(firstCl.name);
                      setUserEmail(firstCl.email);
                      setUserUsername(firstCl.name.toLowerCase().replace(/\s+/g, "_").slice(0, 15));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                >
                  <option value="client">Cliente Atleta (Acceso a Rutinas, Historial y Deuda)</option>
                  <option value="admin">Admin Gimnasio (Gestión Completa de la Sede)</option>
                </select>
              </div>

              {userRole === "client" && gymClients.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Vincular a Atleta Existente (Opcional)
                  </label>
                  <select
                    value={userClientId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      setUserClientId(cId);
                      const matched = gymClients.find((cl) => cl.id === cId);
                      if (matched) {
                        setUserName(matched.name);
                        setUserEmail(matched.email);
                        setUserUsername(matched.name.toLowerCase().replace(/\s+/g, "_").slice(0, 15));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  >
                    <option value="">-- Crear cuenta independiente o nuevo atleta --</option>
                    {gymClients.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name} ({cl.membershipPlan})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Santoro o Entrenador Carlos"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (!userUsername) {
                      setUserUsername(e.target.value.toLowerCase().replace(/\s+/g, "_").slice(0, 15));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Nombre de Usuario (Para Iniciar Sesión)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: laura_gym"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ej: laura@gmail.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Contraseña de Acceso</label>
                  <button
                    type="button"
                    onClick={() => setUserPassword(generateRandomPassword())}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" /> Generar segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showUserPassword ? "text" : "password"}
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono pr-9 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER & PASSWORD */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2 font-mono">
                <Edit className="w-5 h-5 text-emerald-400" /> Modificar Usuario & Contraseña
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateGymUser} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
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

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Nombre de Usuario (Login)
                </label>
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rol</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                >
                  <option value="client">Cliente Atleta</option>
                  <option value="admin">Admin Gimnasio</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Contraseña</label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingUser({
                        ...editingUser,
                        password: generateRandomPassword(),
                      })
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" /> Generar nueva
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditingUserPassword ? "text" : "password"}
                    required
                    value={editingUser.password}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, password: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono pr-9 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditingUserPassword(!showEditingUserPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showEditingUserPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN ROUTINES TO CLIENT */}
      {assigningClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                    Asignar Rutinas a Atleta
                  </h3>
                  <p className="text-xs text-slate-400">
                    {assigningClient.name} • <span className="text-emerald-400">{assigningClient.membershipPlan}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssigningClient(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-emerald-400 font-mono text-sm mr-1.5">
                    {selectedRoutineIdsForClient.length}
                  </span>
                  de {gymRoutines.length} rutinas de la sede asignadas
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRoutineIdsForClient(gymRoutines.map((r) => r.id))}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Seleccionar todas
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedRoutineIdsForClient([])}
                    className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Desasignar todas
                  </button>
                </div>
              </div>

              {selectedRoutineIdsForClient.length > 0 && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Rutinas asignadas actualmente:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRoutineIdsForClient([])}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                    >
                      Quitar todas
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {gymRoutines
                      .filter((r) => selectedRoutineIdsForClient.includes(r.id))
                      .map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-750 text-[10px] text-slate-200"
                        >
                          <span className="text-emerald-400 font-mono font-bold text-[9px]">{r.day.slice(0, 3)}</span>
                          <span className="font-semibold">{r.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoutineIdsForClient(
                                selectedRoutineIdsForClient.filter((id) => id !== r.id)
                              );
                            }}
                            className="text-slate-500 hover:text-rose-400 p-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title={`Eliminar asignación de ${r.name}`}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {gymRoutines.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-xs">No hay rutinas creadas en la sede aún.</p>
                  <p className="text-[11px] text-slate-600 mt-1">Crea primero una rutina en la pestaña "Rutinas & Musculación".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {gymRoutines.map((routine) => {
                    const isSelected = selectedRoutineIdsForClient.includes(routine.id);
                    return (
                      <div
                        key={routine.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedRoutineIdsForClient(
                              selectedRoutineIdsForClient.filter((id) => id !== routine.id)
                            );
                          } else {
                            setSelectedRoutineIdsForClient([...selectedRoutineIdsForClient, routine.id]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-emerald-950/25 border-emerald-500/50 shadow-sm"
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-xs text-white truncate">
                              {routine.name}
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                                  {routine.day}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                  {routine.muscleGroup}
                                </span>
                              </div>
                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRoutineIdsForClient(
                                      selectedRoutineIdsForClient.filter((id) => id !== routine.id)
                                    );
                                  }}
                                  className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold border border-rose-500/30 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Eliminar asignación de esta rutina"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> Quitar
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span>{routine.exercises.length} ejercicios</span>
                            {routine.exercises.length > 0 && (
                              <span className="text-slate-500 truncate">
                                ({routine.exercises.map((e) => e.name).slice(0, 3).join(", ")}
                                {routine.exercises.length > 3 ? "..." : ""})
                              </span>
                            )}
                          </div>
                          {routine.notes && (
                            <p className="text-[10px] text-slate-500 italic mt-1 truncate">
                              💡 {routine.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-slate-400">
                El atleta verá estas rutinas en su cuenta y en el Asistente DeepSeek.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningClient(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveClientRoutines}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Guardar Asignaciones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN ROUTINE TO CLIENTS */}
      {assigningRoutine && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                    Asignar Rutina a Atletas
                  </h3>
                  <p className="text-xs text-slate-400">
                    {assigningRoutine.name} • <span className="text-emerald-400">{assigningRoutine.day} ({assigningRoutine.muscleGroup})</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssigningRoutine(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Alcance de Visibilidad
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRoutineAssignScope("all")}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      routineAssignScope === "all"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 mb-0.5">
                      🌐 Toda la Sede (General)
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Cualquier atleta activo de la sede puede ver y realizar esta rutina.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoutineAssignScope("specific")}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      routineAssignScope === "specific"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 mb-0.5">
                      👤 Atletas Específicos
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Exclusiva para clientes/atletas que elijas manualmente en la lista.
                    </p>
                  </button>
                </div>
              </div>

              {routineAssignScope === "specific" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={assignAthleteSearch}
                        onChange={(e) => setAssignAthleteSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedClientIdsForRoutine(gymClients.map((c) => c.id))}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                      >
                        Todos ({gymClients.length})
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedClientIdsForRoutine([])}
                        className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
                      >
                        Ninguno
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      {selectedClientIdsForRoutine.length} atleta(s) seleccionado(s)
                    </span>
                    {selectedClientIdsForRoutine.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedClientIdsForRoutine([])}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                      >
                        Quitar todos
                      </button>
                    )}
                  </div>

                  {selectedClientIdsForRoutine.length > 0 && (
                    <div className="flex flex-wrap gap-1 p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      {gymClients
                        .filter((c) => selectedClientIdsForRoutine.includes(c.id))
                        .map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-750 text-[10px] text-slate-200"
                          >
                            <span className="truncate max-w-[90px]">{c.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClientIdsForRoutine(
                                  selectedClientIdsForRoutine.filter((id) => id !== c.id)
                                );
                              }}
                              className="text-slate-500 hover:text-rose-400 p-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title={`Desasignar ${c.name}`}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                    </div>
                  )}

                  {gymClients.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>No hay clientes registrados en esta sede.</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                      {gymClients
                        .filter(
                          (c) =>
                            c.name.toLowerCase().includes(assignAthleteSearch.toLowerCase()) ||
                            c.email.toLowerCase().includes(assignAthleteSearch.toLowerCase())
                        )
                        .map((client) => {
                          const isSelected = selectedClientIdsForRoutine.includes(client.id);
                          return (
                            <div
                              key={client.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedClientIdsForRoutine(
                                    selectedClientIdsForRoutine.filter((id) => id !== client.id)
                                  );
                                } else {
                                  setSelectedClientIdsForRoutine([...selectedClientIdsForRoutine, client.id]);
                                }
                              }}
                              className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? "bg-emerald-950/25 border-emerald-500/50"
                                  : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                                />
                                <div>
                                  <h4 className="font-bold text-xs text-white truncate">{client.name}</h4>
                                  <p className="text-[10px] text-slate-400 truncate">{client.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                  {client.membershipPlan}
                                </span>
                                {isSelected && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedClientIdsForRoutine(
                                        selectedClientIdsForRoutine.filter((id) => id !== client.id)
                                      );
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold border border-rose-500/30 text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Quitar asignación a este atleta"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" /> Quitar
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAssigningRoutine(null)}
                className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRoutineClients}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Guardar Asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ASSIGN ROUTINES */}
      {isQuickAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-800 text-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                    Asignación Rápida de Rutinas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona un atleta y gestiona su plan de rutinas semanal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickAssignModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Seleccionar Atleta
                </label>
                <select
                  value={quickAssignClientId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setQuickAssignClientId(cid);
                    const cl = gymClients.find((c) => c.id === cid);
                    if (cl) {
                      const assigned = getClientAssignedRoutines(cl);
                      setQuickAssignRoutineIds(assigned.map((r) => r.id));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-semibold focus:border-emerald-500"
                >
                  {gymClients.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} ({cl.membershipPlan}) - {cl.email}
                    </option>
                  ))}
                </select>
              </div>

              {quickAssignClientId && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-300">
                    <span className="font-bold text-emerald-400 font-mono text-sm mr-1.5">
                      {quickAssignRoutineIds.length}
                    </span>
                    rutinas seleccionadas para este atleta
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickAssignRoutineIds(gymRoutines.map((r) => r.id))}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Todas
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setQuickAssignRoutineIds([])}
                      className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
                    >
                      Ninguna
                    </button>
                  </div>
                </div>
              )}

              {gymRoutines.length === 0 ? (
                <p className="text-center py-6 text-slate-500">No hay rutinas creadas en la sede aún.</p>
              ) : (
                <div className="space-y-2">
                  {gymRoutines.map((routine) => {
                    const isChecked = quickAssignRoutineIds.includes(routine.id);
                    return (
                      <div
                        key={routine.id}
                        onClick={() => {
                          if (isChecked) {
                            setQuickAssignRoutineIds(quickAssignRoutineIds.filter((id) => id !== routine.id));
                          } else {
                            setQuickAssignRoutineIds([...quickAssignRoutineIds, routine.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? "bg-emerald-950/25 border-emerald-500/50 shadow-sm"
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-white truncate">{routine.name}</h4>
                            <p className="text-[10px] text-slate-400">
                              {routine.exercises.length} ejercicios • {routine.muscleGroup}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 text-[10px] font-mono shrink-0">
                          {routine.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickAssignModalOpen(false)}
                className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveQuickAssign}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Guardar Asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-rose-500/40 text-slate-200">
            <div className="p-5 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2 text-rose-400">
                {deleteConfirm.type === "unassign_routine" || deleteConfirm.type === "unassign_all_routines" ? (
                  <>
                    <Dumbbell className="w-5 h-5 text-rose-500" /> Confirmar Desasignación
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 text-rose-500" /> Confirmar Eliminación
                  </>
                )}
              </h3>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-300">
                {deleteConfirm.type === "unassign_routine"
                  ? "¿Deseas eliminar la asignación de esta rutina al cliente?"
                  : deleteConfirm.type === "unassign_all_routines"
                  ? "¿Deseas eliminar todas las rutinas asignadas a este cliente?"
                  : "¿Estás seguro de que deseas eliminar permanentemente:"}
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-semibold text-rose-300">
                {deleteConfirm.name}
              </div>
              <p className="text-slate-500 text-[11px]">
                {deleteConfirm.type === "unassign_routine" || deleteConfirm.type === "unassign_all_routines"
                  ? "El atleta ya no tendrá asignada esta rutina en su panel ni en las consultas de su entrenador inteligente."
                  : "Esta acción no se puede deshacer."}
              </p>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3.5 py-1.5 border border-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === "client") onDeleteClient(deleteConfirm.id);
                    if (deleteConfirm.type === "routine") onDeleteRoutine(deleteConfirm.id);
                    if (deleteConfirm.type === "payment") onDeletePayment(deleteConfirm.id);
                    if (deleteConfirm.type === "extraItem") onDeleteExtraItem(deleteConfirm.id);
                    if (deleteConfirm.type === "extraPurchase") onDeleteExtraPurchase(deleteConfirm.id);
                    if (deleteConfirm.type === "tip") onDeleteTip(deleteConfirm.id);
                    if (deleteConfirm.type === "user" && onDeleteUser) onDeleteUser(deleteConfirm.id);
                    if (deleteConfirm.type === "unassign_routine" && deleteConfirm.clientId && deleteConfirm.routineId) {
                      handleRemoveRoutineAssignment(deleteConfirm.clientId, deleteConfirm.routineId);
                    }
                    if (deleteConfirm.type === "unassign_all_routines" && deleteConfirm.clientId) {
                      handleUnassignAllRoutinesFromAthlete(deleteConfirm.clientId);
                    }
                    setDeleteConfirm(null);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {deleteConfirm.type === "unassign_routine"
                    ? "Sí, Desasignar Rutina"
                    : deleteConfirm.type === "unassign_all_routines"
                    ? "Sí, Desasignar Todas"
                    : "Sí, Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
