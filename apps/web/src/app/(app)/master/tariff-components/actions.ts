"use server";

import { db } from "@klinik-AI/db";
import { tariffComponent } from "@klinik-AI/db/schema/master";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";
import {
  getMissingTariffComponentDefinition,
  type TariffComponentFeeKey,
} from "@/lib/tariff-components";

export type TariffComponentRow = {
  id: string;
  code: string;
  name: string;
  feeKey: TariffComponentFeeKey | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TariffComponentDetail = TariffComponentRow;

type TariffComponentFormData = {
  name: string;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

async function getClinicMembership() {
  const context = await getPageAuthContext("master");
  return context.activeMembership;
}

function revalidateTariffComponentPaths(id?: string) {
  revalidatePath("/master/tariff-components");
  revalidatePath("/master/tindakan");

  if (id) {
    revalidatePath(`/master/tariff-components/${id}`);
  }
}

export async function getTariffComponents(): Promise<TariffComponentRow[]> {
  const membership = await getClinicMembership();
  if (!membership) return [];

  return db
    .select({
      id: tariffComponent.id,
      code: tariffComponent.code,
      name: tariffComponent.name,
      feeKey: tariffComponent.feeKey,
      sortOrder: tariffComponent.sortOrder,
      isActive: tariffComponent.isActive,
      createdAt: tariffComponent.createdAt,
      updatedAt: tariffComponent.updatedAt,
    })
    .from(tariffComponent)
    .where(eq(tariffComponent.clinicId, membership.clinicId))
    .orderBy(asc(tariffComponent.sortOrder), asc(tariffComponent.code));
}

export async function getNextTariffComponentCode(): Promise<string> {
  const membership = await getClinicMembership();
  if (!membership) {
    return "001";
  }

  return generateNextCode(membership.clinicId, "", {
    table: tariffComponent,
    codeColumn: tariffComponent.code,
    clinicIdColumn: tariffComponent.clinicId,
  });
}

export async function getTariffComponentDetail(
  id: string,
): Promise<TariffComponentDetail | null> {
  const membership = await getClinicMembership();
  if (!membership) return null;

  const detail = await db.query.tariffComponent.findFirst({
    columns: {
      id: true,
      code: true,
      name: true,
      feeKey: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    where: and(
      eq(tariffComponent.id, id),
      eq(tariffComponent.clinicId, membership.clinicId),
    ),
  });

  return detail ?? null;
}

export async function createTariffComponent(
  data: TariffComponentFormData,
): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) {
    return { success: false, error: "Tidak ada klinik aktif" };
  }

  const name = data.name.trim();
  if (!name) {
    return { success: false, error: "Nama komponen tarif wajib diisi" };
  }

  const existing = await db
    .select({
      feeKey: tariffComponent.feeKey,
      sortOrder: tariffComponent.sortOrder,
    })
    .from(tariffComponent)
    .where(eq(tariffComponent.clinicId, membership.clinicId));

  const nextDefinition = getMissingTariffComponentDefinition(
    existing
      .map((item) => item.feeKey)
      .filter((feeKey): feeKey is TariffComponentFeeKey => feeKey !== null),
  );

  try {
    const nextCode = await generateNextCode(membership.clinicId, "", {
      table: tariffComponent,
      codeColumn: tariffComponent.code,
      clinicIdColumn: tariffComponent.clinicId,
    });
    const nextSortOrder =
      existing.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;

    await db.insert(tariffComponent).values({
      clinicId: membership.clinicId,
      code: nextDefinition?.code ?? nextCode,
      name,
      feeKey: nextDefinition?.feeKey ?? null,
      sortOrder: nextDefinition?.sortOrder ?? nextSortOrder,
    });

    revalidateTariffComponentPaths();
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.toLowerCase().includes("unique")) {
      return {
        success: false,
        error: "Kode atau slot komponen tarif ini sudah ada untuk klinik aktif",
      };
    }

    return { success: false, error: "Gagal menambahkan komponen tarif" };
  }
}

export async function updateTariffComponent(
  id: string,
  data: TariffComponentFormData,
): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) {
    return { success: false, error: "Tidak ada klinik aktif" };
  }

  const name = data.name.trim();
  if (!name) {
    return { success: false, error: "Nama komponen tarif wajib diisi" };
  }

  try {
    await db
      .update(tariffComponent)
      .set({ name })
      .where(
        and(
          eq(tariffComponent.id, id),
          eq(tariffComponent.clinicId, membership.clinicId),
        ),
      );

    revalidateTariffComponentPaths(id);
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui komponen tarif" };
  }
}

export async function toggleTariffComponentStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) {
    return { success: false, error: "Tidak ada klinik aktif" };
  }

  try {
    await db
      .update(tariffComponent)
      .set({ isActive })
      .where(
        and(
          eq(tariffComponent.id, id),
          eq(tariffComponent.clinicId, membership.clinicId),
        ),
      );

    revalidateTariffComponentPaths(id);
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengubah status komponen tarif" };
  }
}

export async function deleteTariffComponent(id: string): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) {
    return { success: false, error: "Tidak ada klinik aktif" };
  }

  try {
    await db
      .delete(tariffComponent)
      .where(
        and(
          eq(tariffComponent.id, id),
          eq(tariffComponent.clinicId, membership.clinicId),
        ),
      );

    revalidateTariffComponentPaths(id);
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus komponen tarif" };
  }
}
