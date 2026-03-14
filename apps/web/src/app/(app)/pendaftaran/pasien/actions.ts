"use server";

import { db } from "@klinik-AI/db";
import { visitAssessment } from "@klinik-AI/db/schema/assessment";
import { user } from "@klinik-AI/db/schema/auth";
import { guarantor, room } from "@klinik-AI/db/schema/master";
import { patient } from "@klinik-AI/db/schema/patient";
import { visit } from "@klinik-AI/db/schema/visit";
import { and, asc, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";
import { generateNextCode } from "@/lib/auto-code";
import { canAccessModule } from "@/lib/rbac";

import {
  formatPatientAge,
  normalizePatientFormInput,
  PATIENT_GENDER_LABELS,
  PATIENT_MEDICAL_RECORD_PAD_LENGTH,
  PATIENT_MEDICAL_RECORD_PREFIX,
  patientFormSchema,
  type PatientFormInput,
  type PatientGender,
} from "./patient-shared";
import {
  formatRegistrationAssessmentStatus,
  resolveRegistrationAssessmentStatus,
  type DailyRegistrationRow,
  type RegistrationDetail,
} from "./registration-list-shared";

export type PatientRow = {
  id: string;
  medicalRecordNumber: string;
  nik: string | null;
  name: string;
  gender: PatientGender;
  genderLabel: string;
  dateOfBirth: string;
  mobilePhone: string | null;
  address: string | null;
  isActive: boolean;
};

type ActionResult = {
  success: boolean;
  error?: string;
  patient?: PatientSearchRow;
};

export async function getPatientList(): Promise<PatientRow[]> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;
  if (!membership) return [];

  const canOpenAssessment = canAccessModule(membership.role, "care");

  const rows = await db
    .select({
      id: patient.id,
      medicalRecordNumber: patient.medicalRecordNumber,
      nik: patient.nik,
      name: patient.name,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      mobilePhone: patient.mobilePhone,
      address: patient.address,
      isActive: patient.isActive,
    })
    .from(patient)
    .where(eq(patient.clinicId, membership.clinicId))
    .orderBy(asc(patient.name), asc(patient.medicalRecordNumber));

  return rows.map((row) => ({
    ...row,
    genderLabel: PATIENT_GENDER_LABELS[row.gender],
  }));
}

export type PatientSearchRow = {
  id: string;
  medicalRecordNumber: string;
  nik: string | null;
  name: string;
  gender: PatientGender;
  genderLabel: string;
  dateOfBirth: string;
  ageLabel: string;
  mobilePhone: string | null;
  address: string | null;
  isActive: boolean;
};

export async function searchPatients(query: string): Promise<PatientSearchRow[]> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;
  if (!membership) return [];

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const pattern = `%${trimmed}%`;

  const isNumericQuery = /^\d+$/.test(trimmed);

  const rows = await db
    .select({
      id: patient.id,
      medicalRecordNumber: patient.medicalRecordNumber,
      nik: patient.nik,
      name: patient.name,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      mobilePhone: patient.mobilePhone,
      address: patient.address,
      isActive: patient.isActive,
    })
    .from(patient)
    .where(
      and(
        eq(patient.clinicId, membership.clinicId),
        eq(patient.isActive, true),
        or(
          ilike(patient.name, pattern),
          ilike(patient.medicalRecordNumber, pattern),
          ...(isNumericQuery ? [ilike(patient.nik, pattern)] : []),
        ),
      ),
    )
    .orderBy(asc(patient.name))
    .limit(10);

  return rows.map((row) => ({
    ...row,
    genderLabel: PATIENT_GENDER_LABELS[row.gender],
    ageLabel: formatPatientAge(row.dateOfBirth),
  }));
}

