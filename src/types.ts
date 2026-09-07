export type UserRole = "super_admin" | "gym_admin" | "client";

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
  gymId?: string;
  clientId?: string;
  avatarUrl?: string;
}

export interface GymThemeConfig {
  themeId: string;
  themeName: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor: string;
  primaryRgb: string;
  bgColor?: string;
  surfaceColor?: string;
  borderRadius: "sharp" | "rounded" | "curved" | "pill";
  fontVibe?: "sport_tech" | "bold_power" | "clean_modern" | "cyber_mono";
  customCss?: string;
}

export interface Gym {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  monthlyFee: number; // Cobro de la plataforma al gimnasio
  billingStatus: "al_dia" | "pendiente" | "suspendido";
  totalMembers: number;
  plan: "Básico" | "Pro" | "Enterprise";
  createdAt: string;
  theme?: GymThemeConfig; // Identidad CSS y tema asignado en la creación
}

export interface GymBilling {
  id: string;
  gymId: string;
  gymName: string;
  month: string; // Ej: "Septiembre 2026"
  amount: number;
  dueDate: string;
  status: "pagado" | "pendiente" | "vencido";
  paidDate?: string;
  invoiceNumber: string;
}

export interface Client {
  id: string;
  gymId: string;
  gymName: string;
  name: string;
  email: string;
  phone: string;
  membershipPlan: string;
  monthlyFee: number;
  debtAmount: number; // Control de deuda
  assignedRoutineId?: string;
  assignedRoutineIds?: string[]; // IDs de rutinas asignadas al atleta
  status: "activo" | "inactivo" | "moroso";
  joinDate: string;
}

export type MuscleGroup =
  | "Pecho"
  | "Espalda"
  | "Piernas"
  | "Hombros"
  | "Bíceps"
  | "Tríceps"
  | "Abdomen / Core"
  | "Cardio & Full Body";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface Routine {
  id: string;
  gymId: string;
  name: string;
  muscleGroup: MuscleGroup;
  day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
  estimatedMinutes: number;
  level: "Principiante" | "Intermedio" | "Avanzado";
  exercises: Exercise[];
  notes?: string;
  assignedClientIds?: string[]; // IDs de atletas específicos asignados (si está vacío o no se define, es general para la sede)
}

export interface CompletedWorkout {
  id: string;
  clientId: string;
  routineId: string;
  routineName: string;
  muscleGroup: MuscleGroup;
  day: string;
  completedAt: string; // ISO date string
  weekNumber: number;
  year: number;
}

export interface Payment {
  id: string;
  gymId: string;
  clientId: string;
  clientName: string;
  amount: number;
  concept: string; // "Mensualidad", "Inscripción", "Pago parcial", etc.
  date: string;
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  status: "completado" | "pendiente";
}

export interface ExtraItem {
  id: string;
  gymId: string;
  name: string;
  category: "Bebida" | "Suplemento" | "Snack" | "Accesorio" | "Servicio";
  price: number;
  stock: number;
}

export interface ClientExtraPurchase {
  id: string;
  gymId: string;
  clientId: string;
  clientName: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  total: number;
  date: string;
  isPaid: boolean; // Si no está pagado, suma al control de deuda
}

export interface GymTip {
  id: string;
  gymId: string;
  title: string;
  category: "Nutrición" | "Técnica" | "Motivación" | "Descanso" | "Seguridad";
  content: string;
  author: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "deepseek" | "system";
  text: string;
  thought?: string;
  timestamp: string;
  actionPayload?: {
    type: "routine_view" | "mark_complete" | "debt_view" | "muscle_select";
    routineId?: string;
    day?: string;
  };
}
