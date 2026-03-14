export const JABATAN_OPTIONS = [
  { key: "staf_non_medis", label: "Staf Non Medis" },
  { key: "kepala_labkesda", label: "Kepala Labkesda" },
  { key: "nutrisionist_dan_dietfisien", label: "Nutrisionist dan Dietfisien" },
  { key: "apoteker", label: "Apoteker" },
  { key: "asisten_apoteker", label: "Asisten Apoteker" },
  { key: "analis_farmasi", label: "Analis Farmasi" },
  { key: "perawat", label: "Perawat" },
  { key: "perawat_gigi", label: "Perawat Gigi" },
  { key: "bidan", label: "Bidan" },
  { key: "perawat_anestesi", label: "Perawat Anestesi" },
  { key: "epidemiolog_kesehatan", label: "Epidemiolog Kesehatan" },
  { key: "entomolog_kesehatan", label: "Entomolog Kesehatan" },
  { key: "sanitarian", label: "Sanitarian" },
  { key: "penyuluh_kesehatan", label: "Penyuluh Kesehatan" },
  {
    key: "ahli_teknologi_laboratorium_medik",
    label: "Ahli Teknologi Laboratorium Medik",
  },
  { key: "radiografi", label: "Radiografi" },
  { key: "teknisi_gigi", label: "Teknisi Gigi" },
  { key: "teknisi_elektromedis", label: "Teknisi Elektromedis" },
  { key: "refraksionis_optisien", label: "Refraksionis Optisien" },
] as const;

export type JabatanKey = (typeof JABATAN_OPTIONS)[number]["key"];

export const JABATAN_LABELS: Record<JabatanKey, string> = Object.fromEntries(
  JABATAN_OPTIONS.map((option) => [option.key, option.label]),
) as Record<JabatanKey, string>;

export const UNKNOWN_JABATAN_LABEL = "-";

export const PEGAWAI_GENDER_OPTIONS = [
  { value: "laki_laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
] as const;

export const PEGAWAI_RELIGION_OPTIONS = [
  { value: "islam", label: "Islam" },
  { value: "kristen", label: "Kristen" },
  { value: "katolik", label: "Katolik" },
  { value: "hindu", label: "Hindu" },
  { value: "buddha", label: "Buddha" },
  { value: "konghucu", label: "Konghucu" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export const PEGAWAI_MARITAL_STATUS_OPTIONS = [
  { value: "belum_kawin", label: "Belum Kawin" },
  { value: "kawin", label: "Kawin" },
  { value: "cerai_hidup", label: "Cerai Hidup" },
  { value: "cerai_mati", label: "Cerai Mati" },
] as const;

export const PEGAWAI_LICENSE_TYPE_OPTIONS = [
  { value: "str", label: "STR" },
  { value: "sip", label: "SIP" },
  { value: "sik", label: "SIK" },
  { value: "sipa", label: "SIPA" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export type PegawaiGender = (typeof PEGAWAI_GENDER_OPTIONS)[number]["value"];
export type PegawaiReligion = (typeof PEGAWAI_RELIGION_OPTIONS)[number]["value"];
export type PegawaiMaritalStatus =
  (typeof PEGAWAI_MARITAL_STATUS_OPTIONS)[number]["value"];
export type PegawaiLicenseType =
  (typeof PEGAWAI_LICENSE_TYPE_OPTIONS)[number]["value"];

export const PEGAWAI_GENDER_LABELS: Record<PegawaiGender, string> = Object.fromEntries(
  PEGAWAI_GENDER_OPTIONS.map((option) => [option.value, option.label]),
) as Record<PegawaiGender, string>;

export const PEGAWAI_RELIGION_LABELS: Record<PegawaiReligion, string> = Object.fromEntries(
  PEGAWAI_RELIGION_OPTIONS.map((option) => [option.value, option.label]),
) as Record<PegawaiReligion, string>;

export const PEGAWAI_MARITAL_STATUS_LABELS: Record<PegawaiMaritalStatus, string> =
  Object.fromEntries(
    PEGAWAI_MARITAL_STATUS_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<PegawaiMaritalStatus, string>;

export const PEGAWAI_LICENSE_TYPE_LABELS: Record<PegawaiLicenseType, string> =
  Object.fromEntries(
    PEGAWAI_LICENSE_TYPE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<PegawaiLicenseType, string>;
