import type {
  roomInstallationEnum,
  roomVisitTypeEnum,
} from "@klinik-AI/db/schema/master";

export type RoomVisitType = (typeof roomVisitTypeEnum.enumValues)[number];
export type RoomInstallation = (typeof roomInstallationEnum.enumValues)[number];

export const VISIT_TYPE_LABELS: Record<RoomVisitType, string> = {
  rawat_jalan: "Rawat Jalan",
};

export const INSTALLATION_LABELS: Record<RoomInstallation, string> = {
  instalasi_rawat_jalan: "Instalasi Rawat Jalan",
  instalasi_farmasi: "Instalasi Farmasi",
  instalasi_laboratorium: "Instalasi Laboratorium",
  instalasi_radiologi: "Instalasi Radiologi",
};
