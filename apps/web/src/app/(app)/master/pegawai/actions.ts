"use server";

import { db } from "@klinik-AI/db";
import { employee, employeeLicense } from "@klinik-AI/db/schema/master";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";

import {
  getPegawaiSchemaActionError,
  normalizeLicenseRows,
  withPegawaiSchemaFallback,
  type PegawaiFormValues,
} from "./pegawai-shared";
import { assertPegawaiSchemaReady } from "./pegawai-schema.server";

export type PegawaiRow = {
  id: string;
  code: string;
  fullName: string;
  position: string;
  nik: string | null;
  nip: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
};

export type PegawaiLicenseDetail = {
  id: string;
  licenseType: string;
  licenseNumber: string;
  issuedDate: Date | null;
  validUntil: Date | null;
  isLifetime: boolean;
  notes: string | null;
  sortOrder: number;
};

export type PegawaiDetail = PegawaiRow & {
  titlePrefix: string | null;
  titleSuffix: string | null;
  gender: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  religion: string | null;
  maritalStatus: string | null;
  address: string | null;
  workplaceName: string;
  parentInstitutionName: string | null;
  externalReference: string | null;
  licenses: PegawaiLicenseDetail[];
};

type ActionResult = {
  success: boolean;
  error?: string;
};

function trimOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizePegawaiPayload(data: PegawaiFormValues) {
  const fullName = data.fullName.trim();
  const workplaceName = data.workplaceName.trim();

  if (!fullName) {
    return { error: "Nama lengkap wajib diisi" } as const;
  }

  if (!data.position) {
    return { error: "Jabatan wajib dipilih" } as const;
  }

  if (!workplaceName) {
    return { error: "Nama tempat bekerja sekarang wajib diisi" } as const;
  }

  const normalizedLicenses = normalizeLicenseRows(
    data.licenses.map((license) => ({
      id: license.id,
      licenseType: license.licenseType,
      licenseNumber: license.licenseNumber,
      issuedDate: parseDate(license.issuedDate),
      validUntil: parseDate(license.validUntil),
      isLifetime: license.isLifetime,
      notes: license.notes,
    })),
  );

  const invalidLicense = normalizedLicenses.find(
    (license) => !license.licenseType || !license.licenseNumber,
  );

  if (invalidLicense) {
    return { error: "Jenis izin dan nomor izin wajib diisi pada baris izin yang digunakan" } as const;
  }

  const invalidLifetime = normalizedLicenses.find(
    (license) => (license.isLifetime && license.validUntil !== null) || (!license.isLifetime && license.validUntil === null),
  );

  if (invalidLifetime) {
    return { error: "Tanggal berlaku izin harus sesuai dengan status seumur hidup" } as const;
  }

  return {
    values: {
      fullName,
      titlePrefix: trimOptional(data.titlePrefix),
      titleSuffix: trimOptional(data.titleSuffix),
      nik: trimOptional(data.nik),
      nip: trimOptional(data.nip),
      gender: data.gender || null,
      birthPlace: trimOptional(data.birthPlace),
      birthDate: parseDate(data.birthDate),
      religion: data.religion || null,
      maritalStatus: data.maritalStatus || null,
      address: trimOptional(data.address),
      email: trimOptional(data.email),
      phone: trimOptional(data.phone),
      position: data.position,
      workplaceName,
      parentInstitutionName: trimOptional(data.parentInstitutionName),
      externalReference: trimOptional(data.externalReference),
      isActive: data.isActive,
      licenses: normalizedLicenses,
    },
  } as const;
}

export async function getPegawaiList(): Promise<PegawaiRow[]> {
  await assertPegawaiSchemaReady();

  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return [];

  return db
    .select({
      id: employee.id,
      code: employee.code,
      fullName: employee.fullName,
      position: employee.position,
      nik: employee.nik,
      nip: employee.nip,
      phone: employee.phone,
      email: employee.email,
      isActive: employee.isActive,
    })
    .from(employee)
    .where(eq(employee.clinicId, membership.clinicId))
    .orderBy(asc(employee.code));
}

export async function getPegawaiDetail(id: string): Promise<PegawaiDetail | null> {
  await assertPegawaiSchemaReady();

  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return null;

  const detailRows = await db
    .select({
      id: employee.id,
      code: employee.code,
      fullName: employee.fullName,
      position: employee.position,
      nik: employee.nik,
      nip: employee.nip,
      phone: employee.phone,
      email: employee.email,
      isActive: employee.isActive,
      titlePrefix: employee.titlePrefix,
      titleSuffix: employee.titleSuffix,
      gender: employee.gender,
      birthPlace: employee.birthPlace,
      birthDate: employee.birthDate,
      religion: employee.religion,
      maritalStatus: employee.maritalStatus,
      address: employee.address,
      workplaceName: employee.workplaceName,
      parentInstitutionName: employee.parentInstitutionName,
      externalReference: employee.externalReference,
    })
    .from(employee)
    .where(and(eq(employee.id, id), eq(employee.clinicId, membership.clinicId)))
    .limit(1);

  const detail = detailRows[0];
  if (!detail) return null;

  const licenses = await db
    .select({
      id: employeeLicense.id,
      licenseType: employeeLicense.licenseType,
      licenseNumber: employeeLicense.licenseNumber,
      issuedDate: employeeLicense.issuedDate,
      validUntil: employeeLicense.validUntil,
      isLifetime: employeeLicense.isLifetime,
      notes: employeeLicense.notes,
      sortOrder: employeeLicense.sortOrder,
    })
    .from(employeeLicense)
    .where(and(eq(employeeLicense.employeeId, id), eq(employeeLicense.clinicId, membership.clinicId)))
    .orderBy(asc(employeeLicense.sortOrder));

  return { ...detail, licenses };
}

