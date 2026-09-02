import React, { useState } from "react";
import { MYSQL_SCHEMA_SQL, PHP_BACKEND_CODE, VUE3_VUETIFY_CODE } from "../data/backendCode";
import { Database, FileCode, Check, Copy, X } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<"mysql" | "php" | "vue">("mysql");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode =
    tab === "mysql"
      ? MYSQL_SCHEMA_SQL
      : tab === "php"
      ? PHP_BACKEND_CODE
      : VUE3_VUETIFY_CODE;

  const currentFilename =
    tab === "mysql" ? "schema.sql" : tab === "php" ? "api.php" : "GymSystem.vue";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                Código & Arquitectura Solicitada
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                  PHP + MySQL + Vue.js / Vuetify
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Archivos listos para producción para desplegar en tu hosting PHP/MySQL y Vue.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setTab("mysql")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === "mysql"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              1. Base de Datos MySQL (schema.sql)
            </button>
            <button
              onClick={() => setTab("php")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === "php"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              2. Backend PHP PDO (api.php)
            </button>
            <button
              onClick={() => setTab("vue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === "vue"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              3. Frontend Vue 3 + Vuetify (GymSystem.vue)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar {currentFilename}</span>
              </>
            )}
          </button>
        </div>

        {/* Code View Area */}
        <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-slate-300">
          <pre className="whitespace-pre">{currentCode}</pre>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            Archivo actual: <strong className="text-white font-mono">{currentFilename}</strong>
          </span>
          <span>
            Para ejecutar en local: Importa el SQL en phpMyAdmin/MySQL y sube api.php a tu servidor Apache/Nginx.
          </span>
        </div>
      </div>
    </div>
  );
};
