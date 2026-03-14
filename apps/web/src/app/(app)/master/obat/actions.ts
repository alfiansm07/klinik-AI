"use server";

import { db } from "@klinik-AI/db";
import {
  medicine,
  medicineCategory,
  medicineUnit,
  medicinePharmacology,
  manufacturer,
  supplier,
} from "@klinik-AI/db/schema/master";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";

// ─── Types ────────────────────────────────────────────────────

export type ObatRow = {
  id: string;
  code: string;
  name: string;
  categoryName: string | null;
  smallUnitName: string | null;
  kfaCode: string | null;
  manufacturerName: string | null;
  isActive: boolean;
  createdAt: Date;
};

export type ObatDetail = {
  id: string;
  code: string;
  name: string;
  isCompound: boolean;
  medicineCategoryId: string | null;
  manufacturerId: string | null;
  storageLocation: string | null;
  defaultTaxPct: number;
  pricingMethod: "hpp" | "markup";
  inventoryMethod: "fifo" | "lifo" | "average";
  lastPurchasePrice: number;
  highestPurchasePrice: number;
  avgPurchasePrice: number;
  maxRetailPrice: number;
  smallUnitId: string | null;
  packageUnitId: string | null;
  packageConversion: number | null;
  packageUnit2Id: string | null;
  packageConversion2: number | null;
  compoundUnitId: string | null;
  compoundQuantity: number | null;
  dosageInfo: string | null;
  drugInteractions: string | null;
  composition: string | null;
  mechanismOfAction: string | null;
  indications: string | null;
  contraindications: string | null;
  warnings: string | null;
  pharmacologyId: string | null;
  supplierId: string | null;
  kfaCode: string | null;
  bpjsCode: string | null;
  isActive: boolean;
};

export type ObatDetailWithNames = ObatDetail & {
  categoryName: string | null;
  manufacturerName: string | null;
  pharmacologyName: string | null;
  supplierName: string | null;
  smallUnitName: string | null;
  packageUnitName: string | null;
  packageUnit2Name: string | null;
  compoundUnitName: string | null;
};

export type ObatFormData = {
  code?: string;
  name: string;
  isCompound?: boolean;
  medicineCategoryId?: string | null;
  manufacturerId?: string | null;
  storageLocation?: string | null;
  defaultTaxPct?: number;
  pricingMethod?: "hpp" | "markup";
  inventoryMethod?: "fifo" | "lifo" | "average";
  smallUnitId?: string | null;
  packageUnitId?: string | null;
  packageConversion?: number | null;
  packageUnit2Id?: string | null;
  packageConversion2?: number | null;
  compoundUnitId?: string | null;
  compoundQuantity?: number | null;
  composition?: string | null;
  indications?: string | null;
  contraindications?: string | null;
  drugInteractions?: string | null;
  warnings?: string | null;
  dosageInfo?: string | null;
  mechanismOfAction?: string | null;
  pharmacologyId?: string | null;
  supplierId?: string | null;
  kfaCode?: string | null;
  bpjsCode?: string | null;
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

// ─── Queries ──────────────────────────────────────────────────

export async function getObatList(): Promise<ObatRow[]> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return [];

  return db
    .select({
      id: medicine.id,
      code: medicine.code,
      name: medicine.name,
      categoryName: medicineCategory.name,
      smallUnitName: medicineUnit.name,
      kfaCode: medicine.kfaCode,
      manufacturerName: manufacturer.name,
      isActive: medicine.isActive,
      createdAt: medicine.createdAt,
    })
    .from(medicine)
    .leftJoin(
      medicineCategory,
      eq(medicine.medicineCategoryId, medicineCategory.id),
    )
    .leftJoin(medicineUnit, eq(medicine.smallUnitId, medicineUnit.id))
    .leftJoin(manufacturer, eq(medicine.manufacturerId, manufacturer.id))
    .where(eq(medicine.clinicId, membership.clinicId))
    .orderBy(asc(medicine.code));
}

