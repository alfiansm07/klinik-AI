export const assessmentWizardSteps = [
  { id: "intake", label: "Intake" },
  { id: "risk", label: "Skrining Risiko" },
  { id: "vitals", label: "Tanda Vital" },
  { id: "exam", label: "Riwayat & Pemeriksaan" },
  { id: "handover", label: "Serah Terima ke Dokter" },
] as const;

export type AssessmentWizardStepId = (typeof assessmentWizardSteps)[number]["id"];
