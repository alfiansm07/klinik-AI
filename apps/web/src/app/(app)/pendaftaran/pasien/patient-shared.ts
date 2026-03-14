import z from "zod";

export const PATIENT_MEDICAL_RECORD_PREFIX = "RM";
export const PATIENT_MEDICAL_RECORD_PAD_LENGTH = 6;
const PATIENT_GENDER_VALUES = ["laki_laki", "perempuan"] as const;

export const PATIENT_GENDER_LABELS = {
  laki_laki: "Laki-laki",
  perempuan: "Perempuan",
} as const;

export const patientFormSchema = z.object({
  nik: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(
      z.string().regex(/^(\d{16})?$/, "NIK harus 16 digit angka"),
    ),
  name: z.string().trim().min(1, "Nama pasien wajib diisi"),
  gender: z.string(),
  dateOfBirth: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir tidak valid"),
  mobilePhone: z.string().trim().max(30, "No. HP maksimal 30 karakter"),
  address: z.string().trim().max(500, "Alamat maksimal 500 karakter"),
}).superRefine((value, ctx) => {
  if (!isPatientGender(value.gender)) {
    ctx.addIssue({
      code: "custom",
      path: ["gender"],
      message: "Jenis kelamin wajib dipilih",
    });
  }

  const parsedDate = parseDateInput(value.dateOfBirth);

  if (!parsedDate) {
    ctx.addIssue({
      code: "custom",
      path: ["dateOfBirth"],
      message: "Tanggal lahir tidak valid",
    });
    return;
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  if (parsedDate.utcValue > todayUtc) {
    ctx.addIssue({
      code: "custom",
      path: ["dateOfBirth"],
      message: "Tanggal lahir tidak boleh di masa depan",
    });
  }
});

export type PatientFormInput = z.infer<typeof patientFormSchema>;
export type PatientGender = keyof typeof PATIENT_GENDER_LABELS;

export function getDefaultPatientFormValues(): PatientFormInput {
  return {
    nik: "",
    name: "",
    gender: "",
    dateOfBirth: "",
    mobilePhone: "",
    address: "",
  };
}

export function normalizePatientFormInput(input: PatientFormInput) {
  if (!isPatientGender(input.gender)) {
    throw new Error("Jenis kelamin pasien tidak valid");
  }

  return {
    nik: toNullableString(input.nik),
    name: input.name.trim(),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    mobilePhone: toNullableString(input.mobilePhone),
    address: toNullableString(input.address),
  };
}

export function formatPatientAge(dateOfBirth: string, referenceDate = new Date()) {
  const parsedDate = parseDateInput(dateOfBirth);

  if (!parsedDate) {
    return "-";
  }

  let years = referenceDate.getFullYear() - parsedDate.year;
  let months = referenceDate.getMonth() - parsedDate.monthIndex;
  const days = referenceDate.getDate() - parsedDate.day;

  if (days < 0) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return months === 0 ? `${years} thn` : `${years} thn ${months} bln`;
}

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isPatientGender(value: string): value is PatientGender {
  return PATIENT_GENDER_VALUES.includes(value as PatientGender);
}

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  const utcValue = Date.UTC(year, month - 1, day);
  const date = new Date(utcValue);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    year,
    monthIndex: month - 1,
    day,
    utcValue,
  };
}
