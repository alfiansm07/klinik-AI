"use server";

import { db } from "@klinik-AI/db";
import { room } from "@klinik-AI/db/schema/master";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";

import type { RoomInstallation, RoomVisitType } from "./constants";

export type RuanganRow = {
  id: string;
  code: string;
  name: string;
  visitType: RoomVisitType;
  installation: RoomInstallation | null;
  pcarePoli: string | null;
  isCallRoom: boolean;
  isCallApotek: boolean;
  isCallLab: boolean;
  isActive: boolean;
};

export type RuanganDetail = RuanganRow & {
  voiceCode: string | null;
};

export type RuanganFormData = {
  name: string;
  visitType: RoomVisitType;
  installation?: RoomInstallation | null;
  pcarePoli?: string | null;
  voiceCode?: string | null;
  isCallRoom?: boolean;
  isCallApotek?: boolean;
  isCallLab?: boolean;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function getRuanganList(): Promise<RuanganRow[]> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return [];

  return db
    .select({
      id: room.id,
      code: room.code,
      name: room.name,
      visitType: room.visitType,
      installation: room.installation,
      pcarePoli: room.pcarePoli,
      isCallRoom: room.isCallRoom,
      isCallApotek: room.isCallApotek,
      isCallLab: room.isCallLab,
      isActive: room.isActive,
    })
    .from(room)
    .where(eq(room.clinicId, membership.clinicId))
    .orderBy(asc(room.code));
}

export async function getRuanganDetail(id: string): Promise<RuanganDetail | null> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return null;

  const rows = await db
    .select({
      id: room.id,
      code: room.code,
      name: room.name,
      visitType: room.visitType,
      installation: room.installation,
      pcarePoli: room.pcarePoli,
      voiceCode: room.voiceCode,
      isCallRoom: room.isCallRoom,
      isCallApotek: room.isCallApotek,
      isCallLab: room.isCallLab,
      isActive: room.isActive,
    })
    .from(room)
    .where(and(eq(room.id, id), eq(room.clinicId, membership.clinicId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getNextRuanganCode(): Promise<string> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return "RNG001";

  return generateNextCode(membership.clinicId, "RNG", {
    table: room,
    codeColumn: room.code,
    clinicIdColumn: room.clinicId,
  });
}

export async function createRuangan(data: RuanganFormData): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const name = data.name.trim();
  if (!name) return { success: false, error: "Nama ruangan wajib diisi" };

  try {
    const code = await generateNextCode(membership.clinicId, "RNG", {
      table: room,
      codeColumn: room.code,
      clinicIdColumn: room.clinicId,
    });

    await db.insert(room).values({
      clinicId: membership.clinicId,
      code,
      name,
      visitType: data.visitType,
      installation: data.installation ?? null,
      pcarePoli: data.pcarePoli?.trim() || null,
      voiceCode: data.voiceCode?.trim() || null,
      isCallRoom: data.isCallRoom ?? false,
      isCallApotek: data.isCallApotek ?? false,
      isCallLab: data.isCallLab ?? false,
    });

    revalidatePath("/master/ruangan");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode ruangan sudah digunakan" };
    }
    return { success: false, error: "Gagal menambahkan ruangan" };
  }
}

export async function updateRuangan(
  id: string,
  data: RuanganFormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const name = data.name.trim();
  if (!name) return { success: false, error: "Nama ruangan wajib diisi" };

  try {
    await db
      .update(room)
      .set({
        name,
        visitType: data.visitType,
        installation: data.installation ?? null,
        pcarePoli: data.pcarePoli?.trim() || null,
        voiceCode: data.voiceCode?.trim() || null,
        isCallRoom: data.isCallRoom ?? false,
        isCallApotek: data.isCallApotek ?? false,
        isCallLab: data.isCallLab ?? false,
      })
      .where(and(eq(room.id, id), eq(room.clinicId, membership.clinicId)));

    revalidatePath("/master/ruangan");
    revalidatePath(`/master/ruangan/${id}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode ruangan sudah digunakan" };
    }
    return { success: false, error: "Gagal memperbarui ruangan" };
  }
}

export async function toggleRuanganStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .update(room)
      .set({ isActive })
      .where(and(eq(room.id, id), eq(room.clinicId, membership.clinicId)));

    revalidatePath("/master/ruangan");
    revalidatePath(`/master/ruangan/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengubah status ruangan" };
  }
}

export async function deleteRuangan(id: string): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .delete(room)
      .where(and(eq(room.id, id), eq(room.clinicId, membership.clinicId)));

    revalidatePath("/master/ruangan");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus ruangan" };
  }
}
