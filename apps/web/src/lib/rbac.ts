export const APP_ROLES = [
  "superadmin",
  "admin",
  "receptionist",
  "nurse",
  "doctor",
  "pharmacist",
  "cashier",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APP_MODULES = [
  "dashboard",
  "registration",
  "care",
  "master",
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export const MODULE_ROUTE_PREFIXES: Record<AppModule, readonly string[]> = {
  dashboard: ["/dashboard"],
  registration: ["/pendaftaran"],
  care: ["/pelayanan"],
  master: ["/master"],
};

const MODULE_ACCESS: Record<AppRole, readonly AppModule[]> = {
  superadmin: ["dashboard", "registration", "care", "master"],
  admin: ["dashboard", "registration", "care", "master"],
  receptionist: ["dashboard", "registration", "master"],
  nurse: ["dashboard", "care", "master"],
  doctor: ["dashboard", "care", "master"],
  pharmacist: ["dashboard", "master"],
  cashier: ["dashboard", "master"],
};

export function hasAnyRole(role: AppRole, allowedRoles: readonly AppRole[]) {
  return allowedRoles.includes(role);
}

export function canAccessModule(role: AppRole, module: AppModule) {
  return MODULE_ACCESS[role].includes(module);
}

export const hasModuleAccess = canAccessModule;
