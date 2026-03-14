"use server";

import { db } from "@klinik-AI/db";
import {
  medicalAction,
  actionTariff,
  medicalActionMedicine,
  guarantor,
  medicine,
  medicineUnit,
  tariffComponent,
} from "@klinik-AI/db/schema/master";
import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";
import { mergeTariffComponents } from "@/lib/tariff-components";

// ─── Types ────────────────────────────────────────────────────

import type { ActionCategory } from "./constants";

export type TindakanRow = {
  id: string;
  code: string;
  name: string;
  actionCategory: ActionCategory | null;
  icd9Code: string | null;
  totalFee: number | null;
  actionType: "regular" | "tindakan" | "radiologi" | "laboratorium";
  isActive: boolean;
};

export type TindakanDetail = {
  id: string;
  code: string;
  name: string;
  actionCategory: ActionCategory | null;
  icd9Code: string | null;
  actionType: "regular" | "tindakan" | "radiologi" | "laboratorium";
  isActive: boolean;
  // Tariff (default guarantor)
  tariffId: string | null;
  doctorFee: number;
  clinicFee: number;
  otherFee: number;
  midwifeFee: number;
  nurseFee: number;
  totalFee: number;
  // Obat & Alkes
  medicines: TindakanMedicineItem[];
};

export type TindakanMedicineItem = {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineCode: string;
  medicineUnitId: string | null;
  medicineUnitName: string | null;
  quantity: number;
};

export type TindakanFormData = {
  code?: string;
  name: string;
  actionCategory?: ActionCategory | null;
  icd9Code?: string | null;
  actionType: "regular" | "tindakan" | "radiologi" | "laboratorium";
  // Tariff fees
  doctorFee?: number;
  clinicFee?: number;
  otherFee?: number;
  midwifeFee?: number;
  nurseFee?: number;
  totalFee?: number;
  // Medicines
  medicines?: {
    medicineId: string;
    medicineUnitId?: string | null;
    quantity: number;
  }[];
};

/** Lookup option for select dropdowns */
export type LookupOption = {
  id: string;
  code: string;
  name: string;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

function normaliseTindakanData(data: TindakanFormData):
  | { success: true; value: TindakanFormData }
  | { success: false; error: string } {
  const name = data.name.trim();
  if (!name) {
    return { success: false, error: "Nama tindakan wajib diisi" };
  }

  const medicines = data.medicines ?? [];
  const medicineIds = new Set<string>();

  for (const medicineItem of medicines) {
    if (!medicineItem.medicineId) {
      return { success: false, error: "Obat yang dipilih tidak valid" };
    }

    if (!Number.isInteger(medicineItem.quantity) || medicineItem.quantity <= 0) {
      return { success: false, error: "Jumlah obat harus lebih dari 0" };
    }

    if (medicineIds.has(medicineItem.medicineId)) {
      return {
        success: false,
        error: "Obat yang sama tidak boleh dipilih lebih dari sekali",
      };
    }

    medicineIds.add(medicineItem.medicineId);
  }

  return {
    success: true,
    value: {
      ...data,
      name,
      icd9Code: data.icd9Code?.trim() || null,
      medicines: medicines.map((medicineItem) => ({
        medicineId: medicineItem.medicineId,
        medicineUnitId: medicineItem.medicineUnitId || null,
        quantity: medicineItem.quantity,
      })),
    },
  };
}

// ─── Queries ──────────────────────────────────────────────────

export async function getTindakanList(): Promise<TindakanRow[]> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return [];

  // Get the default guarantor (type = 'pribadi') for fee display
  const defaultGuarantors = await db
    .select({ id: guarantor.id })
    .from(guarantor)
    .where(
      and(
        eq(guarantor.clinicId, membership.clinicId),
        eq(guarantor.type, "pribadi"),
      ),
    )
    .limit(1);

  const defaultGuarantorId = defaultGuarantors[0]?.id;

  const rows = await db
    .select({
      id: medicalAction.id,
      code: medicalAction.code,
      name: medicalAction.name,
      actionCategory: medicalAction.actionCategory,
      icd9Code: medicalAction.icd9Code,
      totalFee: actionTariff.totalFee,
      actionType: medicalAction.actionType,
      isActive: medicalAction.isActive,
    })
    .from(medicalAction)
    .leftJoin(
      actionTariff,
      and(
        eq(actionTariff.medicalActionId, medicalAction.id),
        defaultGuarantorId
          ? eq(actionTariff.guarantorId, defaultGuarantorId)
          : sql`false`,
      ),
    )
    .where(eq(medicalAction.clinicId, membership.clinicId))
    .orderBy(asc(medicalAction.code));

  return rows;
}

