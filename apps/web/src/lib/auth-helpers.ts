import "server-only";

import { db } from "@klinik-AI/db";
import { clinic, clinicMember } from "@klinik-AI/db/schema/tenant";
import { and, asc, eq } from "drizzle-orm";
import { cache } from "react";
import { redirect } from "next/navigation";

import { getSafeSession } from "./auth-session.server";
import { canAccessModule, hasAnyRole, type AppModule, type AppRole } from "./rbac";
import { pickActiveMembership } from "./tenant-context";

export class UnauthorizedError extends Error {}

export class ForbiddenError extends Error {}

type Session = NonNullable<Awaited<ReturnType<typeof getSafeSession>>>;

export type AuthContext = {
  session: Session;
  activeMembership: {
    id: string;
    clinicId: string;
    role: AppRole;
    clinicName: string;
  } | null;
};

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const session = await getSafeSession();

  if (!session?.user) {
    return null;
  }

  const memberships = await db
    .select({
      id: clinicMember.id,
      clinicId: clinicMember.clinicId,
      role: clinicMember.role,
      isActive: clinicMember.isActive,
      clinicName: clinic.name,
    })
    .from(clinicMember)
    .innerJoin(clinic, eq(clinicMember.clinicId, clinic.id))
    .where(
      and(
        eq(clinicMember.userId, session.user.id),
        eq(clinicMember.isActive, true),
        eq(clinic.isActive, true),
      ),
    )
    .orderBy(asc(clinicMember.createdAt));

  const activeMembership = pickActiveMembership(memberships);

  return {
    session,
    activeMembership: activeMembership
      ? {
          id: activeMembership.id,
          clinicId: activeMembership.clinicId,
          role: activeMembership.role,
          clinicName: activeMembership.clinicName,
        }
      : null,
  };
});

export async function requireAuth() {
  const context = await getAuthContext();

  if (!context) {
    throw new UnauthorizedError("UNAUTHORIZED");
  }

  return context;
}

export function requireClinicAccess(context: AuthContext) {
  if (!context.activeMembership) {
    throw new ForbiddenError("NO_ACTIVE_CLINIC_MEMBERSHIP");
  }

  return context.activeMembership;
}

export function requireRole(context: AuthContext, allowedRoles: readonly AppRole[]) {
  const membership = requireClinicAccess(context);

  if (!hasAnyRole(membership.role, allowedRoles)) {
    throw new ForbiddenError("FORBIDDEN");
  }

  return context;
}

export function requireModuleAccess(context: AuthContext, module: AppModule) {
  const membership = requireClinicAccess(context);

  if (!canAccessModule(membership.role, module)) {
    throw new ForbiddenError("FORBIDDEN");
  }

  return context;
}

export async function getPageAuthContext(module?: AppModule): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context) {
    redirect("/login");
  }

  if (module) {
    requireModuleAccess(context, module);
  }

  return context;
}
