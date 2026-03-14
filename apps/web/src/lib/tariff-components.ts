export const TARIFF_COMPONENT_FEE_KEYS = [
  "clinic_fee",
  "other_fee",
  "doctor_fee",
  "midwife_fee",
  "nurse_fee",
] as const;

export type TariffComponentFeeKey = (typeof TARIFF_COMPONENT_FEE_KEYS)[number];

export type TariffComponentFieldName =
  | "clinicFee"
  | "otherFee"
  | "doctorFee"
  | "midwifeFee"
  | "nurseFee";

export type TariffComponentDefinition = {
  feeKey: TariffComponentFeeKey;
  fieldName: TariffComponentFieldName;
  code: string;
  name: string;
  sortOrder: number;
};

export type TariffComponentLookup = TariffComponentDefinition & {
  isActive: boolean;
};

export type TariffComponentSeed = {
  feeKey: TariffComponentFeeKey | null;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export const DEFAULT_TARIFF_COMPONENTS: readonly TariffComponentDefinition[] = [
  {
    feeKey: "clinic_fee",
    fieldName: "clinicFee",
    code: "001",
    name: "Jasa Sarana",
    sortOrder: 1,
  },
  {
    feeKey: "other_fee",
    fieldName: "otherFee",
    code: "002",
    name: "Jasa Pelayanan",
    sortOrder: 2,
  },
  {
    feeKey: "doctor_fee",
    fieldName: "doctorFee",
    code: "1001",
    name: "Jasa Dokter",
    sortOrder: 3,
  },
  {
    feeKey: "midwife_fee",
    fieldName: "midwifeFee",
    code: "1002",
    name: "Jasa Bidan",
    sortOrder: 4,
  },
  {
    feeKey: "nurse_fee",
    fieldName: "nurseFee",
    code: "1003",
    name: "Jasa Perawat",
    sortOrder: 5,
  },
] as const;

export function getDefaultTariffComponentDefinition(
  feeKey: TariffComponentFeeKey,
): TariffComponentDefinition {
  return (
    DEFAULT_TARIFF_COMPONENTS.find((component) => component.feeKey === feeKey) ??
    DEFAULT_TARIFF_COMPONENTS[0]
  );
}

export function getMissingTariffComponentDefinition(
  existingFeeKeys: TariffComponentFeeKey[],
): TariffComponentDefinition | null {
  return (
    DEFAULT_TARIFF_COMPONENTS.find(
      (component) => !existingFeeKeys.includes(component.feeKey),
    ) ?? null
  );
}

export function mergeTariffComponents(
  components: TariffComponentSeed[],
): TariffComponentLookup[] {
  return DEFAULT_TARIFF_COMPONENTS.map((definition) => {
    const override = components.find(
      (component) => component.feeKey === definition.feeKey,
    );

    return {
      ...definition,
      code: override?.code ?? definition.code,
      name: override?.name ?? definition.name,
      sortOrder: override?.sortOrder ?? definition.sortOrder,
      isActive: override?.isActive ?? true,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}
