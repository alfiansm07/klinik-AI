export const ACTION_CATEGORY_VALUES = [
  "prosedur_terapeutik",
  "prosedur_diagnostik",
  "prosedur_pembedahan",
  "konseling",
  "edukasi",
  "pelayanan_psikiatri",
  "pelayanan_sosial",
  "terapi_chiropractic",
] as const;

export type ActionCategory = (typeof ACTION_CATEGORY_VALUES)[number];

export const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  prosedur_terapeutik: "Prosedur Terapeutik",
  prosedur_diagnostik: "Prosedur Diagnostik",
  prosedur_pembedahan: "Prosedur Pembedahan",
  konseling: "Konseling",
  edukasi: "Edukasi",
  pelayanan_psikiatri: "Pelayanan Psikiatri",
  pelayanan_sosial: "Pelayanan Sosial",
  terapi_chiropractic: "Terapi Chiropractic",
};

export const EMPTY_ACTION_CATEGORY_LABEL = "Tidak ada kategori";
export const UNKNOWN_ACTION_CATEGORY_LABEL = "Kategori tindakan tidak dikenal";

export function formatActionCategoryLabel(category: ActionCategory | null | undefined) {
  if (!category) {
    return EMPTY_ACTION_CATEGORY_LABEL;
  }

  return ACTION_CATEGORY_LABELS[category] ?? UNKNOWN_ACTION_CATEGORY_LABEL;
}
