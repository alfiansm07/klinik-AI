import type { AppRole } from "./rbac";

export type ClinicMembership = {
  id: string;
  clinicId: string;
  role: AppRole;
  isActive: boolean;
};

export function pickActiveMembership<T extends ClinicMembership>(memberships: readonly T[]) {
  return memberships.find((membership) => membership.isActive) ?? null;
}
