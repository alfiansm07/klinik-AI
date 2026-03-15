const REQUIRED_EMPLOYEE_COLUMNS = [
  "id",
  "clinic_id",
  "code",
  "nik",
  "nip",
  "full_name",
  "title_prefix",
  "title_suffix",
  "gender",
  "birth_place",
  "birth_date",
  "religion",
  "marital_status",
  "address",
  "email",
  "phone",
  "position",
  "workplace_name",
  "parent_institution_name",
  "external_reference",
  "is_active",
] as const;

const REQUIRED_EMPLOYEE_LICENSE_COLUMNS = [
  "id",
  "clinic_id",
  "employee_id",
  "license_type",
  "license_number",
  "issued_date",
  "valid_until",
  "is_lifetime",
  "notes",
  "sort_order",
] as const;

export const PEGAWAI_SCHEMA_ERROR_MESSAGE =
  "Struktur tabel pegawai di database belum sesuai versi aplikasi. Jalankan migrasi database terbaru untuk membuka modul ini.";

export const PEGAWAI_SCHEMA_ACTION_ERROR_MESSAGE =
  "Modul pegawai belum siap digunakan. Jalankan migrasi database terbaru terlebih dahulu.";

export class PegawaiSchemaError extends Error {
  constructor() {
    super(PEGAWAI_SCHEMA_ERROR_MESSAGE);
    this.name = "PegawaiSchemaError";
  }
}

export function getPegawaiSchemaActionError() {
  return PEGAWAI_SCHEMA_ACTION_ERROR_MESSAGE;
}

export function readColumnNames(rows: ReadonlyArray<{ column_name: unknown }>) {
  return rows
    .map((row) => row.column_name)
    .filter((column): column is string => typeof column === "string");
}

export function hasRequiredEmployeeColumns(columns: readonly string[]) {
  return REQUIRED_EMPLOYEE_COLUMNS.every((column) => columns.includes(column));
}

export function hasRequiredEmployeeLicenseColumns(columns: readonly string[]) {
  return REQUIRED_EMPLOYEE_LICENSE_COLUMNS.every((column) => columns.includes(column));
}

export async function canReadPegawaiTables(
  getEmployeeColumns: () => Promise<readonly string[]>,
  getEmployeeLicenseColumns: () => Promise<readonly string[]>,
) {
  try {
    const [employeeColumns, employeeLicenseColumns] = await Promise.all([
      getEmployeeColumns(),
      getEmployeeLicenseColumns(),
    ]);

    return {
      employeeReady: hasRequiredEmployeeColumns(employeeColumns),
      employeeLicenseReady: hasRequiredEmployeeLicenseColumns(employeeLicenseColumns),
    };
  } catch {
    return {
      employeeReady: false,
      employeeLicenseReady: false,
    };
  }
}
