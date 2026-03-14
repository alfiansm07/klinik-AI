export type AssessmentWorklistStatus =
  | "menunggu_asesmen"
  | "draft"
  | "ready_for_doctor"
  | "priority_handover"
  | "observation";

export type AssessmentWorklistStatusSurface = {
  label: string;
  description: string;
  ctaLabel: "Mulai Skrining" | "Lanjutkan Skrining" | "Lihat Ringkasan";
  row: string;
  badge: string;
};

type AssessmentStatusSource = {
  visitStatus?: string | null;
  assessmentStatus?: string | null;
  disposition?: string | null;
};

export function getAssessmentWorklistStatusSurface(
  status: AssessmentWorklistStatus,
): AssessmentWorklistStatusSurface {
  switch (status) {
    case "menunggu_asesmen":
      return {
        label: "Menunggu asesmen",
        description: "Belum ada asesmen awal",
        ctaLabel: "Mulai Skrining",
        row: "bg-transparent",
        badge: "border-amber-500/25 bg-amber-500/12 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
      };
    case "draft":
      return {
        label: "Draft skrining",
        description: "Skrining belum final",
        ctaLabel: "Lanjutkan Skrining",
        row: "bg-transparent",
        badge: "border-cyan-500/25 bg-cyan-500/12 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200",
      };
    case "ready_for_doctor":
      return {
        label: "Siap ke Dokter",
        description: "Ringkasan perawat siap dibaca dokter",
        ctaLabel: "Lihat Ringkasan",
        row: "bg-transparent",
        badge: "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
      };
    case "priority_handover":
      return {
        label: "Serah Terima Prioritas",
        description: "Perlu evaluasi dokter segera",
        ctaLabel: "Lihat Ringkasan",
        row: "bg-transparent",
        badge: "border-rose-500/25 bg-rose-500/12 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
      };
    case "observation":
      return {
        label: "Observasi",
        description: "Pasien masih dipantau sebelum ke dokter",
        ctaLabel: "Lihat Ringkasan",
        row: "bg-transparent",
        badge: "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:border-slate-400/20 dark:bg-slate-400/10 dark:text-slate-200",
      };
  }
}

export function formatAssessmentStatusSummary(
  status: AssessmentWorklistStatus,
  summary?: string | null,
) {
  const normalizedSummary = summary?.trim();

  if (normalizedSummary) {
    return normalizedSummary;
  }

  return getAssessmentWorklistStatusSurface(status).description;
}

export function resolveAssessmentWorklistStatus({
  visitStatus,
  assessmentStatus,
  disposition,
}: AssessmentStatusSource): AssessmentWorklistStatus {
  if (visitStatus && isAssessmentWorklistStatus(visitStatus)) {
    return visitStatus;
  }

  if (assessmentStatus === "draft") {
    return "draft";
  }

  if (disposition && isAssessmentWorklistStatus(disposition)) {
    return disposition;
  }

  if (assessmentStatus === "finalized") {
    return "ready_for_doctor";
  }

  return "menunggu_asesmen";
}

export function isAssessmentWorklistStatus(value: string): value is AssessmentWorklistStatus {
  return [
    "menunggu_asesmen",
    "draft",
    "ready_for_doctor",
    "priority_handover",
    "observation",
  ].includes(value);
}
