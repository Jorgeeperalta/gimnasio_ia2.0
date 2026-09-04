import React, { useState, useEffect } from "react";
import {
  UserRole,
  UserAccount,
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
import { SYSTEM_USERS } from "./data/authUsers";
import { HeaderBar } from "./components/HeaderBar";
import { SuperAdminView } from "./components/SuperAdmin/SuperAdminView";
import { GymAdminView } from "./components/GymAdmin/GymAdminView";
import { ClientView } from "./components/Client/ClientView";
import { ArchitectureModal } from "./components/ArchitectureModal";
import { LoginView } from "./components/Auth/LoginView";
import { GymThemeInjector } from "./components/GymThemeInjector";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("gymcore_active_user");
      return saved ? (JSON.parse(saved) as UserAccount) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem("gymcore_system_users");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SYSTEM_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("gymcore_system_users", JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  const [gyms, setGyms] = useState<Gym[]>(() => {
    try {
      const saved = localStorage.getItem("gymcore_gyms");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_GYMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("gymcore_gyms", JSON.stringify(gyms));
    } catch {
      // ignore
    }
  }, [gyms]);
  const [selectedGymId, setSelectedGymId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("gymcore_active_user");
      if (saved) {
        const u = JSON.parse(saved) as UserAccount;
        if (u.gymId) return u.gymId;
      }
    } catch {
      // ignore
    }
    return "gym-1";
  });
  const [gymBillings, setGymBillings] = useState<GymBilling[]>(INITIAL_GYM_BILLINGS);
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem("gymcore_clients");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("gymcore_clients", JSON.stringify(clients));
    } catch {
      // ignore
    }
  }, [clients]);

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("gymcore_active_user");
      if (saved) {
        const u = JSON.parse(saved) as UserAccount;
        if (u.clientId) return u.clientId;
      }
    } catch {
      // ignore
    }
    return "client-1";
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem("gymcore_routines");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ROUTINES;
  });

  useEffect(() => {
    try {
      localStorage.setItem("gymcore_routines", JSON.stringify(routines));
    } catch {
      // ignore
    }
  }, [routines]);

  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(() => {
    try {
      const saved = localStorage.getItem("gymcore_completed_workouts");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_COMPLETED_WORKOUTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("gymcore_completed_workouts", JSON.stringify(completedWorkouts));
    } catch {
      // ignore
    }
  }, [completedWorkouts]);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>(INITIAL_EXTRA_ITEMS);
  const [extraPurchases, setExtraPurchases] = useState<ClientExtraPurchase[]>(
    INITIAL_EXTRA_PURCHASES
  );
  const [tips, setTips] = useState<GymTip[]>(INITIAL_TIPS);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Authentication Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("gymcore_active_user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    if (user.gymId) {
      setSelectedGymId(user.gymId);
    }
    if (user.clientId) {
      setSelectedClientId(user.clientId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("gymcore_active_user");
    } catch (e) {
      console.error(e);
    }
  };

  // Active entities
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const currentGym =
    currentUser?.role === "client" && currentClient
      ? gyms.find((g) => g.id === currentClient.gymId) || gyms[0]
      : gyms.find((g) => g.id === selectedGymId) || gyms[0];

  // Handlers for User Management
  const handleAddUser = (newUser: UserAccount) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleEditUser = (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem("gymcore_active_user", JSON.stringify(updatedUser));
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Handlers for Super Admin
  const handleAddGym = (
    newGymData: Omit<Gym, "id" | "createdAt">,
    adminCredentials?: { name: string; username: string; password: string; email: string }
  ) => {
    const gymId = `gym-${Date.now()}`;
    const newGym: Gym = {
      ...newGymData,
      id: gymId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGyms((prev) => [...prev, newGym]);

    if (adminCredentials && adminCredentials.username && adminCredentials.password) {
      const newAdminUser: UserAccount = {
        id: `usr-admin-${Date.now()}`,
        username: adminCredentials.username.trim().toLowerCase(),
        password: adminCredentials.password,
        name: adminCredentials.name || `Admin ${newGym.name}`,
        role: "gym_admin",
        email: adminCredentials.email || newGym.email,
        gymId: gymId,
      };
      setUsers((prev) => [newAdminUser, ...prev]);
    }
  };

  const handleEditGym = (updatedGym: Gym) => {
    setGyms((prev) => prev.map((g) => (g.id === updatedGym.id ? updatedGym : g)));
    setGymBillings((prev) =>
      prev.map((b) => (b.gymId === updatedGym.id ? { ...b, gymName: updatedGym.name } : b))
    );
    setClients((prev) =>
      prev.map((c) => (c.gymId === updatedGym.id ? { ...c, gymName: updatedGym.name } : c))
    );
  };

  const handleDeleteGym = (gymId: string) => {
    setGyms((prev) => prev.filter((g) => g.id !== gymId));
    setGymBillings((prev) => prev.filter((b) => b.gymId !== gymId));
    setClients((prev) => prev.filter((c) => c.gymId !== gymId));
    setRoutines((prev) => prev.filter((r) => r.gymId !== gymId));
    setTips((prev) => prev.filter((t) => t.gymId !== gymId));
    setUsers((prev) => prev.filter((u) => u.gymId !== gymId));
    if (selectedGymId === gymId) {
      const remaining = gyms.filter((g) => g.id !== gymId);
      if (remaining.length > 0) setSelectedGymId(remaining[0].id);
    }
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

  const handleEditGymBilling = (updatedBill: GymBilling) => {
    setGymBillings((prev) =>
      prev.map((b) => (b.id === updatedBill.id ? updatedBill : b))
    );
  };

  const handleDeleteGymBilling = (billId: string) => {
    setGymBillings((prev) => prev.filter((b) => b.id !== billId));
  };

  // Handlers for Gym Admin & Global Clients
  const handleAddClient = (
    newClientData: Omit<Client, "id" | "joinDate">,
    userCredentials?: { username: string; password: string }
  ) => {
    const clientId = `client-${Date.now()}`;
    const newClient: Client = {
      ...newClientData,
      id: clientId,
      joinDate: new Date().toISOString().split("T")[0],
    };
    setClients((prev) => [newClient, ...prev]);

    // Sync routines if assigned to any
    const routineIds = newClient.assignedRoutineIds || (newClient.assignedRoutineId ? [newClient.assignedRoutineId] : []);
    if (routineIds.length > 0) {
      setRoutines((prev) =>
        prev.map((r) => {
          if (routineIds.includes(r.id)) {
            const currentClients = r.assignedClientIds || [];
            if (!currentClients.includes(clientId)) {
              return { ...r, assignedClientIds: [...currentClients, clientId] };
            }
          }
          return r;
        })
      );
    }

    // update gym totalMembers count
    setGyms((prev) =>
      prev.map((g) =>
        g.id === newClientData.gymId
          ? { ...g, totalMembers: g.totalMembers + 1 }
          : g
      )
    );

    if (userCredentials && userCredentials.username && userCredentials.password) {
      const newClientUser: UserAccount = {
        id: `usr-client-${Date.now()}`,
        username: userCredentials.username.trim().toLowerCase(),
        password: userCredentials.password,
        name: newClient.name,
        role: "client",
        email: newClient.email,
        gymId: newClient.gymId,
        clientId: clientId,
      };
      setUsers((prev) => [newClientUser, ...prev]);
    }
  };

  const handleEditClient = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    setUsers((prev) =>
      prev.map((u) =>
        u.clientId === updatedClient.id
          ? { ...u, name: updatedClient.name, email: updatedClient.email }
          : u
      )
    );

    // Sync routines for this client if assignedRoutineIds is present
    const routineIds =
      updatedClient.assignedRoutineIds ||
      (updatedClient.assignedRoutineId ? [updatedClient.assignedRoutineId] : []);
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.gymId !== updatedClient.gymId) return r;
        const shouldHave = routineIds.includes(r.id);
        const currentClients = r.assignedClientIds || [];
        if (shouldHave && !currentClients.includes(updatedClient.id)) {
          return { ...r, assignedClientIds: [...currentClients, updatedClient.id] };
        } else if (!shouldHave && currentClients.includes(updatedClient.id)) {
          return { ...r, assignedClientIds: currentClients.filter((id) => id !== updatedClient.id) };
        }
        return r;
      })
    );
  };

  const handleDeleteClient = (clientId: string) => {
    const target = clients.find((c) => c.id === clientId);
    if (target) {
      setGyms((prev) =>
        prev.map((g) =>
          g.id === target.gymId
            ? { ...g, totalMembers: Math.max(0, g.totalMembers - 1) }
            : g
        )
      );
    }
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setPayments((prev) => prev.filter((p) => p.clientId !== clientId));
    setExtraPurchases((prev) => prev.filter((p) => p.clientId !== clientId));
    setCompletedWorkouts((prev) => prev.filter((w) => w.clientId !== clientId));
    setUsers((prev) => prev.filter((u) => u.clientId !== clientId));
    // Clean up routine assignedClientIds
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.assignedClientIds && r.assignedClientIds.includes(clientId)) {
          return {
            ...r,
            assignedClientIds: r.assignedClientIds.filter((id) => id !== clientId),
          };
        }
        return r;
      })
    );
    if (selectedClientId === clientId) {
      const remaining = clients.filter((c) => c.id !== clientId);
      if (remaining.length > 0) setSelectedClientId(remaining[0].id);
    }
  };

  const handleAddRoutine = (routineData: Omit<Routine, "id">) => {
    const routineId = `rot-${Date.now()}`;
    const newRoutine: Routine = {
      ...routineData,
      id: routineId,
    };
    setRoutines((prev) => [...prev, newRoutine]);

    // If routine is assigned to specific clients, sync them
    if (newRoutine.assignedClientIds && newRoutine.assignedClientIds.length > 0) {
      setClients((prev) =>
        prev.map((c) => {
          if (newRoutine.assignedClientIds?.includes(c.id)) {
            const currentRots = c.assignedRoutineIds || (c.assignedRoutineId ? [c.assignedRoutineId] : []);
            if (!currentRots.includes(routineId)) {
              const updatedRots = [...currentRots, routineId];
              return {
                ...c,
                assignedRoutineId: updatedRots[0],
                assignedRoutineIds: updatedRots,
              };
            }
          }
          return c;
        })
      );
    }
  };

  const handleEditRoutine = (updatedRoutine: Routine) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r))
    );

    // Synchronize client assignments
    const targetRoutineId = updatedRoutine.id;
    const assignedIds = updatedRoutine.assignedClientIds || [];

    setClients((prev) =>
      prev.map((c) => {
        if (c.gymId !== updatedRoutine.gymId) return c;
        const currentRots = c.assignedRoutineIds || (c.assignedRoutineId ? [c.assignedRoutineId] : []);
        const shouldHave = assignedIds.includes(c.id);

        if (shouldHave && !currentRots.includes(targetRoutineId)) {
          const updatedRots = [...currentRots, targetRoutineId];
          return {
            ...c,
            assignedRoutineId: updatedRots[0],
            assignedRoutineIds: updatedRots,
          };
        } else if (!shouldHave && currentRots.includes(targetRoutineId)) {
          const updatedRots = currentRots.filter((id) => id !== targetRoutineId);
          return {
            ...c,
            assignedRoutineId: updatedRots[0] || undefined,
            assignedRoutineIds: updatedRots,
          };
        }
        return c;
      })
    );
  };

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    setCompletedWorkouts((prev) => prev.filter((w) => w.routineId !== routineId));
    // Clean up client assignments
    setClients((prev) =>
      prev.map((c) => {
        const currentRots = c.assignedRoutineIds || (c.assignedRoutineId ? [c.assignedRoutineId] : []);
        if (currentRots.includes(routineId)) {
          const updatedRots = currentRots.filter((id) => id !== routineId);
          return {
            ...c,
            assignedRoutineId: updatedRots[0] || undefined,
            assignedRoutineIds: updatedRots,
          };
        }
        return c;
      })
    );
  };

  const handleAssignRoutinesToClient = (clientId: string, routineIds: string[]) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              assignedRoutineId: routineIds[0] || undefined,
              assignedRoutineIds: routineIds,
            }
          : c
      )
    );

    // Sync routines' assignedClientIds
    setRoutines((prev) =>
      prev.map((r) => {
        const shouldHave = routineIds.includes(r.id);
        const currentClients = r.assignedClientIds || [];
        if (shouldHave && !currentClients.includes(clientId)) {
          return { ...r, assignedClientIds: [...currentClients, clientId] };
        } else if (!shouldHave && currentClients.includes(clientId)) {
          return { ...r, assignedClientIds: currentClients.filter((id) => id !== clientId) };
        }
        return r;
      })
    );
  };

  const handleAssignClientsToRoutine = (routineId: string, clientIds: string[]) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === routineId
          ? { ...r, assignedClientIds: clientIds }
          : r
      )
    );

    // Sync clients' assignedRoutineIds
    setClients((prev) =>
      prev.map((c) => {
        const shouldHave = clientIds.includes(c.id);
        const currentRots = c.assignedRoutineIds || (c.assignedRoutineId ? [c.assignedRoutineId] : []);
        if (shouldHave && !currentRots.includes(routineId)) {
          const updatedRots = [...currentRots, routineId];
          return {
            ...c,
            assignedRoutineId: updatedRots[0],
            assignedRoutineIds: updatedRots,
          };
        } else if (!shouldHave && currentRots.includes(routineId)) {
          const updatedRots = currentRots.filter((id) => id !== routineId);
          return {
            ...c,
            assignedRoutineId: updatedRots[0] || undefined,
            assignedRoutineIds: updatedRots,
          };
        }
        return c;
      })
    );
  };

  const handleRemoveRoutineFromClient = (clientId: string, routineId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const currentRots = c.assignedRoutineIds || (c.assignedRoutineId ? [c.assignedRoutineId] : []);
        const updatedRots = currentRots.filter((id) => id !== routineId);
        return {
          ...c,
          assignedRoutineId: updatedRots[0] || undefined,
          assignedRoutineIds: updatedRots,
        };
      })
    );

    // Also remove clientId from routine's assignedClientIds
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== routineId) return r;
        const currentClients = r.assignedClientIds || [];
        return {
          ...r,
          assignedClientIds: currentClients.filter((id) => id !== clientId),
        };
      })
    );
  };

  const handleUnassignAllRoutinesFromClient = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          assignedRoutineId: undefined,
          assignedRoutineIds: [],
        };
      })
    );

    setRoutines((prev) =>
      prev.map((r) => {
        const currentClients = r.assignedClientIds || [];
        if (currentClients.includes(clientId)) {
          return {
            ...r,
            assignedClientIds: currentClients.filter((id) => id !== clientId),
          };
        }
        return r;
      })
    );

    // Also remove any completed workouts for this client
    setCompletedWorkouts((prev) => prev.filter((w) => w.clientId !== clientId));
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

  const handleEditPayment = (updatedPayment: Payment) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
  };

  const handleDeletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
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

  const handleEditExtraPurchase = (updatedPurchase: ClientExtraPurchase) => {
    setExtraPurchases((prev) =>
      prev.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p))
    );
  };

  const handleDeleteExtraPurchase = (purchaseId: string) => {
    setExtraPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
  };

  const handleAddExtraItem = (itemData: Omit<ExtraItem, "id">) => {
    const newItem: ExtraItem = {
      ...itemData,
      id: `ext-${Date.now()}`,
    };
    setExtraItems((prev) => [...prev, newItem]);
  };

  const handleEditExtraItem = (updatedItem: ExtraItem) => {
    setExtraItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
  };

  const handleDeleteExtraItem = (itemId: string) => {
    setExtraItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleAddTip = (tipData: Omit<GymTip, "id" | "date">) => {
    const newTip: GymTip = {
      ...tipData,
      id: `tip-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setTips((prev) => [...prev, newTip]);
  };

  const handleEditTip = (updatedTip: GymTip) => {
    setTips((prev) =>
      prev.map((t) => (t.id === updatedTip.id ? updatedTip : t))
    );
  };

  const handleDeleteTip = (tipId: string) => {
    setTips((prev) => prev.filter((t) => t.id !== tipId));
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

  const handleEditCompletedWorkout = (updatedWorkout: CompletedWorkout) => {
    setCompletedWorkouts((prev) =>
      prev.map((w) => (w.id === updatedWorkout.id ? updatedWorkout : w))
    );
  };

  const handleDeleteCompletedWorkout = (workoutId: string) => {
    setCompletedWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
  };

  const handleUpdateClientProfile = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  if (!currentUser) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
          users={users}
        />
        <ArchitectureModal
          isOpen={isArchitectureModalOpen}
          onClose={() => setIsArchitectureModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Inyección dinámica de CSS exclusivo y aislado por gimnasio */}
      <GymThemeInjector gym={currentGym} />

      {/* Header Bar with Geometric Balance styling & authenticated user */}
      <HeaderBar
        currentUser={currentUser}
        onLogout={handleLogout}
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

      {/* Main Container - Module displayed strictly according to authenticated role with dynamic Gym CSS applied */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gym-themed-workspace">
        {currentUser.role === "super_admin" && (
          <SuperAdminView
            gyms={gyms}
            onAddGym={handleAddGym}
            onEditGym={handleEditGym}
            onDeleteGym={handleDeleteGym}
            onUpdateGymStatus={handleUpdateGymStatus}
            gymBillings={gymBillings}
            onMarkBillPaid={handleMarkBillPaid}
            onGenerateBill={handleGenerateBill}
            onEditGymBilling={handleEditGymBilling}
            onDeleteGymBilling={handleDeleteGymBilling}
            clients={clients}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            users={users}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {currentUser.role === "gym_admin" && (
          <GymAdminView
            currentGym={currentGym}
            clients={clients}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            routines={routines}
            onAddRoutine={handleAddRoutine}
            onEditRoutine={handleEditRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            payments={payments}
            onAddPayment={handleAddPayment}
            onEditPayment={handleEditPayment}
            onDeletePayment={handleDeletePayment}
            extraItems={extraItems}
            onAddExtraItem={handleAddExtraItem}
            onEditExtraItem={handleEditExtraItem}
            onDeleteExtraItem={handleDeleteExtraItem}
            extraPurchases={extraPurchases}
            onAddExtraPurchase={handleAddExtraPurchase}
            onEditExtraPurchase={handleEditExtraPurchase}
            onDeleteExtraPurchase={handleDeleteExtraPurchase}
            tips={tips}
            onAddTip={handleAddTip}
            onEditTip={handleEditTip}
            onDeleteTip={handleDeleteTip}
            users={users.filter((u) => u.gymId === currentGym.id)}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onAssignRoutinesToClient={handleAssignRoutinesToClient}
            onAssignClientsToRoutine={handleAssignClientsToRoutine}
            onRemoveRoutineFromClient={handleRemoveRoutineFromClient}
            onUnassignAllRoutinesFromClient={handleUnassignAllRoutinesFromClient}
          />
        )}

        {currentUser.role === "client" && (
          <ClientView
            currentClient={currentClient}
            currentGym={currentGym}
            routines={routines}
            completedWorkouts={completedWorkouts}
            onToggleWorkoutCompleted={handleToggleWorkoutCompleted}
            onEditCompletedWorkout={handleEditCompletedWorkout}
            onDeleteCompletedWorkout={handleDeleteCompletedWorkout}
            onUpdateClientProfile={handleUpdateClientProfile}
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
            GymCore SaaS • Sesión: <strong className="text-white">{currentUser.name}</strong> (@{currentUser.username})
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer transition-colors"
            >
              Ver Esquema MySQL &amp; Código PHP
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer transition-colors"
            >
              Cerrar Sesión
            </button>
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
