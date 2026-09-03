import React from "react";
import { UserRole, Gym, Client, UserAccount } from "../types";
import { Dumbbell, Shield, Building2, User, Code2, LogOut } from "lucide-react";

interface HeaderBarProps {
  currentUser: UserAccount;
  onLogout: () => void;
  gyms: Gym[];
  selectedGymId: string;
  setSelectedGymId: (id: string) => void;
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  onOpenArchitecture: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentUser,
  onLogout,
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

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return {
          icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />,
          label: "Super Admin",
          desc: "Control Maestro de Sedes & Cobros",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "gym_admin":
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-cyan-400" />,
          label: "Admin Gimnasio",
          desc: `Gestión de Sede: ${currentGym.name}`,
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        };
      case "client":
        return {
          icon: <User className="w-3.5 h-3.5 text-amber-400" />,
          label: "Portal Atleta",
          desc: `Atleta: ${currentClient.name} • ${currentGym.name}`,
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="bg-slate-950/95 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-lg backdrop-blur-md">
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
                <span className="font-bold text-lg tracking-tight text-white font-mono">
                  GymCore
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  SaaS Multi-Gimnasio
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block font-mono text-[11px]">
                Módulo Activo: {roleInfo.label}
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Active Gym Selector for Gym Admin if managing multiple or checking other gyms */}
            {currentUser.role === "gym_admin" && (
              <div className="hidden md:flex items-center bg-slate-900/90 rounded-lg px-3 py-1.5 border border-slate-800">
                <Building2 className="w-4 h-4 text-emerald-400 mr-2" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
                    Sede Activa
                  </div>
                  <select
                    id="gym-selector"
                    value={selectedGymId}
                    onChange={(e) => setSelectedGymId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-2 font-mono"
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

            {/* Client selector (when in Client role with multiple athlete profiles for demo) */}
            {currentUser.role === "client" && (
              <div className="hidden lg:flex items-center bg-slate-900/90 rounded-lg px-3 py-1.5 border border-slate-800">
                <User className="w-4 h-4 text-emerald-400 mr-2" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
                    Perfil Atleta
                  </div>
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
              className="hidden sm:flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition-all font-mono"
              title="Ver código PHP, MySQL y Vue 3 Vuetify"
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>PHP / MySQL</span>
            </button>

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer font-mono"
              title="Cerrar sesión de esta cuenta y cambiar de rol"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* User Identity Toolbar (Geometric Balance style) */}
        <div className="py-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* User Info Capsule */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                {roleInfo.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{currentUser.name}</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  @{currentUser.username}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border font-mono ${roleInfo.color}`}
                >
                  {roleInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Module description */}
          <div className="flex items-center text-xs text-slate-400 space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-300">
              {roleInfo.desc}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
