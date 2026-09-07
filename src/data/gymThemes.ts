import { Gym, GymThemeConfig } from "../types";

export function hexToRgb(hex: string): string {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "16, 185, 129"; // Default Emerald RGB
}

export function generateDefaultGymCss(
  gymName: string,
  primaryColor: string,
  primaryRgb: string,
  borderRadius: "sharp" | "rounded" | "curved" | "pill"
): string {
  const radiusMap = {
    sharp: "4px",
    rounded: "8px",
    curved: "16px",
    pill: "24px",
  };
  const radiusVal = radiusMap[borderRadius] || "12px";

  return `/* ===================================================
   HOJA DE ESTILO CSS PERSONALIZADA: ${gymName.toUpperCase()}
   Identidad visual inyectada dinámicamente en tiempo real
   =================================================== */

/* Variables del Gimnasio */
:root {
  --gym-brand-color: ${primaryColor};
  --gym-brand-rgb: ${primaryRgb};
  --gym-border-radius: ${radiusVal};
}

/* Encabezado destacado con gradiente de la sede */
.gym-custom-hero {
  background: linear-gradient(135deg, rgba(${primaryRgb}, 0.16) 0%, rgba(15, 23, 42, 0.95) 100%);
  border-bottom: 2px solid ${primaryColor};
  box-shadow: 0 10px 25px -5px rgba(${primaryRgb}, 0.15);
}

/* Botones principales exclusivos de la sede */
.gym-primary-btn {
  background-color: ${primaryColor} !important;
  color: #020617 !important;
  font-weight: 700 !important;
  border-radius: ${radiusVal} !important;
  box-shadow: 0 4px 14px rgba(${primaryRgb}, 0.35);
  transition: all 0.2s ease-in-out;
}

.gym-primary-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.12);
  box-shadow: 0 6px 20px rgba(${primaryRgb}, 0.5);
}

/* Tarjetas y módulos con acento de la sede */
.gym-card-highlight {
  border-color: rgba(${primaryRgb}, 0.4) !important;
  border-radius: ${radiusVal} !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.gym-card-highlight:hover {
  border-color: ${primaryColor} !important;
  box-shadow: 0 0 18px rgba(${primaryRgb}, 0.2);
}

/* Insignias e indicadores de estado */
.gym-badge-custom {
  background: rgba(${primaryRgb}, 0.12) !important;
  color: ${primaryColor} !important;
  border: 1px solid rgba(${primaryRgb}, 0.35) !important;
  font-weight: 600;
  border-radius: ${radiusVal};
}

/* Resplandor decorativo de identidad */
.gym-glow-effect {
  box-shadow: 0 0 25px rgba(${primaryRgb}, 0.25);
}`;
}