export async function getDailyRegistrationList(): Promise<DailyRegistrationRow[]> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;

  if (!membership) return [];

  const canOpenAssessment = canAccessModule(membership.role, "care");

  const rows = await db
    .select({
      id: visit.id,
      registrationNumber: visit.registrationNumber,
      registeredAt: visit.registeredAt,
      visitDate: visit.visitDate,
      visitStatus: visit.status,
      visitKind: visit.visitKind,
      serviceType: visit.serviceType,
      registrationSource: visit.registrationSource,
      status: visit.status,
      patientName: patient.name,
      patientNik: patient.nik,
      medicalRecordNumber: patient.medicalRecordNumber,
      patientGender: patient.gender,
      patientDateOfBirth: patient.dateOfBirth,
      patientAddress: patient.address,
      roomName: room.name,
      guarantorName: guarantor.name,
      guarantorType: guarantor.type,
      allergyStatus: visit.allergyStatus,
    })
    .from(visit)
    .innerJoin(patient, eq(visit.patientId, patient.id))
    .innerJoin(room, eq(visit.roomId, room.id))
    .innerJoin(guarantor, eq(visit.guarantorId, guarantor.id))
    .where(and(eq(visit.clinicId, membership.clinicId), isNull(visit.deletedAt)))
    .orderBy(desc(visit.registeredAt));

  const assessmentRows = rows.length
    ? await db
        .select({
          visitId: visitAssessment.visitId,
          status: visitAssessment.status,
          disposition: visitAssessment.disposition,
          handoverSummaryAuto: visitAssessment.handoverSummaryAuto,
          handoverNoteManual: visitAssessment.handoverNoteManual,
        })
        .from(visitAssessment)
        .where(
          and(
            eq(visitAssessment.clinicId, membership.clinicId),
            inArray(
              visitAssessment.visitId,
              rows.map((row) => row.id),
            ),
            isNull(visitAssessment.deletedAt),
          ),
        )
    : [];

  const assessmentMap = new Map(assessmentRows.map((row) => [row.visitId, row]));

  return rows.map((row, index) => {
    const status = mapVisitStatusToRegistrationStatus(row.status);
    const assessment = assessmentMap.get(row.id);
    const assessmentStatus = resolveRegistrationAssessmentStatus({
      visitStatus: row.status,
      assessmentStatus: assessment?.status,
      disposition: assessment?.disposition,
    });
    const assessmentSurface = formatRegistrationAssessmentStatus(
      assessmentStatus,
      assessment?.handoverNoteManual ?? assessment?.handoverSummaryAuto,
    );

    return {
      id: row.id,
      rowNumber: index + 1,
      registrationId: row.registrationNumber,
      registrationNumber: row.registrationNumber,
      registrationDateTime: formatDateTime(row.registeredAt),
      registrationDate: row.visitDate,
      arrivalTime: formatTime(row.registeredAt),
      patientName: row.patientName.toUpperCase(),
      patientIdLabel: `eRm : ${row.medicalRecordNumber}`,
      nik: row.patientNik ?? "-",
      medicalRecordNumber: row.medicalRecordNumber,
      legacyMedicalRecordNumber: "-",
      genderLabel: PATIENT_GENDER_LABELS[row.patientGender],
      birthDateLabel: formatDate(row.patientDateOfBirth),
      ageLabel: formatPatientAgeLong(row.patientDateOfBirth),
      addressLabel: row.patientAddress ?? "-",
      specialConditionLabel: row.allergyStatus === "ada" ? "Alergi" : "-",
      roomLabel: row.roomName,
      guarantor: mapGuarantorTypeToRegistrationGuarantor(row.guarantorType),
      guarantorLabel: row.guarantorName,
      paymentStatus: "belum_bayar",
      paymentStatusLabel: "Belum bayar",
      bpjsStatusLabel: row.guarantorType === "bpjs" ? "Aktif" : "-",
      registrationSource: mapRegistrationSourceToFilterValue(row.registrationSource),
      visitKindLabel: row.visitKind.toUpperCase(),
      serviceStatusLabel: row.serviceType === "sakit" ? "Kunjungan Sakit" : "Kunjungan Sehat",
      consentStatus: "belum",
      consentStatusLabel: "Belum",
      status,
      statusLegendLabel: mapRegistrationStatusLabel(status),
      assessmentStatus,
      assessmentSummary: assessmentSurface.screeningNote,
       assessmentActionLabel: canOpenAssessment ? assessmentSurface.actionLabel : undefined,
      printActions: [{ id: "general-consent", label: "General Consent" }],
    };
  });
}