export async function getTindakanDetail(
  id: string,
): Promise<TindakanDetail | null> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return null;

  // Get the main record
  const rows = await db
    .select({
      id: medicalAction.id,
      code: medicalAction.code,
      name: medicalAction.name,
      actionCategory: medicalAction.actionCategory,
      icd9Code: medicalAction.icd9Code,
      actionType: medicalAction.actionType,
      isActive: medicalAction.isActive,
    })
    .from(medicalAction)
    .where(
      and(
        eq(medicalAction.id, id),
        eq(medicalAction.clinicId, membership.clinicId),
      ),
    )
    .limit(1);

  const record = rows[0];
  if (!record) return null;

  // Get default guarantor tariff
  const defaultGuarantors = await db
    .select({ id: guarantor.id })
    .from(guarantor)
    .where(
      and(
        eq(guarantor.clinicId, membership.clinicId),
        eq(guarantor.type, "pribadi"),
      ),
    )
    .limit(1);

  const defaultGuarantorId = defaultGuarantors[0]?.id;

  let tariffData = {
    tariffId: null as string | null,
    doctorFee: 0,
    clinicFee: 0,
    otherFee: 0,
    midwifeFee: 0,
    nurseFee: 0,
    totalFee: 0,
  };

  if (defaultGuarantorId) {
    const tariffs = await db
      .select({
        id: actionTariff.id,
        doctorFee: actionTariff.doctorFee,
        clinicFee: actionTariff.clinicFee,
        otherFee: actionTariff.otherFee,
        midwifeFee: actionTariff.midwifeFee,
        nurseFee: actionTariff.nurseFee,
        totalFee: actionTariff.totalFee,
      })
      .from(actionTariff)
      .where(
        and(
          eq(actionTariff.medicalActionId, id),
          eq(actionTariff.guarantorId, defaultGuarantorId),
          eq(actionTariff.clinicId, membership.clinicId),
        ),
      )
      .limit(1);

    if (tariffs[0]) {
      tariffData = {
        tariffId: tariffs[0].id,
        doctorFee: tariffs[0].doctorFee,
        clinicFee: tariffs[0].clinicFee,
        otherFee: tariffs[0].otherFee,
        midwifeFee: tariffs[0].midwifeFee,
        nurseFee: tariffs[0].nurseFee,
        totalFee: tariffs[0].totalFee,
      };
    }
  }

  // Get associated medicines
  const meds = await db
    .select({
      id: medicalActionMedicine.id,
      medicineId: medicalActionMedicine.medicineId,
      medicineName: medicine.name,
      medicineCode: medicine.code,
      medicineUnitId: medicalActionMedicine.medicineUnitId,
      medicineUnitName: medicineUnit.name,
      quantity: medicalActionMedicine.quantity,
    })
    .from(medicalActionMedicine)
    .innerJoin(medicine, eq(medicalActionMedicine.medicineId, medicine.id))
    .leftJoin(
      medicineUnit,
      eq(medicalActionMedicine.medicineUnitId, medicineUnit.id),
    )
    .where(
      and(
        eq(medicalActionMedicine.medicalActionId, id),
        eq(medicalActionMedicine.clinicId, membership.clinicId),
      ),
    )
    .orderBy(asc(medicine.name));

  return {
    ...record,
    ...tariffData,
    medicines: meds,
  };
}

// ─── Lookups ──────────────────────────────────────────────────

