import {
  formatAssessmentStatusSummary,
  getAssessmentWorklistStatusSurface,
  resolveAssessmentWorklistStatus,
  type AssessmentWorklistStatus,
} from "../../pelayanan/asesmen-awal/worklist-shared";

export type RegistrationStatus = "belum_diperiksa" | "sedang_diperiksa" | "sudah_diperiksa";

export type RegistrationGuarantor = "umum" | "bpjs" | "asuransi";

export type RegistrationPaymentStatus = "sudah_bayar" | "belum_bayar";

export type RegistrationConsentStatus = "belum" | "sudah";

export type RegistrationPrintAction = {
  id: string;
  label: string;
};

export type RegistrationAssessmentStatusSurface = {
  screeningLabel: string;
  screeningNote: string;
  actionLabel: "Mulai Skrining" | "Lanjutkan Skrining" | "Lihat Ringkasan";
};

export type DailyRegistrationRow = {
  id: string;
  rowNumber: number;
  registrationId: string;
  registrationNumber: string;
  registrationDateTime: string;
  registrationDate: string;
  arrivalTime: string;
  patientName: string;
  patientIdLabel: string;
  nik: string;
  medicalRecordNumber: string;
  legacyMedicalRecordNumber: string;
  genderLabel: string;
  birthDateLabel: string;
  ageLabel: string;
  addressLabel: string;
  specialConditionLabel: string;
  roomLabel: string;
  guarantor: RegistrationGuarantor;
  guarantorLabel: string;
  paymentStatus: RegistrationPaymentStatus;
  paymentStatusLabel: string;
  bpjsStatusLabel: string;
  registrationSource: "e_clinic" | "walk_in" | "rujukan_internal";
  visitKindLabel: string;
  serviceStatusLabel: string;
  consentStatus: RegistrationConsentStatus;
  consentStatusLabel: string;
  status: RegistrationStatus;
  statusLegendLabel: string;
  assessmentStatus?: AssessmentWorklistStatus;
  assessmentSummary?: string;
  assessmentActionLabel?: RegistrationAssessmentStatusSurface["actionLabel"];
  printActions: RegistrationPrintAction[];
};

export type RegistrationDetail = {
  id: string;
  registrationId: string;
  registrationDateTime: string;
  queueNumber: string;
  patientInfoLines: string[];
  allergyGroups: Array<{ label: string; values: string[] }>;
  ageLabel: string;
  visitKindLabel: string;
  guarantorLabel: string;
  paymentStatusLabel: string;
  referralSourceLabel: string;
  referrerNameLabel: string;
  createdByLabel: string;
  updatedByLabel: string;
  serviceRows: Array<{
    id: string;
    registrationDateTime: string;
    installationLabel: string;
    roomLabel: string;
    screeningLabel: string;
    actionLabel?: RegistrationAssessmentStatusSurface["actionLabel"];
    actionHref?: string;
  }>;
  screeningRows: Array<{
    id: string;
    screeningLabel: string;
    dateLabel: string;
    noteLabel: string;
    actionLabel?: RegistrationAssessmentStatusSurface["actionLabel"];
    actionHref?: string;
  }>;
  sameDayHistoryRows: Array<{
    id: string;
    dateLabel: string;
    roomLabel: string;
  }>;
  actionButtons: Array<{ id: string; label: string; tone: "default" | "outline" | "success" | "danger" }>;
};

export type RegistrationFilterValues = {
  search: string;
  guarantor: "all" | RegistrationGuarantor;
  paymentStatus: "all" | RegistrationPaymentStatus;
  registrationSource: "all" | "e_clinic" | "walk_in" | "rujukan_internal";
  room: "all" | "umum" | "kia" | "gigi";
  examination: "all" | "belum_diperiksa" | "sedang_diperiksa" | "sudah_diperiksa";
  service: "all" | "berobat_jalan" | "pendaftaran" | "kunjungan_sehat";
  consentStatus: "all" | RegistrationConsentStatus;
  date: string;
};

export const DEFAULT_REGISTRATION_WORKING_DATE = getTodayDateString();

export const GUARANTOR_FILTER_OPTIONS = [
  { value: "all", label: "- Asuransi -" },
  { value: "umum", label: "Umum" },
  { value: "bpjs", label: "BPJS" },
  { value: "asuransi", label: "Asuransi" },
] as const;

