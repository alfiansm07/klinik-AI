export const INSURANCE_GUARANTOR_TYPES = [
  "pribadi",
  "bpjs",
  "asuransi",
  "pemerintah",
] as const;

export const COMPANY_GUARANTOR_TYPE = "perusahaan_lainnya" as const;

export const ALL_GUARANTOR_TYPES = [
  ...INSURANCE_GUARANTOR_TYPES,
  COMPANY_GUARANTOR_TYPE,
] as const;

export type GuarantorType = (typeof ALL_GUARANTOR_TYPES)[number];
export type InsuranceGuarantorType = (typeof INSURANCE_GUARANTOR_TYPES)[number];
export type GuarantorCategory = "insurance" | "company";

export const GUARANTOR_CATEGORY_LABELS: Record<GuarantorCategory, string> = {
  insurance: "Asuransi",
  company: "Perusahaan Lainnya",
};

export const GUARANTOR_TYPE_LABELS: Record<GuarantorType, string> = {
  pribadi: "Umum/Pribadi",
  bpjs: "BPJS",
  asuransi: "Asuransi",
  pemerintah: "Pemerintah",
  perusahaan_lainnya: "Perusahaan Lainnya",
};

export const UNKNOWN_GUARANTOR_TYPE_LABEL = "Jenis penjamin tidak dikenal";

export function getGuarantorCategory(type: GuarantorType): GuarantorCategory {
  return type === COMPANY_GUARANTOR_TYPE ? "company" : "insurance";
}

export function isInsuranceGuarantorType(
  type: GuarantorType,
): type is InsuranceGuarantorType {
  return INSURANCE_GUARANTOR_TYPES.includes(type as InsuranceGuarantorType);
}

export function formatBooleanLabel(value: boolean): string {
  return value ? "Ya" : "Tidak";
}

export function formatGuarantorTypeLabel(type: string | null | undefined): string {
  if (!type) {
    return UNKNOWN_GUARANTOR_TYPE_LABEL;
  }

  return GUARANTOR_TYPE_LABELS[type as GuarantorType] ?? UNKNOWN_GUARANTOR_TYPE_LABEL;
}
