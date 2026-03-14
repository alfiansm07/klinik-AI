"use server";

import { db } from "@klinik-AI/db";
import { patient } from "@klinik-AI/db/schema/patient";
import { user } from "@klinik-AI/db/schema/auth";
import { guarantor, room } from "@klinik-AI/db/schema/master";
import { visit } from "@klinik-AI/db/schema/visit";
import { clinicMember } from "@klinik-AI/db/schema/tenant";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

import { generateNextCode } from "@/lib/auto-code";

import { getPageAuthContext } from "@/lib/auth-helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ServiceFormOptions = {
  rooms: Array<{ id: string; name: string }>;
  guarantors: Array<{ id: string; name: string }>;
  doctors: Array<{ id: string; name: string }>;
};

type RegistrationInput = {
  patientId: string;
  visitDate: string;
  visitKind: "baru" | "lama";
  visitType: "sakit" | "sehat";
  registrationSource: "datang_langsung" | "telepon" | "rujukan_internal";
  guarantorId: string;
  roomId: string;
  doctorId: string | null;
  chiefComplaint: string | null;
  allergyStatus: "tidak_ada" | "ada" | "belum_dikaji";
  allergyNote: string | null;
  heightCm: number | null;
  weightKg: number | null;
  frontOfficeNote: string | null;
};

type ActionResult = {
  success: boolean;
  error?: string;
  visitId?: string;
};

const registrationInputSchema = z.object({
  patientId: z.string().trim().min(1, "Pasien wajib dipilih"),
  visitDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal kunjungan tidak valid"),
  visitKind: z.enum(["baru", "lama"]),
  visitType: z.enum(["sakit", "sehat"]),
  registrationSource: z.enum(["datang_langsung", "telepon", "rujukan_internal"]),
  guarantorId: z.string().trim().min(1, "Penjamin wajib dipilih"),
  roomId: z.string().trim().min(1, "Ruangan wajib dipilih"),
  doctorId: z.string().trim().min(1).nullable(),
  chiefComplaint: z.string().trim().nullable(),
  allergyStatus: z.enum(["tidak_ada", "ada", "belum_dikaji"]),
  allergyNote: z.string().trim().nullable(),
  heightCm: z.number().nonnegative().nullable(),
  weightKg: z.number().nonnegative().nullable(),
  frontOfficeNote: z.string().trim().nullable(),
});

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Fetch rooms, guarantors, and doctors for the current clinic.
 * Called once when the Step 2 form mounts.
 */
export async function getServiceFormOptions(): Promise<ServiceFormOptions> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;

  if (!membership) {
    return { rooms: [], guarantors: [], doctors: [] };
  }

  const clinicId = membership.clinicId;

  const [roomRows, guarantorRows, doctorRows] = await Promise.all([
    // Active outpatient rooms
    db
      .select({ id: room.id, name: room.name })
      .from(room)
      .where(
        and(
          eq(room.clinicId, clinicId),
          eq(room.visitType, "rawat_jalan"),
          eq(room.isActive, true),
        ),
      )
      .orderBy(asc(room.name)),

    // Active guarantors
    db
      .select({ id: guarantor.id, name: guarantor.name })
      .from(guarantor)
      .where(
        and(
          eq(guarantor.clinicId, clinicId),
          eq(guarantor.isActive, true),
        ),
      )
      .orderBy(asc(guarantor.name)),

    // Active doctors (clinic members with role = "doctor")
    db
      .select({ id: clinicMember.id, name: user.name })
      .from(clinicMember)
      .innerJoin(user, eq(clinicMember.userId, user.id))
      .where(
        and(
          eq(clinicMember.clinicId, clinicId),
          eq(clinicMember.role, "doctor"),
          eq(clinicMember.isActive, true),
        ),
      )
      .orderBy(asc(user.name)),
  ]);

  return {
    rooms: roomRows,
    guarantors: guarantorRows,
    doctors: doctorRows,
  };
}