export async function getObatDetail(id: string): Promise<ObatDetail | null> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return null;

  const rows = await db
    .select({
      id: medicine.id,
      code: medicine.code,
      name: medicine.name,
      isCompound: medicine.isCompound,
      medicineCategoryId: medicine.medicineCategoryId,
      manufacturerId: medicine.manufacturerId,
      storageLocation: medicine.storageLocation,
      defaultTaxPct: medicine.defaultTaxPct,
      pricingMethod: medicine.pricingMethod,
      inventoryMethod: medicine.inventoryMethod,
      lastPurchasePrice: medicine.lastPurchasePrice,
      highestPurchasePrice: medicine.highestPurchasePrice,
      avgPurchasePrice: medicine.avgPurchasePrice,
      maxRetailPrice: medicine.maxRetailPrice,
      smallUnitId: medicine.smallUnitId,
      packageUnitId: medicine.packageUnitId,
      packageConversion: medicine.packageConversion,
      packageUnit2Id: medicine.packageUnit2Id,
      packageConversion2: medicine.packageConversion2,
      compoundUnitId: medicine.compoundUnitId,
      compoundQuantity: medicine.compoundQuantity,
      dosageInfo: medicine.dosageInfo,
      drugInteractions: medicine.drugInteractions,
      composition: medicine.composition,
      mechanismOfAction: medicine.mechanismOfAction,
      indications: medicine.indications,
      contraindications: medicine.contraindications,
      warnings: medicine.warnings,
      pharmacologyId: medicine.pharmacologyId,
      supplierId: medicine.supplierId,
      kfaCode: medicine.kfaCode,
      bpjsCode: medicine.bpjsCode,
      isActive: medicine.isActive,
    })
    .from(medicine)
    .where(
      and(eq(medicine.id, id), eq(medicine.clinicId, membership.clinicId)),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getObatDetailWithNames(
  id: string,
): Promise<ObatDetailWithNames | null> {
  const detail = await getObatDetail(id);
  if (!detail) return null;

  const unitIds = [
    detail.smallUnitId,
    detail.packageUnitId,
    detail.packageUnit2Id,
    detail.compoundUnitId,
  ].filter((unitId): unitId is string => Boolean(unitId));

  const [categoryRows, manufacturerRows, pharmacologyRows, supplierRows, unitRows] =
    await Promise.all([
      detail.medicineCategoryId
        ? db
            .select({ name: medicineCategory.name })
            .from(medicineCategory)
            .where(eq(medicineCategory.id, detail.medicineCategoryId))
            .limit(1)
        : Promise.resolve([]),
      detail.manufacturerId
        ? db
            .select({ name: manufacturer.name })
            .from(manufacturer)
            .where(eq(manufacturer.id, detail.manufacturerId))
            .limit(1)
        : Promise.resolve([]),
      detail.pharmacologyId
        ? db
            .select({ name: medicinePharmacology.name })
            .from(medicinePharmacology)
            .where(eq(medicinePharmacology.id, detail.pharmacologyId))
            .limit(1)
        : Promise.resolve([]),
      detail.supplierId
        ? db
            .select({ name: supplier.name })
            .from(supplier)
            .where(eq(supplier.id, detail.supplierId))
            .limit(1)
        : Promise.resolve([]),
      unitIds.length > 0
        ? db
            .select({ id: medicineUnit.id, name: medicineUnit.name })
            .from(medicineUnit)
            .where(inArray(medicineUnit.id, unitIds))
        : Promise.resolve([]),
    ]);

  const unitMap = new Map(unitRows.map((unit) => [unit.id, unit.name]));

  return {
    ...detail,
    categoryName: categoryRows[0]?.name ?? null,
    manufacturerName: manufacturerRows[0]?.name ?? null,
    pharmacologyName: pharmacologyRows[0]?.name ?? null,
    supplierName: supplierRows[0]?.name ?? null,
    smallUnitName: detail.smallUnitId ? (unitMap.get(detail.smallUnitId) ?? null) : null,
    packageUnitName: detail.packageUnitId
      ? (unitMap.get(detail.packageUnitId) ?? null)
      : null,
    packageUnit2Name: detail.packageUnit2Id
      ? (unitMap.get(detail.packageUnit2Id) ?? null)
      : null,
    compoundUnitName: detail.compoundUnitId
      ? (unitMap.get(detail.compoundUnitId) ?? null)
      : null,
  };
}

// ─── Lookups ──────────────────────────────────────────────────

export async function getObatLookups() {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) {
    return { categories: [], units: [], pharmacologies: [], manufacturers: [], suppliers: [] };
  }

  const clinicId = membership.clinicId;

  const [categories, units, pharmacologies, manufacturers_, suppliers_] =
    await Promise.all([
      db
        .select({
          id: medicineCategory.id,
          code: medicineCategory.code,
          name: medicineCategory.name,
        })
        .from(medicineCategory)
        .where(
          and(
            eq(medicineCategory.clinicId, clinicId),
            eq(medicineCategory.isActive, true),
          ),
        )
        .orderBy(asc(medicineCategory.name)),
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
          id: medicinePharmacology.id,
          code: medicinePharmacology.code,
          name: medicinePharmacology.name,
        })
        .from(medicinePharmacology)
        .where(
          and(
            eq(medicinePharmacology.clinicId, clinicId),
            eq(medicinePharmacology.isActive, true),
          ),
        )
        .orderBy(asc(medicinePharmacology.name)),
      db
        .select({
          id: manufacturer.id,
          code: manufacturer.code,
          name: manufacturer.name,
        })
        .from(manufacturer)
        .where(
          and(
            eq(manufacturer.clinicId, clinicId),
            eq(manufacturer.isActive, true),
          ),
        )
        .orderBy(asc(manufacturer.name)),
      db
        .select({
          id: supplier.id,
          code: supplier.code,
          name: supplier.name,
        })
        .from(supplier)
        .where(
          and(
            eq(supplier.clinicId, clinicId),
            eq(supplier.isActive, true),
          ),
        )
        .orderBy(asc(supplier.name)),
    ]);

  return {
    categories,
    units,
    pharmacologies,
    manufacturers: manufacturers_,
    suppliers: suppliers_,
  };
}

