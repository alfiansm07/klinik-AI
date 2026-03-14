"use server";

import { db } from "@klinik-AI/db";
import { clinic, type ClinicSettings } from "@klinik-AI/db/schema/tenant";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext, requireRole } from "@/lib/auth-helpers";

// ─── Types ────────────────────────────────────────────────────

export type ClinicProfile = {
  id: string;
  code: string | null;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  ownerName: string | null;
  responsibleDoctor: string | null;
  sipNumber: string | null;
  licenseNumber: string | null;
  npwpNumber: string | null;
  logoUrl: string | null;
  settings: ClinicSettings | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

type RoundingSettings = {
  name: string;
  value: number;
};

// ─── Queries ──────────────────────────────────────────────────

export async function getClinicProfile(): Promise<ClinicProfile | null> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return null;

  const rows = await db
    .select({
      id: clinic.id,
      code: clinic.code,
      name: clinic.name,
      address: clinic.address,
      city: clinic.city,
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website,
      ownerName: clinic.ownerName,
      responsibleDoctor: clinic.responsibleDoctor,
      sipNumber: clinic.sipNumber,
      licenseNumber: clinic.licenseNumber,
      npwpNumber: clinic.npwpNumber,
      logoUrl: clinic.logoUrl,
      settings: clinic.settings,
      isActive: clinic.isActive,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    })
    .from(clinic)
    .where(eq(clinic.id, membership.clinicId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getRoundingSettings(): Promise<RoundingSettings | null> {
  const context = await getPageAuthContext("master");
  const membership = context.activeMembership;
  if (!membership) return null;

  const rows = await db
    .select({
      settings: clinic.settings,
    })
    .from(clinic)
    .where(eq(clinic.id, membership.clinicId))
    .limit(1);

  const rounding = rows[0]?.settings?.rounding;
  if (!rounding?.name || typeof rounding.value !== "number") {
    return null;
  }

  return {
    name: rounding.name,
    value: rounding.value,
  };
}

// ─── Mutations ────────────────────────────────────────────────

export async function updateClinicProfile(
  formData: FormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  requireRole(context, ["superadmin", "admin"]);
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) {
    return { success: false, error: "Nama klinik wajib diisi" };
  }

  try {
    await db
      .update(clinic)
      .set({
        name,
        address: (formData.get("address") as string)?.trim() || null,
        city: (formData.get("city") as string)?.trim() || null,
        phone: (formData.get("phone") as string)?.trim() || null,
        email: (formData.get("email") as string)?.trim() || null,
        website: (formData.get("website") as string)?.trim() || null,
        ownerName: (formData.get("ownerName") as string)?.trim() || null,
        responsibleDoctor:
          (formData.get("responsibleDoctor") as string)?.trim() || null,
        sipNumber: (formData.get("sipNumber") as string)?.trim() || null,
        licenseNumber:
          (formData.get("licenseNumber") as string)?.trim() || null,
        npwpNumber: (formData.get("npwpNumber") as string)?.trim() || null,
      })
      .where(eq(clinic.id, membership.clinicId));

    revalidatePath("/master/klinik");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui profil klinik" };
  }
}

export async function updateClinicSettings(
  formData: FormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  requireRole(context, ["superadmin", "admin"]);
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  try {
    const existingRows = await db
      .select({ settings: clinic.settings })
      .from(clinic)
      .where(eq(clinic.id, membership.clinicId))
      .limit(1);

    const existingSettings = existingRows[0]?.settings ?? {};

    const settings: ClinicSettings = {
      ...existingSettings,
      headerText: (formData.get("headerText") as string)?.trim() || undefined,
      footerText: (formData.get("footerText") as string)?.trim() || undefined,
      receiptNote:
        (formData.get("receiptNote") as string)?.trim() || undefined,
      tagline: (formData.get("tagline") as string)?.trim() || undefined,
      printNote: (formData.get("printNote") as string)?.trim() || undefined,
      socialMedia: {
        facebook:
          (formData.get("socialFacebook") as string)?.trim() || undefined,
        twitter:
          (formData.get("socialTwitter") as string)?.trim() || undefined,
        instagram:
          (formData.get("socialInstagram") as string)?.trim() || undefined,
      },
    };

    // Remove empty socialMedia object
    if (
      !settings.socialMedia?.facebook &&
      !settings.socialMedia?.twitter &&
      !settings.socialMedia?.instagram
    ) {
      settings.socialMedia = undefined;
    }

    await db
      .update(clinic)
      .set({ settings })
      .where(eq(clinic.id, membership.clinicId));

    revalidatePath("/master/klinik");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui pengaturan klinik" };
  }
}

export async function updateRoundingSettings(
  formData: FormData,
): Promise<ActionResult> {
  const context = await getPageAuthContext("master");
  requireRole(context, ["superadmin", "admin"]);
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const name = (formData.get("roundingName") as string | null)?.trim() ?? "";
  const rawValue = (formData.get("roundingValue") as string | null)?.trim() ?? "";
  const value = Number(rawValue);

  if (!name) {
    return { success: false, error: "Nama pembulatan wajib diisi" };
  }

  if (!rawValue || Number.isNaN(value) || !Number.isInteger(value) || value < 0) {
    return { success: false, error: "Nilai pembulatan harus berupa angka bulat 0 atau lebih" };
  }

  try {
    const existingRows = await db
      .select({ settings: clinic.settings })
      .from(clinic)
      .where(eq(clinic.id, membership.clinicId))
      .limit(1);

    const existingSettings = existingRows[0]?.settings ?? {};
    const settings: ClinicSettings = {
      ...existingSettings,
      rounding: {
        name,
        value,
      },
    };

    await db
      .update(clinic)
      .set({ settings })
      .where(eq(clinic.id, membership.clinicId));

    revalidatePath("/master/klinik");
    revalidatePath("/master/pembulatan");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui konfigurasi pembulatan" };
  }
}