export const PAYMENT_FILTER_OPTIONS = [
  { value: "all", label: "- Status Pembayaran -" },
  { value: "sudah_bayar", label: "Sudah bayar" },
  { value: "belum_bayar", label: "Belum bayar" },
] as const;

export const SOURCE_FILTER_OPTIONS = [
  { value: "all", label: "- Asal Pendaftaran -" },
  { value: "e_clinic", label: "e-Clinic" },
  { value: "walk_in", label: "Datang Langsung" },
  { value: "rujukan_internal", label: "Rujukan Internal" },
] as const;

export const ROOM_FILTER_OPTIONS = [
  { value: "all", label: "- Semua Ruangan -" },
  { value: "umum", label: "UMUM" },
  { value: "kia", label: "KIA" },
  { value: "gigi", label: "GIGI" },
] as const;

export const EXAMINATION_FILTER_OPTIONS = [
  { value: "all", label: "- Semua Pemeriksaan -" },
  { value: "belum_diperiksa", label: "Belum Diperiksa" },
  { value: "sedang_diperiksa", label: "Sedang Diperiksa" },
  { value: "sudah_diperiksa", label: "Sudah Diperiksa" },
] as const;

export const SERVICE_FILTER_OPTIONS = [
  { value: "all", label: "- Semua Pelayanan -" },
  { value: "berobat_jalan", label: "Berobat Jalan" },
  { value: "pendaftaran", label: "Pendaftaran" },
  { value: "kunjungan_sehat", label: "Kunjungan Sehat" },
] as const;

export const CONSENT_FILTER_OPTIONS = [
  { value: "all", label: "- Semua Status General Consent -" },
  { value: "belum", label: "Belum" },
  { value: "sudah", label: "Sudah" },
] as const;

const PREVIEW_ROWS: DailyRegistrationRow[] = [
  {
    id: "reg-001",
    rowNumber: 1,
    registrationId: "5",
    registrationNumber: "0001",
    registrationDateTime: `${DEFAULT_REGISTRATION_WORKING_DATE} 08:31:09`,
    registrationDate: DEFAULT_REGISTRATION_WORKING_DATE,
    arrivalTime: "08:31:09",
    patientName: "SITI MARYANTI",
    patientIdLabel: "eRm : 17755381",
    nik: "-",
    medicalRecordNumber: "-",
    legacyMedicalRecordNumber: "-",
    genderLabel: "Perempuan",
    birthDateLabel: "04-08-1997",
    ageLabel: "28 Thn 7 Bln 5 Hr",
    addressLabel: "RT. / RW.",
    specialConditionLabel: "-",
    roomLabel: "UMUM",
    guarantor: "umum",
    guarantorLabel: "Umum",
    paymentStatus: "sudah_bayar",
    paymentStatusLabel: "Sudah bayar",
    bpjsStatusLabel: "-",
    registrationSource: "e_clinic",
    visitKindLabel: "LAMA",
    serviceStatusLabel: "Berobat Jalan",
    consentStatus: "belum",
    consentStatusLabel: "Belum",
    status: "sudah_diperiksa",
    statusLegendLabel: "Sudah Diperiksa",
    printActions: [
      { id: "general-consent", label: "General Consent" },
      { id: "izin-khitan", label: "Izin Khitan" },
      { id: "pernyataan-khitan", label: "Pernyataan Khitan" },
      { id: "catatan-kencing", label: "Catatan Kencing" },
    ],
  },
  {
    id: "reg-002",
    rowNumber: 2,
    registrationId: "6",
    registrationNumber: "0002",
    registrationDateTime: `${DEFAULT_REGISTRATION_WORKING_DATE} 23:06:54`,
    registrationDate: DEFAULT_REGISTRATION_WORKING_DATE,
    arrivalTime: "23:06:54",
    patientName: "LINAWATI",
    patientIdLabel: "eRm : 17755188",
    nik: "-",
    medicalRecordNumber: "-",
    legacyMedicalRecordNumber: "-",
    genderLabel: "Perempuan",
    birthDateLabel: "08-03-1964",
    ageLabel: "62 Thn 0 Bln 1 Hr",
    addressLabel: "RT. / RW.",
    specialConditionLabel: "-",
    roomLabel: "UMUM",
    guarantor: "umum",
    guarantorLabel: "Umum",
    paymentStatus: "sudah_bayar",
    paymentStatusLabel: "Sudah bayar",
    bpjsStatusLabel: "-",
    registrationSource: "walk_in",
    visitKindLabel: "LAMA",
    serviceStatusLabel: "Pendaftaran",
    consentStatus: "belum",
    consentStatusLabel: "Belum",
    status: "sedang_diperiksa",
    statusLegendLabel: "Sedang Diperiksa",
    printActions: [{ id: "general-consent", label: "General Consent" }],
  },
];

