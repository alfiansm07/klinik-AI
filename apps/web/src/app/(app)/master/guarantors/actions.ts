"use server";

import { db } from "@klinik-AI/db";
import { guarantor } from "@klinik-AI/db/schema/master";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";

import {
  COMPANY_GUARANTOR_TYPE,
  getGuarantorCategory,
  isInsuranceGuarantorType,
  type GuarantorCategory,
  type GuarantorType,
  type InsuranceGuarantorType,
} from "./guarantor-shared";

export type GuarantorRow = {
  id: string;
  code: string;
  name: string;
  type: GuarantorType;
  category: GuarantorCategory;
  bpjsBridging: boolean;
  showInsuranceNumber: boolean;
  insuranceNumberRequired: boolean;
  mandiriInhealthBridging: boolean;
  marginSettingEnabled: boolean;
  picName: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GuarantorDetail = GuarantorRow;

export type GuarantorFormData = {
  category: GuarantorCategory;
  name: string;
  insuranceType?: InsuranceGuarantorType;
  bpjsBridging: boolean;
  showInsuranceNumber: boolean;
  insuranceNumberRequired: boolean;
  mandiriInhealthBridging: boolean;
  marginSettingEnabled: boolean;
  picName: string;
  phone: string;
  address: string;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

type ClinicMembership = {
  clinicId: string;
};

function mapGuarantorMutationError(
  err: unknown,
  fallbackMessage: string,
): ActionResult {
  if (!(err instanceof Error)) {
    return { success: false, error: fallbackMessage };
  }

  const message = err.message.toLowerCase();

  if (message.includes("unique")) {
    return { success: false, error: "Kode penjamin sudah digunakan" };
  }

  if (
    message.includes("does not exist") ||
    message.includes("unknown column") ||
    message.includes("column")
  ) {
    return {
      success: false,
      error:
        "Struktur database penjamin belum terbaru. Jalankan migrasi database lalu coba lagi.",
    };
  }

  return { success: false, error: err.message || fallbackMessage };
}

async function getClinicMembership(): Promise<ClinicMembership | null> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;

  if (!membership) {
    return null;
  }

  return { clinicId: membership.clinicId };
}

function trimOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeGuarantorPayload(data: GuarantorFormData) {
  const name = data.name.trim();
  if (!name) {
    return { error: "Nama penjamin wajib diisi" } as const;
  }

  if (data.category === "company") {
    return {
      values: {
        name,
        type: COMPANY_GUARANTOR_TYPE satisfies GuarantorType,
        bpjsBridging: false,
        showInsuranceNumber: false,
        insuranceNumberRequired: false,
        mandiriInhealthBridging: false,
        marginSettingEnabled: false,
        picName: trimOptional(data.picName),
        phone: trimOptional(data.phone),
        address: trimOptional(data.address),
      },
    } as const;
  }

  const insuranceType = data.insuranceType;
  if (!insuranceType || !isInsuranceGuarantorType(insuranceType)) {
    return { error: "Jenis asuransi wajib dipilih" } as const;
  }

  return {
    values: {
      name,
      type: insuranceType,
      bpjsBridging: data.bpjsBridging,
      showInsuranceNumber: data.showInsuranceNumber,
      insuranceNumberRequired: data.insuranceNumberRequired,
      mandiriInhealthBridging: data.mandiriInhealthBridging,
      marginSettingEnabled: data.marginSettingEnabled,
      picName: null,
      phone: null,
      address: null,
    },
  } as const;
}

function mapGuarantorRow(row: {
  id: string;
  code: string;
  name: string;
  type: GuarantorType;
  bpjsBridging: boolean;
  showInsuranceNumber: boolean;
  insuranceNumberRequired: boolean;
  mandiriInhealthBridging: boolean;
  marginSettingEnabled: boolean;
  picName: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): GuarantorRow {
  return {
    ...row,
    category: getGuarantorCategory(row.type),
  };
}

function revalidateGuarantorPaths(id?: string) {
  revalidatePath("/master/guarantors");

  if (id) {
    revalidatePath(`/master/guarantors/${id}`);
  }
}

export async function getGuarantors(): Promise<GuarantorRow[]> {
  const membership = await getClinicMembership();
  if (!membership) return [];

  const rows = await db
    .select({
      id: guarantor.id,
      code: guarantor.code,
      name: guarantor.name,
      type: guarantor.type,
      bpjsBridging: guarantor.bpjsBridging,
      showInsuranceNumber: guarantor.showInsuranceNumber,
      insuranceNumberRequired: guarantor.insuranceNumberRequired,
      mandiriInhealthBridging: guarantor.mandiriInhealthBridging,
      marginSettingEnabled: guarantor.marginSettingEnabled,
      picName: guarantor.picName,
      phone: guarantor.phone,
      address: guarantor.address,
      isActive: guarantor.isActive,
      createdAt: guarantor.createdAt,
      updatedAt: guarantor.updatedAt,
    })
    .from(guarantor)
    .where(eq(guarantor.clinicId, membership.clinicId))
    .orderBy(asc(guarantor.code));

  return rows.map(mapGuarantorRow);
}

export async function getGuarantorDetail(
  id: string,
): Promise<GuarantorDetail | null> {
  const membership = await getClinicMembership();
  if (!membership) return null;

  const row = await db.query.guarantor.findFirst({
    where: and(
      eq(guarantor.id, id),
      eq(guarantor.clinicId, membership.clinicId),
    ),
  });

  if (!row) {
    return null;
  }

  return mapGuarantorRow({
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    bpjsBridging: row.bpjsBridging,
    showInsuranceNumber: row.showInsuranceNumber,
    insuranceNumberRequired: row.insuranceNumberRequired,
    mandiriInhealthBridging: row.mandiriInhealthBridging,
    marginSettingEnabled: row.marginSettingEnabled,
    picName: row.picName,
    phone: row.phone,
    address: row.address,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export async function getNextGuarantorCode(): Promise<string> {
  const membership = await getClinicMembership();
  if (!membership) {
    throw new Error("Tidak ada klinik aktif");
  }

  return generateNextCode(membership.clinicId, "PJN", {
    table: guarantor,
    codeColumn: guarantor.code,
    clinicIdColumn: guarantor.clinicId,
  });
}

export async function createGuarantor(
  data: GuarantorFormData,
): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const normalized = normalizeGuarantorPayload(data);
  if ("error" in normalized) {
    return { success: false, error: normalized.error };
  }

  try {
    const code = await generateNextCode(membership.clinicId, "PJN", {
      table: guarantor,
      codeColumn: guarantor.code,
      clinicIdColumn: guarantor.clinicId,
    });

    await db.insert(guarantor).values({
      clinicId: membership.clinicId,
      code,
      ...normalized.values,
    });

    revalidateGuarantorPaths();
    return { success: true };
  } catch (err) {
    return mapGuarantorMutationError(err, "Gagal menambahkan penjamin");
  }
}

export async function updateGuarantor(
  id: string,
  data: GuarantorFormData,
): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const normalized = normalizeGuarantorPayload(data);
  if ("error" in normalized) {
    return { success: false, error: normalized.error };
  }

  try {
    await db
      .update(guarantor)
      .set(normalized.values)
      .where(
        and(eq(guarantor.id, id), eq(guarantor.clinicId, membership.clinicId)),
      );

    revalidateGuarantorPaths(id);
    return { success: true };
  } catch (err) {
    return mapGuarantorMutationError(err, "Gagal memperbarui penjamin");
  }
}

export async function deleteGuarantor(id: string): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .delete(guarantor)
      .where(
        and(eq(guarantor.id, id), eq(guarantor.clinicId, membership.clinicId)),
      );

    revalidateGuarantorPaths(id);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      if (message.includes("foreign key") || message.includes("violates")) {
        return {
          success: false,
          error: "Penjamin tidak dapat dihapus karena sudah dipakai pada data lain",
        };
      }
    }

    return { success: false, error: "Gagal menghapus penjamin" };
  }
}

export async function toggleGuarantorStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const membership = await getClinicMembership();
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .update(guarantor)
      .set({ isActive })
      .where(
        and(eq(guarantor.id, id), eq(guarantor.clinicId, membership.clinicId)),
      );

    revalidateGuarantorPaths(id);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }

    return { success: false, error: "Gagal mengubah status penjamin" };
  }
}
