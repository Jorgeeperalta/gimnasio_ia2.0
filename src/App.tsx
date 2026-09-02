import React, { useState } from "react";
import {
  UserRole,
  Gym,
  GymBilling,
  Client,
  Routine,
  CompletedWorkout,
  Payment,
  ExtraItem,
  ClientExtraPurchase,
  GymTip,
} from "./types";
import {
  INITIAL_GYMS,
  INITIAL_GYM_BILLINGS,
  INITIAL_CLIENTS,
  INITIAL_ROUTINES,
  INITIAL_COMPLETED_WORKOUTS,
  INITIAL_PAYMENTS,
  INITIAL_EXTRA_ITEMS,
  INITIAL_EXTRA_PURCHASES,
  INITIAL_TIPS,
} from "./data/mockData";
import { HeaderBar } from "./components/HeaderBar";
import { SuperAdminView } from "./components/SuperAdmin/SuperAdminView";
import { GymAdminView } from "./components/GymAdmin/GymAdminView";
import { ClientView } from "./components/Client/ClientView";
import { ArchitectureModal } from "./components/ArchitectureModal";

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>("client");
  const [gyms, setGyms] = useState<Gym[]>(INITIAL_GYMS);
  const [selectedGymId, setSelectedGymId] = useState<string>("gym-1");
  const [gymBillings, setGymBillings] = useState<GymBilling[]>(INITIAL_GYM_BILLINGS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>("client-1");
  const [routines, setRoutines] = useState<Routine[]>(INITIAL_ROUTINES);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(
    INITIAL_COMPLETED_WORKOUTS
  );
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>(INITIAL_EXTRA_ITEMS);
  const [extraPurchases, setExtraPurchases] = useState<ClientExtraPurchase[]>(
    INITIAL_EXTRA_PURCHASES
  );
  const [tips, setTips] = useState<GymTip[]>(INITIAL_TIPS);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Active entities
  const currentGym = gyms.find((g) => g.id === selectedGymId) || gyms[0];
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Handlers for Super Admin
  const handleAddGym = (newGymData: Omit<Gym, "id" | "createdAt">) => {
    const newGym: Gym = {
      ...newGymData,
      id: `gym-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGyms((prev) => [...prev, newGym]);
  };

  const handleUpdateGymStatus = (gymId: string, status: Gym["billingStatus"]) => {
    setGyms((prev) =>
      prev.map((g) => (g.id === gymId ? { ...g, billingStatus: status } : g))
    );
  };

  const handleMarkBillPaid = (billId: string) => {
    const today = new Date().toISOString().split("T")[0];
    setGymBillings((prev) =>
      prev.map((b) =>
        b.id === billId
          ? { ...b, status: "pagado", paidDate: today }
          : b
      )
    );
  };

  const handleGenerateBill = (gymId: string, month: string, amount: number) => {
    const targetGym = gyms.find((g) => g.id === gymId);
    const newBill: GymBilling = {
      id: `bill-${Date.now()}`,
      gymId,
      gymName: targetGym?.name || "Gimnasio",
      month,
      amount,
      dueDate: "2026-10-10",
      status: "pendiente",
      invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
    };
    setGymBillings((prev) => [newBill, ...prev]);
  };

  // Handlers for Gym Admin
  const handleAddClient = (newClientData: Omit<Client, "id" | "joinDate">) => {
    const newClient: Client = {
      ...newClientData,
      id: `client-${Date.now()}`,
      joinDate: new Date().toISOString().split("T")[0],
    };
    setClients((prev) => [newClient, ...prev]);
    // update gym totalMembers count
    setGyms((prev) =>
      prev.map((g) =>
        g.id === newClientData.gymId
          ? { ...g, totalMembers: g.totalMembers + 1 }
          : g
      )
    );
  };

  const handleAddRoutine = (routineData: Omit<Routine, "id">) => {
    const newRoutine: Routine = {
      ...routineData,
      id: `rot-${Date.now()}`,
    };
    setRoutines((prev) => [...prev, newRoutine]);
  };

  const handleAddPayment = (paymentData: Omit<Payment, "id" | "date">) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Automatically reduce debt from client
    setClients((prev) =>
      prev.map((c) =>
        c.id === paymentData.clientId
          ? { ...c, debtAmount: Math.max(0, c.debtAmount - paymentData.amount) }
          : c
      )
    );
  };

  const handleAddExtraPurchase = (
    purchaseData: Omit<ClientExtraPurchase, "id" | "date">
  ) => {
    const newPurchase: ClientExtraPurchase = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setExtraPurchases((prev) => [newPurchase, ...prev]);

    // If purchase was not paid immediately, add to client debt
    if (!purchaseData.isPaid) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === purchaseData.clientId
            ? { ...c, debtAmount: c.debtAmount + purchaseData.total }
            : c
        )
      );
    }
  };

  const handleAddExtraItem = (itemData: Omit<ExtraItem, "id">) => {
    const newItem: ExtraItem = {
      ...itemData,
      id: `ext-${Date.now()}`,
    };
    setExtraItems((prev) => [...prev, newItem]);
  };

  const handleAddTip = (tipData: Omit<GymTip, "id" | "date">) => {
    const newTip: GymTip = {
      ...tipData,
      id: `tip-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setTips((prev) => [newTip, ...prev]);
  };

  // Handlers for Client weekly control
  const handleToggleWorkoutCompleted = (routineId: string, day: string) => {
    const existingIndex = completedWorkouts.findIndex(
      (w) => w.clientId === selectedClientId && w.day === day
    );

    if (existingIndex >= 0) {
      // Remove completion
      setCompletedWorkouts((prev) =>
        prev.filter((_, idx) => idx !== existingIndex)
      );
    } else {
      // Add completion
      const routine = routines.find((r) => r.id === routineId);
      const newCompletion: CompletedWorkout = {
        id: `comp-${Date.now()}`,
        clientId: selectedClientId,
        routineId,
        routineName: routine?.name || "Rutina del día",
        muscleGroup: routine?.muscleGroup || "Pecho",
        day,
        completedAt: new Date().toISOString(),
        weekNumber: 36,
        year: 2026,
      };
      setCompletedWorkouts((prev) => [...prev, newCompletion]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header Bar with Geometric Balance styling */}
      <HeaderBar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        gyms={gyms}
        selectedGymId={selectedGymId}
        setSelectedGymId={(id) => {
          setSelectedGymId(id);
          // Also set first client of that gym as active
          const firstGymClient = clients.find((c) => c.gymId === id);
          if (firstGymClient) setSelectedClientId(firstGymClient.id);
        }}
        clients={clients}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRole === "super_admin" && (
          <SuperAdminView
            gyms={gyms}
            onAddGym={handleAddGym}
            onUpdateGymStatus={handleUpdateGymStatus}
            gymBillings={gymBillings}
            onMarkBillPaid={handleMarkBillPaid}
            onGenerateBill={handleGenerateBill}
            clients={clients}
          />
        )}

        {currentRole === "gym_admin" && (
          <GymAdminView
            currentGym={currentGym}
            clients={clients}
            onAddClient={handleAddClient}
            routines={routines}
            onAddRoutine={handleAddRoutine}
            payments={payments}
            onAddPayment={handleAddPayment}
            extraItems={extraItems}
            extraPurchases={extraPurchases}
            onAddExtraPurchase={handleAddExtraPurchase}
            onAddExtraItem={handleAddExtraItem}
            tips={tips}
            onAddTip={handleAddTip}
          />
        )}

        {currentRole === "client" && (
          <ClientView
            currentClient={currentClient}
            currentGym={currentGym}
            routines={routines}
            completedWorkouts={completedWorkouts}
            onToggleWorkoutCompleted={handleToggleWorkoutCompleted}
            payments={payments}
            extraPurchases={extraPurchases}
            tips={tips}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-4 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            GymCore SaaS Multi-Gimnasio • Diseñado para Frontend Vue 3 + Vuetify / PHP Backend &amp; MySQL
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer transition-colors"
            >
              Ver Esquema MySQL &amp; Código PHP
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">DeepSeek AI Workout Assistant</span>
          </div>
        </div>
      </footer>

      {/* Architecture & Code Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