const PREVIEW_DETAILS: Record<string, RegistrationDetail> = {
  "reg-001": {
    id: "reg-001",
    registrationId: "5",
    registrationDateTime: `${DEFAULT_REGISTRATION_WORKING_DATE} 08:31:09`,
    queueNumber: "-0001",
    patientInfoLines: [
      "ID: 17755381",
      "NIK:",
      "SITI MARYANTI",
      "Perempuan",
      "04-08-1997",
      "-",
      "No RM Lama:",
    ],
    allergyGroups: [
      { label: "Obat", values: ["Tidak Ada"] },
      { label: "Makanan", values: ["Tidak Ada"] },
      { label: "Udara", values: ["Tidak Ada"] },
      { label: "Umum", values: ["Tidak Ada"] },
    ],
    ageLabel: "28 Thn 7 Bln 5 Hr",
    visitKindLabel: "LAMA",
    guarantorLabel: "Umum",
    paymentStatusLabel: "Sudah bayar",
    referralSourceLabel: "-",
    referrerNameLabel: "-",
    createdByLabel: `${DEFAULT_REGISTRATION_WORKING_DATE} 08:31:09 / zaroh3`,
    updatedByLabel: `${DEFAULT_REGISTRATION_WORKING_DATE} 08:31:09 / zaroh3`,
    serviceRows: [
      {
        id: "service-001",
        registrationDateTime: `${DEFAULT_REGISTRATION_WORKING_DATE} 08:31:09`,
        installationLabel: "Rawat Jalan",
        roomLabel: "UMUM",
        screeningLabel: "-",
      },
    ],
    screeningRows: [],
    sameDayHistoryRows: [
      {
        id: "history-001",
        dateLabel: `${DEFAULT_REGISTRATION_WORKING_DATE} 08:31:09`,
        roomLabel: "UMUM",
      },
    ],
    actionButtons: [
      { id: "lihat-semua", label: "Lihat Semua", tone: "outline" },
      { id: "lihat-riwayat", label: "Lihat Riwayat", tone: "outline" },
      { id: "pembayaran", label: "Pembayaran", tone: "outline" },
      { id: "cetak-surat", label: "Cetak Surat Berobat", tone: "success" },
      { id: "cetak", label: "Cetak", tone: "default" },
      { id: "ubah-pasien", label: "Ubah Pasien", tone: "outline" },
      { id: "ubah", label: "Ubah", tone: "default" },
    ],
  },
  "reg-002": {
    id: "reg-002",
    registrationId: "6",
    registrationDateTime: `${DEFAULT_REGISTRATION_WORKING_DATE} 23:06:54`,
    queueNumber: "-0002",
    patientInfoLines: [
      "ID: 17755188",
      "NIK:",
      "LINAWATI",
      "Perempuan",
      "08-03-1964",
      "-",
      "No RM Lama:",
    ],
    allergyGroups: [
      { label: "Obat", values: ["Tidak Ada"] },
      { label: "Makanan", values: ["Tidak Ada"] },
      { label: "Udara", values: ["Tidak Ada"] },
      { label: "Umum", values: ["Tidak Ada"] },
    ],
    ageLabel: "62 Thn 0 Bln 1 Hr",
    visitKindLabel: "LAMA",
    guarantorLabel: "Umum",
    paymentStatusLabel: "Sudah bayar",
    referralSourceLabel: "-",
    referrerNameLabel: "-",
    createdByLabel: `${DEFAULT_REGISTRATION_WORKING_DATE} 23:06:54 / zaroh3`,
    updatedByLabel: `${DEFAULT_REGISTRATION_WORKING_DATE} 23:06:54 / zaroh3`,
    serviceRows: [
      {
        id: "service-002",
        registrationDateTime: `${DEFAULT_REGISTRATION_WORKING_DATE} 23:06:54`,
        installationLabel: "Rawat Jalan",
        roomLabel: "UMUM",
        screeningLabel: "-",
      },
    ],
    screeningRows: [],
    sameDayHistoryRows: [
      {
        id: "history-002",
        dateLabel: `${DEFAULT_REGISTRATION_WORKING_DATE} 23:06:54`,
        roomLabel: "UMUM",
      },
    ],
    actionButtons: [
      { id: "lihat-semua", label: "Lihat Semua", tone: "outline" },
      { id: "lihat-riwayat", label: "Lihat Riwayat", tone: "outline" },
      { id: "pembayaran", label: "Pembayaran", tone: "outline" },
      { id: "cetak-surat", label: "Cetak Surat Berobat", tone: "success" },
      { id: "cetak", label: "Cetak", tone: "default" },
      { id: "ubah-pasien", label: "Ubah Pasien", tone: "outline" },
      { id: "ubah", label: "Ubah", tone: "default" },
    ],
  },
};