export async function getRegistrationDetail(id: string): Promise<RegistrationDetail | null> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;

  if (!membership) return null;

  const canOpenAssessment = canAccessModule(membership.role, "care");

  const [detail] = await db
    .select({
      id: visit.id,
      patientId: visit.patientId,
      registrationNumber: visit.registrationNumber,
      registeredAt: visit.registeredAt,
      visitDate: visit.visitDate,
      visitStatus: visit.status,
      visitKind: visit.visitKind,
      serviceType: visit.serviceType,
      registrationSource: visit.registrationSource,
      allergyStatus: visit.allergyStatus,
      allergyNote: visit.allergyNote,
      frontOfficeNote: visit.frontOfficeNote,
      patientName: patient.name,
      patientNik: patient.nik,
      medicalRecordNumber: patient.medicalRecordNumber,
      patientGender: patient.gender,
      patientDateOfBirth: patient.dateOfBirth,
      patientAddress: patient.address,
      patientPhone: patient.mobilePhone,
      roomName: room.name,
      installation: room.installation,
      guarantorName: guarantor.name,
      createdByName: user.name,
    })
    .from(visit)
    .innerJoin(patient, eq(visit.patientId, patient.id))
    .innerJoin(room, eq(visit.roomId, room.id))
    .innerJoin(guarantor, eq(visit.guarantorId, guarantor.id))
    .innerJoin(user, eq(visit.createdByUserId, user.id))
    .where(and(eq(visit.id, id), eq(visit.clinicId, membership.clinicId), isNull(visit.deletedAt)));

  if (!detail) return null;

  const [assessment] = await db
    .select({
      status: visitAssessment.status,
      disposition: visitAssessment.disposition,
      assessmentAt: visitAssessment.assessmentAt,
      handoverSummaryAuto: visitAssessment.handoverSummaryAuto,
      handoverNoteManual: visitAssessment.handoverNoteManual,
    })
    .from(visitAssessment)
    .where(
      and(
        eq(visitAssessment.visitId, detail.id),
        eq(visitAssessment.clinicId, membership.clinicId),
        isNull(visitAssessment.deletedAt),
      ),
    );

  const assessmentStatus = resolveRegistrationAssessmentStatus({
    visitStatus: detail.visitStatus,
    assessmentStatus: assessment?.status,
    disposition: assessment?.disposition,
  });
  const screeningStatus = formatRegistrationAssessmentStatus(
    assessmentStatus,
    assessment?.handoverNoteManual ?? assessment?.handoverSummaryAuto,
  );
  const assessmentHref = canOpenAssessment ? `/pelayanan/asesmen-awal/${detail.id}` : undefined;

  const sameDayHistoryRows = await db
    .select({
      id: visit.id,
      registeredAt: visit.registeredAt,
      roomName: room.name,
    })
    .from(visit)
    .innerJoin(room, eq(visit.roomId, room.id))
    .where(
      and(
        eq(visit.clinicId, membership.clinicId),
        eq(visit.patientId, detail.patientId),
        eq(visit.visitDate, detail.visitDate),
        isNull(visit.deletedAt),
      ),
    )
    .orderBy(desc(visit.registeredAt));

  return {
    id: detail.id,
    registrationId: detail.registrationNumber,
    registrationDateTime: formatDateTime(detail.registeredAt),
    queueNumber: `-${detail.registrationNumber}`,
    patientInfoLines: [
      `ID: ${detail.medicalRecordNumber}`,
      `NIK: ${detail.patientNik ?? "-"}`,
      detail.patientName.toUpperCase(),
      PATIENT_GENDER_LABELS[detail.patientGender],
      formatDate(detail.patientDateOfBirth),
      detail.patientPhone ?? "-",
      "No RM Lama: -",
    ],
    allergyGroups: [
      {
        label: detail.allergyStatus === "ada" ? "Umum" : "Obat",
        values: [detail.allergyStatus === "ada" ? detail.allergyNote ?? "Ada alergi" : "Tidak Ada"],
      },
    ],
    ageLabel: formatPatientAgeLong(detail.patientDateOfBirth),
    visitKindLabel: detail.visitKind.toUpperCase(),
    guarantorLabel: detail.guarantorName,
    paymentStatusLabel: "Belum bayar",
    referralSourceLabel: mapRegistrationSourceLabel(detail.registrationSource),
    referrerNameLabel: "-",
    createdByLabel: `${formatDateTime(detail.registeredAt)} / ${detail.createdByName}`,
    updatedByLabel: `${formatDateTime(detail.registeredAt)} / ${detail.createdByName}`,
    serviceRows: [
      {
        id: detail.id,
        registrationDateTime: formatDateTime(detail.registeredAt),
        installationLabel: mapInstallationLabel(detail.installation),
        roomLabel: detail.roomName,
        screeningLabel: screeningStatus.screeningLabel,
         actionLabel: canOpenAssessment ? screeningStatus.actionLabel : undefined,
         actionHref: assessmentHref,
      },
    ],
    screeningRows: assessment
      ? [
          {
            id: `${detail.id}-screening`,
            screeningLabel: screeningStatus.screeningLabel,
            dateLabel: formatDateTime(assessment.assessmentAt),
            noteLabel: screeningStatus.screeningNote,
             actionLabel: canOpenAssessment ? screeningStatus.actionLabel : undefined,
             actionHref: assessmentHref,
          },
        ]
      : [
          {
            id: `${detail.id}-screening`,
            screeningLabel: screeningStatus.screeningLabel,
            dateLabel: formatDateTime(detail.registeredAt),
            noteLabel: screeningStatus.screeningNote,
             actionLabel: canOpenAssessment ? screeningStatus.actionLabel : undefined,
             actionHref: assessmentHref,
          },
        ],
    sameDayHistoryRows: sameDayHistoryRows.map((row) => ({
      id: row.id,
      dateLabel: formatDateTime(row.registeredAt),
      roomLabel: row.roomName,
    })),
    actionButtons: [
      { id: "lihat-semua", label: "Lihat Semua", tone: "outline" },
      { id: "lihat-riwayat", label: "Lihat Riwayat", tone: "outline" },
      { id: "pembayaran", label: "Pembayaran", tone: "outline" },
      { id: "cetak-surat", label: "Cetak Surat Berobat", tone: "success" },
      { id: "cetak", label: "Cetak", tone: "default" },
      { id: "ubah-pasien", label: "Ubah Pasien", tone: "outline" },
      { id: "ubah", label: "Ubah", tone: "default" },
    ],
  };
}