export async function getTindakanLookups() {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) {
    return {
      medicines: [],
      medicineUnits: [],
      tariffComponents: mergeTariffComponents([]),
    };
  }

  const clinicId = membership.clinicId;

  const [medicines_, medicineUnits, tariffComponents] = await Promise.all([
    db
      .select({
        id: medicine.id,
        code: medicine.code,
        name: medicine.name,
      })
      .from(medicine)
      .where(
        and(eq(medicine.clinicId, clinicId), eq(medicine.isActive, true)),
      )
      .orderBy(asc(medicine.name)),
    db
      .select({
        id: medicineUnit.id,
        code: medicineUnit.code,
        name: medicineUnit.name,
      })
      .from(medicineUnit)
      .where(
        and(
          eq(medicineUnit.clinicId, clinicId),
          eq(medicineUnit.isActive, true),
        ),
      )
      .orderBy(asc(medicineUnit.name)),
    db
      .select({
        feeKey: tariffComponent.feeKey,
        code: tariffComponent.code,
        name: tariffComponent.name,
        sortOrder: tariffComponent.sortOrder,
        isActive: tariffComponent.isActive,
      })
      .from(tariffComponent)
      .where(eq(tariffComponent.clinicId, clinicId))
      .orderBy(asc(tariffComponent.sortOrder), asc(tariffComponent.code)),
  ]);

  const mappedTariffComponents = tariffComponents.filter(
    (component): component is typeof component & {
      feeKey: NonNullable<typeof component.feeKey>;
    } => component.feeKey !== null,
  );

  return {
    medicines: medicines_,
    medicineUnits,
    tariffComponents: mergeTariffComponents(mappedTariffComponents),
  };
}

// ─── Mutations ────────────────────────────────────────────────

/** Server action: get the next auto-generated code for Tindakan */
export async function getNextTindakanCode(): Promise<string> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return "TND001";

  return generateNextCode(membership.clinicId, "TND", {
    table: medicalAction,
    codeColumn: medicalAction.code,
    clinicIdColumn: medicalAction.clinicId,
  });
}

export async function createTindakan(
  data: TindakanFormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const clinicId = membership.clinicId;
  const normalised = normaliseTindakanData(data);
  if (!normalised.success) return normalised;
  const validatedData = normalised.value;

  try {
    // Get default guarantor
    const defaultGuarantors = await db
      .select({ id: guarantor.id })
      .from(guarantor)
      .where(
        and(
          eq(guarantor.clinicId, clinicId),
          eq(guarantor.type, "pribadi"),
        ),
      )
      .limit(1);

    const defaultGuarantorId = defaultGuarantors[0]?.id;

    await db.transaction(async (tx) => {
      // Auto-generate the next code
      const code = await generateNextCode(clinicId, "TND", {
        table: medicalAction,
        codeColumn: medicalAction.code,
        clinicIdColumn: medicalAction.clinicId,
      });

      // Insert medical action
      const [action] = await tx
        .insert(medicalAction)
        .values({
          clinicId,
          code,
          name: validatedData.name,
          actionCategory: validatedData.actionCategory || null,
          icd9Code: validatedData.icd9Code,
          actionType: validatedData.actionType,
        })
        .returning({ id: medicalAction.id });

      if (!action) throw new Error("Failed to insert action");

      // Insert tariff for default guarantor
      if (defaultGuarantorId) {
        await tx.insert(actionTariff).values({
          clinicId,
          medicalActionId: action.id,
          guarantorId: defaultGuarantorId,
          doctorFee: validatedData.doctorFee ?? 0,
          clinicFee: validatedData.clinicFee ?? 0,
          otherFee: validatedData.otherFee ?? 0,
          midwifeFee: validatedData.midwifeFee ?? 0,
          nurseFee: validatedData.nurseFee ?? 0,
          totalFee: validatedData.totalFee ?? 0,
        });
      }

      // Insert medicines
      if (validatedData.medicines && validatedData.medicines.length > 0) {
        await tx.insert(medicalActionMedicine).values(
          validatedData.medicines.map((med) => ({
            clinicId,
            medicalActionId: action.id,
            medicineId: med.medicineId,
            medicineUnitId: med.medicineUnitId || null,
            quantity: med.quantity,
          })),
        );
      }
    });

    revalidatePath("/master/tindakan");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode tindakan sudah digunakan" };
    }
    return { success: false, error: "Gagal menambahkan tindakan" };
  }
}