// ─── Mutations ────────────────────────────────────────────────

/** Server action: get the next auto-generated code for Obat */
export async function getNextObatCode(): Promise<string> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return "OBT001";

  return generateNextCode(membership.clinicId, "OBT", {
    table: medicine,
    codeColumn: medicine.code,
    clinicIdColumn: medicine.clinicId,
  });
}

export async function createObat(data: ObatFormData): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    const code = await generateNextCode(membership.clinicId, "OBT", {
      table: medicine,
      codeColumn: medicine.code,
      clinicIdColumn: medicine.clinicId,
    });

    await db.insert(medicine).values({
      clinicId: membership.clinicId,
      code,
      name: data.name.trim(),
      isCompound: data.isCompound ?? false,
      medicineCategoryId: data.medicineCategoryId || null,
      manufacturerId: data.manufacturerId || null,
      storageLocation: data.storageLocation?.trim() || null,
      defaultTaxPct: data.defaultTaxPct ?? 0,
      pricingMethod: data.pricingMethod ?? "hpp",
      inventoryMethod: data.inventoryMethod ?? "average",
      smallUnitId: data.smallUnitId || null,
      packageUnitId: data.packageUnitId || null,
      packageConversion: data.packageConversion || null,
      packageUnit2Id: data.packageUnit2Id || null,
      packageConversion2: data.packageConversion2 || null,
      compoundUnitId: data.compoundUnitId || null,
      compoundQuantity: data.compoundQuantity || null,
      composition: data.composition?.trim() || null,
      indications: data.indications?.trim() || null,
      contraindications: data.contraindications?.trim() || null,
      drugInteractions: data.drugInteractions?.trim() || null,
      warnings: data.warnings?.trim() || null,
      dosageInfo: data.dosageInfo?.trim() || null,
      mechanismOfAction: data.mechanismOfAction?.trim() || null,
      pharmacologyId: data.pharmacologyId || null,
      supplierId: data.supplierId || null,
      kfaCode: data.kfaCode?.trim() || null,
      bpjsCode: data.bpjsCode?.trim() || null,
    });

    revalidatePath("/master/obat");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode obat sudah digunakan" };
    }
    return { success: false, error: "Gagal menambahkan obat" };
  }
}

export async function updateObat(
  id: string,
  data: ObatFormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .update(medicine)
      .set({
        name: data.name.trim(),
        isCompound: data.isCompound ?? false,
        medicineCategoryId: data.medicineCategoryId || null,
        manufacturerId: data.manufacturerId || null,
        storageLocation: data.storageLocation?.trim() || null,
        defaultTaxPct: data.defaultTaxPct ?? 0,
        pricingMethod: data.pricingMethod ?? "hpp",
        inventoryMethod: data.inventoryMethod ?? "average",
        smallUnitId: data.smallUnitId || null,
        packageUnitId: data.packageUnitId || null,
        packageConversion: data.packageConversion || null,
        packageUnit2Id: data.packageUnit2Id || null,
        packageConversion2: data.packageConversion2 || null,
        compoundUnitId: data.compoundUnitId || null,
        compoundQuantity: data.compoundQuantity || null,
        composition: data.composition?.trim() || null,
        indications: data.indications?.trim() || null,
        contraindications: data.contraindications?.trim() || null,
        drugInteractions: data.drugInteractions?.trim() || null,
        warnings: data.warnings?.trim() || null,
        dosageInfo: data.dosageInfo?.trim() || null,
        mechanismOfAction: data.mechanismOfAction?.trim() || null,
        pharmacologyId: data.pharmacologyId || null,
        supplierId: data.supplierId || null,
        kfaCode: data.kfaCode?.trim() || null,
        bpjsCode: data.bpjsCode?.trim() || null,
      })
      .where(
        and(eq(medicine.id, id), eq(medicine.clinicId, membership.clinicId)),
      );

    revalidatePath("/master/obat");
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "Kode obat sudah digunakan" };
    }
    return { success: false, error: "Gagal mengupdate obat" };
  }
}

export async function toggleObatStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .update(medicine)
      .set({ isActive })
      .where(
        and(eq(medicine.id, id), eq(medicine.clinicId, membership.clinicId)),
      );

    revalidatePath("/master/obat");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengubah status obat" };
  }
}

export async function deleteObat(id: string): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    await db
      .delete(medicine)
      .where(
        and(eq(medicine.id, id), eq(medicine.clinicId, membership.clinicId)),
      );

    revalidatePath("/master/obat");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus obat" };
  }
}
