import React, { useEffect } from "react";
import { Gym } from "../types";
import { getGymTheme } from "../data/gymThemes";

interface GymThemeInjectorProps {
  gym?: Gym;
}

export const GymThemeInjector: React.FC<GymThemeInjectorProps> = ({ gym }) => {
  const theme = getGymTheme(gym);

  useEffect(() => {
    const styleId = "gymcore-dynamic-custom-css";
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const radiusMap = {
      sharp: "4px",
      rounded: "8px",
      curved: "16px",
      pill: "24px",
    };
    const radiusVal = radiusMap[theme.borderRadius] || "12px";

    const cssContent = `
/* ==========================================================
   CSS DINÁMICO ASIGNADO A LA SEDE: ${gym?.name || "Gym"} (${theme.themeName})
   ========================================================== */
:root {
  --gym-primary: ${theme.primaryColor};
  --gym-primary-rgb: ${theme.primaryRgb};
  --gym-accent: ${theme.accentColor};
  --gym-radius: ${radiusVal};
}

/* Contenedor temático de la sede activa (GymAdmin y Client portal) */
.gym-themed-workspace {
  --gym-primary: ${theme.primaryColor};
  --gym-primary-rgb: ${theme.primaryRgb};
  --gym-accent: ${theme.accentColor};
}

/* Adaptación dinámica de elementos Tailwind con la paleta de la sede */
.gym-themed-workspace .text-emerald-400,
.gym-themed-workspace .text-emerald-300 {
  color: var(--gym-primary) !important;
}

.gym-themed-workspace .bg-emerald-500 {
  background-color: var(--gym-primary) !important;
}

.gym-themed-workspace .hover\\:bg-emerald-400:hover,
.gym-themed-workspace .hover\\:bg-emerald-600:hover {
  filter: brightness(1.15) !important;
}

.gym-themed-workspace .bg-emerald-500\\/10 {
  background-color: rgba(var(--gym-primary-rgb), 0.12) !important;
}

.gym-themed-workspace .bg-emerald-500\\/20 {
  background-color: rgba(var(--gym-primary-rgb), 0.22) !important;
}

.gym-themed-workspace .bg-emerald-500\\/30 {
  background-color: rgba(var(--gym-primary-rgb), 0.32) !important;
}

.gym-themed-workspace .border-emerald-500\\/20,
.gym-themed-workspace .border-emerald-500\\/30,
.gym-themed-workspace .border-emerald-500\\/40,
.gym-themed-workspace .border-emerald-500\\/50 {
  border-color: rgba(var(--gym-primary-rgb), 0.35) !important;
}

.gym-themed-workspace .border-emerald-500 {
  border-color: var(--gym-primary) !important;
}

.gym-themed-workspace .ring-emerald-500,
.gym-themed-workspace .ring-emerald-500\\/20 {
  --tw-ring-color: var(--gym-primary) !important;
}

.gym-themed-workspace .shadow-emerald-500\\/20 {
  --tw-shadow-color: rgba(var(--gym-primary-rgb), 0.35) !important;
}

/* Insignias e indicadores con el CSS de la sede */
.gym-brand-pill {
  background-color: rgba(var(--gym-primary-rgb), 0.15) !important;
  color: var(--gym-primary) !important;
  border: 1px solid rgba(var(--gym-primary-rgb), 0.4) !important;
  border-radius: ${radiusVal} !important;
}

.gym-brand-btn {
  background-color: var(--gym-primary) !important;
  color: #030712 !important;
  border-radius: ${radiusVal} !important;
  box-shadow: 0 4px 12px rgba(var(--gym-primary-rgb), 0.3);
  transition: all 0.2s ease;
}

.gym-brand-btn:hover {
  filter: brightness(1.15);
  box-shadow: 0 6px 18px rgba(var(--gym-primary-rgb), 0.45);
}

/* ==========================================================
   CSS PERSONALIZADO ADICIONAL DE LA SEDE
   ========================================================== */
${theme.customCss || ""}
    `;

    styleTag.textContent = cssContent;

    return () => {
      // Keep style tag updated
    };
  }, [gym, theme]);

  return null;
};
