import React, { useState } from "react";
import { UserAccount } from "../../types";
import { SYSTEM_USERS, authenticateUser } from "../../data/authUsers";
import {
  Dumbbell,
  Shield,
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
  onOpenArchitecture?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onOpenArchitecture }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedQuickRole, setSelectedQuickRole] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Por favor ingrese su usuario y contraseña.");
      return;
    }

    const user = authenticateUser(username, password);
    if (user) {
      onLogin(user);
    } else {
      setErrorMsg("Credenciales incorrectas. Verifique su usuario y contraseña.");
    }
  };

  const handleAutofill = (u: UserAccount) => {
    setUsername(u.username);
    setPassword(u.password);
    setSelectedQuickRole(u.role);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top mini header */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white font-mono">
              GymCore
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              SaaS Multi-Gimnasio
            </span>
          </div>
        </div>

        {onOpenArchitecture && (
          <button
            onClick={onOpenArchitecture}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 bg-slate-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            Ver Esquema MySQL & PHP
          </button>
        )}
      </header>

      {/* Center login card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Iniciar Sesión en GymCore
              </h1>
              <p className="text-xs text-slate-400">
                Cada rol accede de manera aislada y exclusiva a su módulo correspondiente.
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  Usuario o Nombre de Cuenta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. jorge50"
                    autoComplete="username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Ingresar a Mi Módulo
              </button>
            </form>
          </div>

          {/* Quick Demo Access Credential Badges */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
                Credenciales de Acceso por Rol
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">1 clic para autollenar</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Super Admin */}
              <div
                onClick={() => handleAutofill(SYSTEM_USERS[0])}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedQuickRole === "super_admin" || username === "jorge50"
                    ? "bg-emerald-950/40 border-emerald-500 text-slate-100 ring-1 ring-emerald-500/50"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Super Admin</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-normal">
                        ({SYSTEM_USERS[0].name})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Usuario: <strong className="text-slate-200">jorge50</strong> • Clave:{" "}
                      <strong className="text-slate-200">Afm123</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"
                >
                  Usar
                </button>
              </div>

              {/* Gym Admin */}
              <div
                onClick={() => handleAutofill(SYSTEM_USERS[1])}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedQuickRole === "gym_admin" || username === "admin_titan"
                    ? "bg-emerald-950/40 border-emerald-500 text-slate-100 ring-1 ring-emerald-500/50"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Admin Gimnasio</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        (Titan Fitness)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Usuario: <strong className="text-slate-200">admin_titan</strong> • Clave:{" "}
                      <strong className="text-slate-200">GymTitan123</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700"
                >
                  Usar
                </button>
              </div>

              {/* Client */}
              <div
                onClick={() => handleAutofill(SYSTEM_USERS[3])}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedQuickRole === "client" || username === "atleta_carlos"
                    ? "bg-emerald-950/40 border-emerald-500 text-slate-100 ring-1 ring-emerald-500/50"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Cliente / Atleta</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        (Carlos Méndez)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Usuario: <strong className="text-slate-200">atleta_carlos</strong> • Clave:{" "}
                      <strong className="text-slate-200">Atleta123</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700"
                >
                  Usar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-3 text-center text-xs text-slate-500 font-mono">
        GymCore SaaS Multi-Gimnasio • Seguridad basada en roles (RBAC) • Jorge (Super Admin: jorge50 / Afm123)
      </footer>
    </div>
  );
};
