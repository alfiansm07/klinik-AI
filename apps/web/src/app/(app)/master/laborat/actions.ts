"use server";

import { db } from "@klinik-AI/db";
import { laboratoryType } from "@klinik-AI/db/schema/master";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";

// ─── Types ────────────────────────────────────────────────────

export type LaboratRow = {
  id: string;
  code: string;
  name: string;
  isClinicalAndWater: boolean;
  isActive: boolean;
};

export type LaboratDetail = {
  id: string;
  code: string;
  name: string;
  isClinicalAndWater: boolean;
  isActive: boolean;
};

export type LaboratFormData = {
  name: string;
  isClinicalAndWater?: boolean;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

// ─── Queries ──────────────────────────────────────────────────

export async function getLaboratList(): Promise<LaboratRow[]> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return [];

  return db
    .select({
      id: laboratoryType.id,
      code: laboratoryType.code,
      name: laboratoryType.name,
      isClinicalAndWater: laboratoryType.isClinicalAndWater,
      isActive: laboratoryType.isActive,
    })
    .from(laboratoryType)
    .where(eq(laboratoryType.clinicId, membership.clinicId))
    .orderBy(asc(laboratoryType.code));
}

export async function getLaboratDetail(
  id: string,
): Promise<LaboratDetail | null> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return null;

  const rows = await db
    .select({
      id: laboratoryType.id,
      code: laboratoryType.code,
      name: laboratoryType.name,
      isClinicalAndWater: laboratoryType.isClinicalAndWater,
      isActive: laboratoryType.isActive,
    })
    .from(laboratoryType)
    .where(
      and(
        eq(laboratoryType.id, id),
        eq(laboratoryType.clinicId, membership.clinicId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

// ─── Mutations ────────────────────────────────────────────────

/** Server action: get the next auto-generated code for Laborat */
export async function getNextLaboratCode(): Promise<string> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return "LAB001";

  return generateNextCode(membership.clinicId, "LAB", {
    table: laboratoryType,
    codeColumn: laboratoryType.code,
    clinicIdColumn: laboratoryType.clinicId,
  });
}

export async function createLaborat(
  data: LaboratFormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    const code = await generateNextCode(
      membership.clinicId,
      "LAB",
      {
        table: laboratoryType,
        codeColumn: laboratoryType.code,
        clinicIdColumn: laboratoryType.clinicId,
      },
    );

    await db.insert(laboratoryType).values({
      clinicId: membership.clinicId,
      code,
      name: data.name.trim(),
      isClinicalAndWater: data.isClinicalAndWater ?? false,
    });

    revalidatePath("/master/laborat");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode laborat sudah digunakan" };
    }
    return { success: false, error: "Gagal menambahkan jenis laboratorium" };
  }
}

export async function updateLaborat(
  id: string,
  data: LaboratFormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    // Code is immutable — auto-generated, not included in update
    await db
      .update(laboratoryType)
      .set({
        name: data.name.trim(),
        isClinicalAndWater: data.isClinicalAndWater ?? false,
      })
      .where(
        and(
          eq(laboratoryType.id, id),
          eq(laboratoryType.clinicId, membership.clinicId),
        ),
      );

    revalidatePath("/master/laborat");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode laborat sudah digunakan" };
    }
    return { success: false, error: "Gagal mengupdate jenis laboratorium" };
  }
}

export async function toggleLaboratStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .update(laboratoryType)
      .set({ isActive })
      .where(
        and(
          eq(laboratoryType.id, id),
          eq(laboratoryType.clinicId, membership.clinicId),
        ),
      );

    revalidatePath("/master/laborat");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Gagal mengubah status jenis laboratorium",
    };
  }
}

export async function deleteLaborat(id: string): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .delete(laboratoryType)
      .where(
        and(
          eq(laboratoryType.id, id),
          eq(laboratoryType.clinicId, membership.clinicId),
        ),
      );

    revalidatePath("/master/laborat");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus jenis laboratorium" };
  }
}