export async function getNextMedicalRecordNumber(): Promise<string> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;
  if (!membership) return `${PATIENT_MEDICAL_RECORD_PREFIX}000001`;

  return generateNextCode(
    membership.clinicId,
    PATIENT_MEDICAL_RECORD_PREFIX,
    {
      table: patient,
      codeColumn: patient.medicalRecordNumber,
      clinicIdColumn: patient.clinicId,
    },
    PATIENT_MEDICAL_RECORD_PAD_LENGTH,
  );
}

export async function createPatient(data: PatientFormInput): Promise<ActionResult> {
  const context = await getPageAuthContext("registration");
  const membership = context.activeMembership;
  if (!membership) return { success: false, error: "Tidak ada klinik aktif" };

  const parsed = patientFormSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Data pasien tidak valid",
    };
  }

  const normalized = normalizePatientFormInput(parsed.data);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const medicalRecordNumber = await generateNextCode(
        membership.clinicId,
        PATIENT_MEDICAL_RECORD_PREFIX,
        {
          table: patient,
          codeColumn: patient.medicalRecordNumber,
          clinicIdColumn: patient.clinicId,
        },
        PATIENT_MEDICAL_RECORD_PAD_LENGTH,
      );

      const [createdPatient] = await db
        .insert(patient)
        .values({
          clinicId: membership.clinicId,
          medicalRecordNumber,
          nik: normalized.nik,
          name: normalized.name,
          gender: normalized.gender,
          dateOfBirth: normalized.dateOfBirth,
          mobilePhone: normalized.mobilePhone,
          address: normalized.address,
        })
        .returning({
          id: patient.id,
          medicalRecordNumber: patient.medicalRecordNumber,
          nik: patient.nik,
          name: patient.name,
          gender: patient.gender,
          dateOfBirth: patient.dateOfBirth,
          mobilePhone: patient.mobilePhone,
          address: patient.address,
          isActive: patient.isActive,
        });

      revalidatePath("/pendaftaran/pasien");
      return {
        success: true,
        patient: {
          ...createdPatient,
          genderLabel: PATIENT_GENDER_LABELS[createdPatient.gender],
          ageLabel: formatPatientAge(createdPatient.dateOfBirth),
        },
      };
    } catch (error) {
      if (isNikUniqueConstraintError(error)) {
        return { success: false, error: "NIK sudah terdaftar pada klinik ini" };
      }

      if (isMedicalRecordUniqueConstraintError(error)) {
        continue;
      }

      return { success: false, error: "Gagal menambahkan pasien" };
    }
  }

  return {
    success: false,
    error: "Nomor rekam medis bentrok. Silakan coba simpan ulang.",
  };
}