export function getDailyRegistrationPreviewRows(): DailyRegistrationRow[] {
  return PREVIEW_ROWS;
}

export function getRegistrationPreviewDetail(id: string): RegistrationDetail | null {
  return PREVIEW_DETAILS[id] ?? null;
}

export function filterRegistrationRows(rows: DailyRegistrationRow[], filters: RegistrationFilterValues) {
  const query = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.date && row.registrationDate !== filters.date) {
      return false;
    }

    if (filters.guarantor !== "all" && row.guarantor !== filters.guarantor) {
      return false;
    }

    if (filters.paymentStatus !== "all" && row.paymentStatus !== filters.paymentStatus) {
      return false;
    }

    if (filters.examination !== "all" && row.status !== filters.examination) {
      return false;
    }

    if (filters.service !== "all" && normalizeServiceFilter(row.serviceStatusLabel) !== filters.service) {
      return false;
    }

    if (filters.consentStatus !== "all" && row.consentStatus !== filters.consentStatus) {
      return false;
    }

    if (filters.room !== "all" && normalizeRoomFilter(row.roomLabel) !== filters.room) {
      return false;
    }

    if (filters.registrationSource !== "all" && row.registrationSource !== filters.registrationSource) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      row.registrationId,
      row.registrationNumber,
      row.registrationDateTime,
      row.patientName,
      row.nik,
      row.medicalRecordNumber,
      row.guarantorLabel,
      row.roomLabel,
      row.serviceStatusLabel,
    ].some((value) => value.toLowerCase().includes(query));
  });
}

export function getRegistrationStatusSurface(status: RegistrationStatus) {
  switch (status) {
    case "belum_diperiksa":
      return {
        row: "bg-background",
        badge: "border-slate-300 bg-white text-slate-700",
      } as const;
    case "sedang_diperiksa":
      return {
        row: "bg-rose-50/70",
        badge: "border-rose-200 bg-rose-100 text-rose-700",
      } as const;
    case "sudah_diperiksa":
      return {
        row: "bg-lime-50/80",
        badge: "border-lime-200 bg-lime-100 text-lime-800",
      } as const;
  }
}

export function formatRegistrationAssessmentStatus(
  status: AssessmentWorklistStatus,
  summary?: string | null,
): RegistrationAssessmentStatusSurface {
  const surface = getAssessmentWorklistStatusSurface(status);
  const screeningNote = formatAssessmentStatusSummary(status, summary);

  if (status === "menunggu_asesmen") {
    return {
      screeningLabel: "Belum skrining",
      screeningNote: "Menunggu asesmen awal",
      actionLabel: surface.ctaLabel,
    };
  }

  return {
    screeningLabel: surface.label,
    screeningNote,
    actionLabel: surface.ctaLabel,
  };
}

export function resolveRegistrationAssessmentStatus({
  visitStatus,
  assessmentStatus,
  disposition,
}: {
  visitStatus?: string | null;
  assessmentStatus?: string | null;
  disposition?: string | null;
}) {
  return resolveAssessmentWorklistStatus({
    visitStatus,
    assessmentStatus,
    disposition,
  });
}

function normalizeServiceFilter(value: string) {
  if (value === "Berobat Jalan") return "berobat_jalan";
  if (value === "Pendaftaran") return "pendaftaran";
  return "kunjungan_sehat";
}

function normalizeRoomFilter(value: string) {
  if (value === "KIA") return "kia";
  if (value === "GIGI") return "gigi";
  return "umum";
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