/**
 * Submit a new outpatient registration (visit).
 *
 */
export async function submitRegistration(
  input: RegistrationInput,
): Promise<ActionResult> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;

  if (!membership) {
    return { success: false, error: "Tidak memiliki akses klinik aktif" };
  }

  const parsedInput = registrationInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: parsedInput.error.issues[0]?.message ?? "Data pendaftaran tidak valid",
    };
  }

  const normalizedInput = parsedInput.data;

  const [patientRow, roomRow, guarantorRow, doctorRow] = await Promise.all([
    db
      .select({ id: patient.id })
      .from(patient)
      .where(and(eq(patient.id, normalizedInput.patientId), eq(patient.clinicId, membership.clinicId))),
    db
      .select({ id: room.id })
      .from(room)
      .where(and(eq(room.id, normalizedInput.roomId), eq(room.clinicId, membership.clinicId), eq(room.isActive, true))),
    db
      .select({ id: guarantor.id })
      .from(guarantor)
      .where(and(eq(guarantor.id, normalizedInput.guarantorId), eq(guarantor.clinicId, membership.clinicId), eq(guarantor.isActive, true))),
    normalizedInput.doctorId
      ? db
          .select({ id: clinicMember.id })
          .from(clinicMember)
          .where(
            and(
              eq(clinicMember.id, normalizedInput.doctorId),
              eq(clinicMember.clinicId, membership.clinicId),
              eq(clinicMember.role, "doctor"),
              eq(clinicMember.isActive, true),
            ),
          )
      : Promise.resolve([]),
  ]);

  if (patientRow.length === 0) {
    return { success: false, error: "Pasien tidak valid untuk klinik aktif" };
  }

  if (roomRow.length === 0) {
    return { success: false, error: "Poli / ruangan tidak valid untuk klinik aktif" };
  }

  if (guarantorRow.length === 0) {
    return { success: false, error: "Penjamin tidak valid untuk klinik aktif" };
  }

  if (normalizedInput.doctorId && doctorRow.length === 0) {
    return { success: false, error: "Tenaga medis tidak valid untuk klinik aktif" };
  }

  try {
    const registrationNumber = await generateNextCode(
      membership.clinicId,
      "",
      {
        table: visit,
        codeColumn: visit.registrationNumber,
        clinicIdColumn: visit.clinicId,
      },
      4,
    );

    const visitValues: typeof visit.$inferInsert = {
      clinicId: membership.clinicId,
      patientId: normalizedInput.patientId,
      registrationNumber,
      visitDate: normalizedInput.visitDate,
      visitKind: normalizedInput.visitKind,
      serviceType: normalizedInput.visitType,
      registrationSource: normalizedInput.registrationSource,
      guarantorId: normalizedInput.guarantorId,
      roomId: normalizedInput.roomId,
      doctorMemberId: normalizedInput.doctorId,
      chiefComplaint: normalizedInput.chiefComplaint,
      allergyStatus: normalizedInput.allergyStatus,
      allergyNote: normalizedInput.allergyNote,
      heightCm: normalizedInput.heightCm == null ? null : String(normalizedInput.heightCm),
      weightKg: normalizedInput.weightKg == null ? null : String(normalizedInput.weightKg),
      frontOfficeNote: normalizedInput.frontOfficeNote,
      status: "menunggu_asesmen",
      createdByUserId: context.session.user.id,
      updatedByUserId: context.session.user.id,
    };

    const [createdVisit] = await db
      .insert(visit)
      .values(visitValues)
      .returning({ id: visit.id });

    revalidatePath("/pendaftaran/pasien");
    revalidatePath(`/pendaftaran/pasien/${createdVisit.id}`);
    revalidatePath("/pelayanan/asesmen-awal");

    return { success: true, visitId: createdVisit.id };
  } catch {
    return { success: false, error: "Gagal menyimpan pendaftaran kunjungan" };
  }
}
