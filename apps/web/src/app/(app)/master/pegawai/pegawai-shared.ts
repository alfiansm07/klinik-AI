import {
  JABATAN_LABELS,
  JABATAN_OPTIONS,
  PEGAWAI_GENDER_LABELS,
  PEGAWAI_LICENSE_TYPE_LABELS,
  PEGAWAI_MARITAL_STATUS_LABELS,
  PEGAWAI_RELIGION_LABELS,
  UNKNOWN_JABATAN_LABEL,
  type JabatanKey,
  type PegawaiGender,
  type PegawaiLicenseType,
  type PegawaiMaritalStatus,
  type PegawaiReligion,
} from "./constants";
import { PEGAWAI_SCHEMA_ACTION_ERROR_MESSAGE } from "./pegawai-schema";

export { JABATAN_OPTIONS };

export function getPegawaiSchemaActionError() {
  return PEGAWAI_SCHEMA_ACTION_ERROR_MESSAGE;
}

export type PegawaiLicenseInput = {
  id?: string | null;
  licenseType: string;
  licenseNumber: string;
  issuedDate: Date | null;
  validUntil: Date | null;
  isLifetime: boolean;
  notes: string;
};

export type PegawaiFormValues = {
  fullName: string;
  titlePrefix: string;
  titleSuffix: string;
  nik: string;
  nip: string;
  gender: PegawaiGender | "";
  birthPlace: string;
  birthDate: string;
  religion: PegawaiReligion | "";
  maritalStatus: PegawaiMaritalStatus | "";
  address: string;
  email: string;
  phone: string;
  position: JabatanKey | "";
  workplaceName: string;
  parentInstitutionName: string;
  externalReference: string;
  isActive: boolean;
  licenses: PegawaiLicenseFormValues[];
};

export type PegawaiLicenseFormValues = {
  id?: string;
  licenseType: PegawaiLicenseType | "";
  licenseNumber: string;
  issuedDate: string;
  validUntil: string;
  isLifetime: boolean;
  notes: string;
};

export type NormalizedPegawaiLicenseInput = {
  id?: string;
  licenseType: string;
  licenseNumber: string;
  issuedDate: Date | null;
  validUntil: Date | null;
  isLifetime: boolean;
  notes: string | null;
};

export function formatJabatanLabel(value: string | null | undefined): string {
  if (!value) {
    return UNKNOWN_JABATAN_LABEL;
  }

  return JABATAN_LABELS[value as JabatanKey] ?? UNKNOWN_JABATAN_LABEL;
}

export function formatPegawaiGenderLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return PEGAWAI_GENDER_LABELS[value as PegawaiGender] ?? "-";
}

export function formatPegawaiReligionLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return PEGAWAI_RELIGION_LABELS[value as PegawaiReligion] ?? "-";
}

export function formatPegawaiMaritalStatusLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return PEGAWAI_MARITAL_STATUS_LABELS[value as PegawaiMaritalStatus] ?? "-";
}

export function formatPegawaiLicenseTypeLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return PEGAWAI_LICENSE_TYPE_LABELS[value as PegawaiLicenseType] ?? "-";
}

export function getDefaultLicenseRow(): PegawaiLicenseFormValues {
  return {
    licenseType: "",
    licenseNumber: "",
    issuedDate: "",
    validUntil: "",
    isLifetime: false,
    notes: "",
  };
}

export function getDefaultPegawaiFormValues(): PegawaiFormValues {
  return {
    fullName: "",
    titlePrefix: "",
    titleSuffix: "",
    nik: "",
    nip: "",
    gender: "",
    birthPlace: "",
    birthDate: "",
    religion: "",
    maritalStatus: "",
    address: "",
    email: "",
    phone: "",
    position: "",
    workplaceName: "",
    parentInstitutionName: "",
    externalReference: "",
    isActive: true,
    licenses: [getDefaultLicenseRow()],
  };
}

export function toDateInputValue(value: Date | null | undefined): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export function mapPegawaiDetailToFormValues(
  detail:
    | {
        fullName: string;
        titlePrefix: string | null;
        titleSuffix: string | null;
        nik: string | null;
        nip: string | null;
        gender: string | null;
        birthPlace: string | null;
        birthDate: Date | null;
        religion: string | null;
        maritalStatus: string | null;
        address: string | null;
        email: string | null;
        phone: string | null;
        position: string;
        workplaceName: string;
        parentInstitutionName: string | null;
        externalReference: string | null;
        isActive: boolean;
        licenses: Array<{
          id: string;
          licenseType: string;
          licenseNumber: string;
          issuedDate: Date | null;
          validUntil: Date | null;
          isLifetime: boolean;
          notes: string | null;
        }>;
      }
    | null,
): PegawaiFormValues | null {
  if (!detail) {
    return null;
  }

  return {
    fullName: detail.fullName,
    titlePrefix: detail.titlePrefix ?? "",
    titleSuffix: detail.titleSuffix ?? "",
    nik: detail.nik ?? "",
    nip: detail.nip ?? "",
    gender: (detail.gender as PegawaiFormValues["gender"]) ?? "",
    birthPlace: detail.birthPlace ?? "",
    birthDate: toDateInputValue(detail.birthDate),
    religion: (detail.religion as PegawaiFormValues["religion"]) ?? "",
    maritalStatus: (detail.maritalStatus as PegawaiFormValues["maritalStatus"]) ?? "",
    address: detail.address ?? "",
    email: detail.email ?? "",
    phone: detail.phone ?? "",
    position: detail.position as PegawaiFormValues["position"],
    workplaceName: detail.workplaceName,
    parentInstitutionName: detail.parentInstitutionName ?? "",
    externalReference: detail.externalReference ?? "",
    isActive: detail.isActive,
    licenses:
      detail.licenses.length > 0
        ? detail.licenses.map((license) => ({
            id: license.id,
            licenseType: license.licenseType as PegawaiLicenseFormValues["licenseType"],
            licenseNumber: license.licenseNumber,
            issuedDate: toDateInputValue(license.issuedDate),
            validUntil: toDateInputValue(license.validUntil),
            isLifetime: license.isLifetime,
            notes: license.notes ?? "",
          }))
        : [getDefaultLicenseRow()],
  };
}

export function formatPegawaiDisplayName(detail: {
  titlePrefix: string | null;
  fullName: string;
  titleSuffix: string | null;
}): string {
  return [detail.titlePrefix, detail.fullName, detail.titleSuffix].filter(Boolean).join(" ");
}

export function validateLicenseLifetimeRule({
  isLifetime,
  validUntil,
}: {
  isLifetime: boolean;
  validUntil: Date | null;
}): boolean {
  return isLifetime ? validUntil === null : validUntil !== null;
}

export function normalizeLicenseRows(
  rows: PegawaiLicenseInput[],
): NormalizedPegawaiLicenseInput[] {
  return rows
    .map((row) => {
      const id = row.id?.trim();
      const licenseType = row.licenseType.trim();
      const licenseNumber = row.licenseNumber.trim();
      const notes = row.notes.trim();

      return {
        id: id || undefined,
        licenseType,
        licenseNumber,
        issuedDate: row.issuedDate,
        validUntil: row.isLifetime ? null : row.validUntil,
        isLifetime: row.isLifetime,
        notes: notes || null,
      };
    })
    .filter((row) => {
      return Boolean(
        row.licenseType ||
          row.licenseNumber ||
          row.issuedDate ||
          row.validUntil ||
          row.notes ||
          row.isLifetime,
      );
    });
}