function isMedicalRecordUniqueConstraintError(error: unknown) {
  return isConstraintError(error, "patient_clinic_mrn_idx");
}

function isNikUniqueConstraintError(error: unknown) {
  return isConstraintError(error, "patient_clinic_nik_idx");
}

function isConstraintError(error: unknown, constraintName: string) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes(constraintName.toLowerCase())
  );
}

function mapGuarantorTypeToRegistrationGuarantor(type: string): DailyRegistrationRow["guarantor"] {
  if (type === "bpjs") return "bpjs";
  if (type === "asuransi") return "asuransi";
  return "umum";
}

function mapVisitStatusToRegistrationStatus(status: string): DailyRegistrationRow["status"] {
  if (status === "in_examination") return "sedang_diperiksa";
  if (status === "completed") return "sudah_diperiksa";
  return "belum_diperiksa";
}

function mapRegistrationStatusLabel(status: DailyRegistrationRow["status"]) {
  if (status === "sedang_diperiksa") return "Sedang Diperiksa";
  if (status === "sudah_diperiksa") return "Sudah Diperiksa";
  return "Belum Diperiksa";
}

function mapRegistrationSourceLabel(source: string) {
  if (source === "telepon") return "Telepon";
  if (source === "rujukan_internal") return "Rujukan Internal";
  return "Datang Langsung";
}

function mapRegistrationSourceToFilterValue(source: string): DailyRegistrationRow["registrationSource"] {
  if (source === "telepon") return "walk_in";
  if (source === "rujukan_internal") return "rujukan_internal";
  return "walk_in";
}

function mapInstallationLabel(value: string | null) {
  if (value === "instalasi_farmasi") return "Instalasi Farmasi";
  if (value === "instalasi_laboratorium") return "Instalasi Laboratorium";
  if (value === "instalasi_radiologi") return "Instalasi Radiologi";
  return "Instalasi Rawat Jalan";
}

function formatDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function formatDateTime(value: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function formatPatientAgeLong(dateOfBirth: string, referenceDate = new Date()) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "-";
  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  let months = referenceDate.getMonth() - birthDate.getMonth();
  let days = referenceDate.getDate() - birthDate.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
    days += prevMonthDate.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} Thn ${months} Bln ${days} Hr`;
}
