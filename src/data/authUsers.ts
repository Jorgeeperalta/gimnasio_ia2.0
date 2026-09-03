import { UserAccount } from "../types";

export const SYSTEM_USERS: UserAccount[] = [
  {
    id: "usr-superadmin",
    username: "jorge50",
    password: "Afm123",
    name: "Jorge",
    role: "super_admin",
    email: "jorge50@gymcore.saas",
  },
  {
    id: "usr-admin-titan",
    username: "admin_titan",
    password: "GymTitan123",
    name: "Carlos Mendoza (Admin)",
    role: "gym_admin",
    email: "admin@titanfitness.com",
    gymId: "gym-1",
  },
  {
    id: "usr-admin-ironfit",
    username: "admin_ironfit",
    password: "IronFit123",
    name: "Laura Restrepo (Admin)",
    role: "gym_admin",
    email: "admin@ironfitelite.com",
    gymId: "gym-2",
  },
  {
    id: "usr-client-carlos",
    username: "atleta_carlos",
    password: "Atleta123",
    name: "Carlos Méndez",
    role: "client",
    email: "carlos.m@gmail.com",
    gymId: "gym-1",
    clientId: "client-1",
  },
  {
    id: "usr-client-sofia",
    username: "atleta_sofia",
    password: "Sofia123",
    name: "Sofía Valenzuela",
    role: "client",
    email: "sofia.fit@hotmail.com",
    gymId: "gym-1",
    clientId: "client-2",
  },
];

export function authenticateUser(username: string, password: string, customList?: UserAccount[]): UserAccount | null {
  const cleanUsername = username.trim().toLowerCase();
  const list = customList && customList.length > 0 ? customList : SYSTEM_USERS;
  const found = list.find(
    (u) => u.username.toLowerCase() === cleanUsername && u.password === password
  );
  return found || null;
}