export async function getNextPegawaiCode(): Promise<string> {
  return withPegawaiSchemaFallback(async () => {
    await assertPegawaiSchemaReady();
  }, async () => {
    const context = await getPageAuthContext("master");
    const membership = context.activeMembership;
    if (!membership) return "PGW001";

    return generateNextCode(membership.clinicId, "PGW", {
      table: employee,
      codeColumn: employee.code,
      clinicIdColumn: employee.clinicId,
    });
  }, "PGW001");
}

export async function createPegawai(data: PegawaiFormValues): Promise<ActionResult> {
  return withPegawaiSchemaFallback(async () => {
    await assertPegawaiSchemaReady();
  }, async () => {
    const context = await getPageAuthContext("master");
    const membership = context.activeMembership;
    if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

    const normalized = normalizePegawaiPayload(data);
    if ("error" in normalized) return { success: false, error: normalized.error };

    try {
      const code = await generateNextCode(membership.clinicId, "PGW", {
        table: employee,
        codeColumn: employee.code,
        clinicIdColumn: employee.clinicId,
      });

      await db.transaction(async (tx) => {
        const inserted = await tx
          .insert(employee)
          .values({
            clinicId: membership.clinicId,
            code,
            ...normalized.values,
            licenses: undefined,
          } as never)
          .returning({ id: employee.id });

        const employeeId = inserted[0]?.id;
        if (!employeeId) {
          throw new Error("Gagal membuat data pegawai");
        }

        if (normalized.values.licenses.length > 0) {
          await tx.insert(employeeLicense).values(
            normalized.values.licenses.map((license, index) => ({
              clinicId: membership.clinicId,
              employeeId,
              licenseType: license.licenseType as never,
              licenseNumber: license.licenseNumber,
              issuedDate: license.issuedDate,
              validUntil: license.validUntil,
              isLifetime: license.isLifetime,
              notes: license.notes,
              sortOrder: index + 1,
            })),
          );
        }
      });

      revalidatePath("/master/pegawai");
      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("unique")) {
        return { success: false, error: "Kode pegawai sudah digunakan" };
      }

      return { success: false, error: "Gagal menambahkan pegawai" };
    }
  }, { success: false, error: getPegawaiSchemaActionError() });
}

export async function updatePegawai(id: string, data: PegawaiFormValues): Promise<ActionResult> {
  return withPegawaiSchemaFallback(async () => {
    await assertPegawaiSchemaReady();
  }, async () => {
    const context = await getPageAuthContext("master");
    const membership = context.activeMembership;
    if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

    const normalized = normalizePegawaiPayload(data);
    if ("error" in normalized) return { success: false, error: normalized.error };

    try {
      await db.transaction(async (tx) => {
        const existing = await tx
          .select({ id: employee.id })
          .from(employee)
          .where(and(eq(employee.id, id), eq(employee.clinicId, membership.clinicId)))
          .limit(1);

        if (!existing[0]) {
          throw new Error("Data pegawai tidak ditemukan");
        }

        await tx
          .update(employee)
          .set({
            fullName: normalized.values.fullName,
            titlePrefix: normalized.values.titlePrefix,
            titleSuffix: normalized.values.titleSuffix,
            nik: normalized.values.nik,
            nip: normalized.values.nip,
            gender: normalized.values.gender as never,
            birthPlace: normalized.values.birthPlace,
            birthDate: normalized.values.birthDate,
            religion: normalized.values.religion as never,
            maritalStatus: normalized.values.maritalStatus as never,
            address: normalized.values.address,
            email: normalized.values.email,
            phone: normalized.values.phone,
            position: normalized.values.position,
            workplaceName: normalized.values.workplaceName,
            parentInstitutionName: normalized.values.parentInstitutionName,
            externalReference: normalized.values.externalReference,
            isActive: normalized.values.isActive,
          })
          .where(and(eq(employee.id, id), eq(employee.clinicId, membership.clinicId)));

        await tx
          .delete(employeeLicense)
          .where(and(eq(employeeLicense.employeeId, id), eq(employeeLicense.clinicId, membership.clinicId)));

        if (normalized.values.licenses.length > 0) {
          await tx.insert(employeeLicense).values(
            normalized.values.licenses.map((license, index) => ({
              clinicId: membership.clinicId,
              employeeId: id,
              licenseType: license.licenseType as never,
              licenseNumber: license.licenseNumber,
              issuedDate: license.issuedDate,
              validUntil: license.validUntil,
              isLifetime: license.isLifetime,
              notes: license.notes,
              sortOrder: index + 1,
            })),
          );
        }
      });

      revalidatePath("/master/pegawai");
      revalidatePath(`/master/pegawai/${id}`);
      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message === "Data pegawai tidak ditemukan") {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Gagal memperbarui pegawai" };
    }
  }, { success: false, error: getPegawaiSchemaActionError() });
}

export async function deletePegawai(id: string): Promise<ActionResult> {
  return withPegawaiSchemaFallback(async () => {
    await assertPegawaiSchemaReady();
  }, async () => {
    const context = await getPageAuthContext("master");
    const membership = context.activeMembership;
    if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

    try {
      await db
        .delete(employee)
        .where(and(eq(employee.id, id), eq(employee.clinicId, membership.clinicId)));

      revalidatePath("/master/pegawai");
      return { success: true };
    } catch {
      return { success: false, error: "Gagal menghapus pegawai" };
    }
  }, { success: false, error: getPegawaiSchemaActionError() });
}
