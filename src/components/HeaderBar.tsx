import React from "react";
import { UserRole, Gym, Client } from "../types";
import { Dumbbell, Shield, Building2, User, Code2, ChevronDown } from "lucide-react";

interface HeaderBarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  gyms: Gym[];
  selectedGymId: string;
  setSelectedGymId: (id: string) => void;
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  onOpenArchitecture: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentRole,
  setCurrentRole,
  gyms,
  selectedGymId,
  setSelectedGymId,
  clients,
  selectedClientId,
  setSelectedClientId,
  onOpenArchitecture,
}) => {
  const currentGym = gyms.find((g) => g.id === selectedGymId) || gyms[0];
  const gymClients = clients.filter((c) => c.gymId === selectedGymId);
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <header className="bg-slate-950/90 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-lg backdrop-blur-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950">
              <Dumbbell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-white font-mono">
                  GymCore
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  Multi-Gym SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Vue 3 + Vuetify • PHP Back • MySQL • DeepSeek AI Coach
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Active Gym Selector (Relevant for Admin and Client) */}
            {currentRole !== "super_admin" && (
              <div className="hidden md:flex items-center bg-slate-900/90 rounded-lg px-3 py-1.5 border border-slate-800">
                <Building2 className="w-4 h-4 text-emerald-400 mr-2" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gimnasio</div>
                  <select
                    id="gym-selector"
                    value={selectedGymId}
                    onChange={(e) => setSelectedGymId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-2"
                  >
                    {gyms.map((gym) => (
                      <option key={gym.id} value={gym.id} className="bg-slate-950 text-slate-200">
                        {gym.name} ({gym.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Client selector (when in Client role) */}
            {currentRole === "client" && (
              <div className="hidden lg:flex items-center bg-slate-900/90 rounded-lg px-3 py-1.5 border border-slate-800">
                <User className="w-4 h-4 text-emerald-400 mr-2" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Atleta Activo</div>
                  <select
                    id="client-selector"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-2"
                  >
                    {gymClients.length > 0 ? (
                      gymClients.map((client) => (
                        <option key={client.id} value={client.id} className="bg-slate-950 text-slate-200">
                          {client.name} {client.debtAmount > 0 ? `(Debe $${client.debtAmount})` : "✓ Al día"}
                        </option>
                      ))
                    ) : (
                      <option value={currentClient.id} className="bg-slate-950 text-slate-200">
                        {currentClient.name}
                      </option>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Code / Architecture Modal Button */}
            <button
              id="open-architecture-btn"
              onClick={onOpenArchitecture}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
              title="Ver código PHP, MySQL y Vue 3 Vuetify"
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Código PHP / MySQL</span>
            </button>
          </div>
        </div>

        {/* Role Switcher Toolbar (Geometric Balance style) */}
        <div className="py-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              id="role-super-admin-btn"
              onClick={() => setCurrentRole("super_admin")}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                currentRole === "super_admin"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>1. Super Admin</span>
            </button>

            <button
              id="role-gym-admin-btn"
              onClick={() => setCurrentRole("gym_admin")}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                currentRole === "gym_admin"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Admin Gimnasio</span>
            </button>

            <button
              id="role-client-btn"
              onClick={() => setCurrentRole("client")}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                currentRole === "client"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>3. Cliente (Chat DeepSeek)</span>
            </button>
          </div>

          <div className="flex items-center text-xs text-slate-400 space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px]">
              {currentRole === "super_admin" && "Modo: Plataforma Multi-Gimnasio & Cobros"}
              {currentRole === "gym_admin" && `Gestión de: ${currentGym.name}`}
              {currentRole === "client" && `Atleta: ${currentClient.name} • ${currentGym.name}`}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