export async function updateTindakan(
  id: string,
  data: TindakanFormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const clinicId = membership.clinicId;
  const normalised = normaliseTindakanData(data);
  if (!normalised.success) return normalised;
  const validatedData = normalised.value;

  try {
    // Get default guarantor
    const defaultGuarantors = await db
      .select({ id: guarantor.id })
      .from(guarantor)
      .where(
        and(
          eq(guarantor.clinicId, clinicId),
          eq(guarantor.type, "pribadi"),
        ),
      )
      .limit(1);

    const defaultGuarantorId = defaultGuarantors[0]?.id;

    await db.transaction(async (tx) => {
      // Update medical action (code is immutable — auto-generated)
      await tx
        .update(medicalAction)
        .set({
          name: validatedData.name,
          actionCategory: validatedData.actionCategory || null,
          icd9Code: validatedData.icd9Code,
          actionType: validatedData.actionType,
        })
        .where(
          and(eq(medicalAction.id, id), eq(medicalAction.clinicId, clinicId)),
        );

      // Upsert tariff for default guarantor
      if (defaultGuarantorId) {
        const existingTariff = await tx
          .select({ id: actionTariff.id })
          .from(actionTariff)
          .where(
            and(
              eq(actionTariff.medicalActionId, id),
              eq(actionTariff.guarantorId, defaultGuarantorId),
              eq(actionTariff.clinicId, clinicId),
            ),
          )
          .limit(1);

        if (existingTariff[0]) {
          await tx
            .update(actionTariff)
            .set({
              doctorFee: validatedData.doctorFee ?? 0,
              clinicFee: validatedData.clinicFee ?? 0,
              otherFee: validatedData.otherFee ?? 0,
              midwifeFee: validatedData.midwifeFee ?? 0,
              nurseFee: validatedData.nurseFee ?? 0,
              totalFee: validatedData.totalFee ?? 0,
            })
            .where(eq(actionTariff.id, existingTariff[0].id));
        } else {
          await tx.insert(actionTariff).values({
            clinicId,
            medicalActionId: id,
            guarantorId: defaultGuarantorId,
            doctorFee: validatedData.doctorFee ?? 0,
            clinicFee: validatedData.clinicFee ?? 0,
            otherFee: validatedData.otherFee ?? 0,
            midwifeFee: validatedData.midwifeFee ?? 0,
            nurseFee: validatedData.nurseFee ?? 0,
            totalFee: validatedData.totalFee ?? 0,
          });
        }
      }

      // Replace medicines: delete all, then insert new
      await tx
        .delete(medicalActionMedicine)
        .where(
          and(
            eq(medicalActionMedicine.medicalActionId, id),
            eq(medicalActionMedicine.clinicId, clinicId),
          ),
        );

      if (validatedData.medicines && validatedData.medicines.length > 0) {
        await tx.insert(medicalActionMedicine).values(
          validatedData.medicines.map((med) => ({
            clinicId,
            medicalActionId: id,
            medicineId: med.medicineId,
            medicineUnitId: med.medicineUnitId || null,
            quantity: med.quantity,
          })),
        );
      }
    });

    revalidatePath("/master/tindakan");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode tindakan sudah digunakan" };
    }
    return { success: false, error: "Gagal mengupdate tindakan" };
  }
}

export async function toggleTindakanStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .update(medicalAction)
      .set({ isActive })
      .where(
        and(
          eq(medicalAction.id, id),
          eq(medicalAction.clinicId, membership.clinicId),
        ),
      );

    revalidatePath("/master/tindakan");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengubah status tindakan" };
  }
}

export async function deleteTindakan(id: string): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const clinicId = membership.clinicId;

  try {
    await db.transaction(async (tx) => {
      // Delete associated medicines first
      await tx
        .delete(medicalActionMedicine)
        .where(
          and(
            eq(medicalActionMedicine.medicalActionId, id),
            eq(medicalActionMedicine.clinicId, clinicId),
          ),
        );

      // Delete associated tariffs
      await tx
        .delete(actionTariff)
        .where(
          and(
            eq(actionTariff.medicalActionId, id),
            eq(actionTariff.clinicId, clinicId),
          ),
        );

      // Delete the action itself
      await tx
        .delete(medicalAction)
        .where(
          and(
            eq(medicalAction.id, id),
            eq(medicalAction.clinicId, clinicId),
          ),
        );
    });

    revalidatePath("/master/tindakan");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus tindakan" };
  }
}