export const PRESET_GYM_THEMES: GymThemeConfig[] = [
  {
    themeId: "emerald_matrix",
    themeName: "Titan Matrix (Verde Neón & Carbono)",
    primaryColor: "#10b981",
    accentColor: "#34d399",
    primaryRgb: "16, 185, 129",
    bgColor: "#020617",
    surfaceColor: "#0b1317",
    borderRadius: "rounded",
    fontVibe: "sport_tech",
    customCss: generateDefaultGymCss("Titan Fitness Center", "#10b981", "16, 185, 129", "rounded"),
  },
  {
    themeId: "crimson_fury",
    themeName: "Iron Crimson (Rojo Furia & Obsidiana)",
    primaryColor: "#ef4444",
    accentColor: "#f87171",
    primaryRgb: "239, 68, 68",
    bgColor: "#09090b",
    surfaceColor: "#140c0f",
    borderRadius: "sharp",
    fontVibe: "bold_power",
    customCss: generateDefaultGymCss("IronFit Elite Studio", "#ef4444", "239, 68, 68", "sharp"),
  },
  {
    themeId: "amber_blaze",
    themeName: "Power Gold (Ámbar Dorado & Petróleo)",
    primaryColor: "#f59e0b",
    accentColor: "#fbbf24",
    primaryRgb: "245, 158, 11",
    bgColor: "#0c0a09",
    surfaceColor: "#15120c",
    borderRadius: "curved",
    fontVibe: "bold_power",
    customCss: generateDefaultGymCss("PowerHouse Gym", "#f59e0b", "245, 158, 11", "curved"),
  },
  {
    themeId: "cyber_cyan",
    themeName: "CyberPulse (Cian Eléctrico & Tech Cobalt)",
    primaryColor: "#06b6d4",
    accentColor: "#38bdf8",
    primaryRgb: "6, 182, 212",
    bgColor: "#020617",
    surfaceColor: "#081520",
    borderRadius: "curved",
    fontVibe: "cyber_mono",
    customCss: generateDefaultGymCss("CyberPulse Athletic", "#06b6d4", "6, 182, 212", "curved"),
  },
  {
    themeId: "amethyst_royal",
    themeName: "Amethyst Royal (Violeta VIP & Dark Luxury)",
    primaryColor: "#8b5cf6",
    accentColor: "#c084fc",
    primaryRgb: "139, 92, 246",
    bgColor: "#09090b",
    surfaceColor: "#120c1d",
    borderRadius: "rounded",
    fontVibe: "clean_modern",
    customCss: generateDefaultGymCss("Amethyst Boutique Club", "#8b5cf6", "139, 92, 246", "rounded"),
  },
  {
    themeId: "viper_lime",
    themeName: "Viper Voltage (Verde Lima & High Contrast)",
    primaryColor: "#84cc16",
    accentColor: "#a3e635",
    primaryRgb: "132, 204, 22",
    bgColor: "#020617",
    surfaceColor: "#0f160b",
    borderRadius: "sharp",
    fontVibe: "sport_tech",
    customCss: generateDefaultGymCss("Viper Calisthenics", "#84cc16", "132, 204, 22", "sharp"),
  },
  {
    themeId: "sunset_strike",
    themeName: "Sunset Flame (Naranja Fuego & Antracita)",
    primaryColor: "#f97316",
    accentColor: "#fb923c",
    primaryRgb: "249, 115, 22",
    bgColor: "#0c0a09",
    surfaceColor: "#170f0b",
    borderRadius: "curved",
    fontVibe: "sport_tech",
    customCss: generateDefaultGymCss("Sunset Blaze Fitness", "#f97316", "249, 115, 22", "curved"),
  },
  {
    themeId: "stealth_steel",
    themeName: "Titanium Steel (Grafito Platino Minimalista)",
    primaryColor: "#94a3b8",
    accentColor: "#cbd5e1",
    primaryRgb: "148, 163, 184",
    bgColor: "#0b0f17",
    surfaceColor: "#111827",
    borderRadius: "sharp",
    fontVibe: "clean_modern",
    customCss: generateDefaultGymCss("Stealth Pro Performance", "#94a3b8", "148, 163, 184", "sharp"),
  },
];

export const DEFAULT_GYM_THEME: GymThemeConfig = PRESET_GYM_THEMES[0];

export function getGymTheme(gym?: Gym): GymThemeConfig {
  if (!gym) return DEFAULT_GYM_THEME;
  if (gym.theme && gym.theme.primaryColor) {
    return {
      ...gym.theme,
      primaryRgb: gym.theme.primaryRgb || hexToRgb(gym.theme.primaryColor),
    };
  }
  // Fallbacks by ID or code if not explicitly saved
  if (gym.id === "gym-2" || gym.code?.includes("IRON")) {
    return PRESET_GYM_THEMES[1]; // Crimson
  }
  if (gym.id === "gym-3" || gym.code?.includes("POWER")) {
    return PRESET_GYM_THEMES[2]; // Amber
  }
  return PRESET_GYM_THEMES[0]; // Emerald
}
