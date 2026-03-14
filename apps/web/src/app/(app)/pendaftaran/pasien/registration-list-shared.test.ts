import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  CONSENT_FILTER_OPTIONS,
  formatRegistrationAssessmentStatus,
  getRegistrationPreviewDetail,
  getRegistrationStatusSurface,
  filterRegistrationRows,
  getDailyRegistrationPreviewRows,
  GUARANTOR_FILTER_OPTIONS,
  PAYMENT_FILTER_OPTIONS,
  ROOM_FILTER_OPTIONS,
  resolveRegistrationAssessmentStatus,
  SERVICE_FILTER_OPTIONS,
  SOURCE_FILTER_OPTIONS,
} from "./registration-list-shared";

describe("registration-list-shared", () => {
  test("provides preview rows for the registration list", () => {
    const rows = getDailyRegistrationPreviewRows();

    assert.equal(rows.length > 0, true);
    assert.equal(rows[0]?.registrationNumber, "0001");
    assert.equal(rows[0]?.printActions.length > 0, true);
  });

  test("filters rows by date and search query", () => {
    const rows = getDailyRegistrationPreviewRows();
    const filtered = filterRegistrationRows(rows, {
      search: "linawati",
      guarantor: "all",
      paymentStatus: "all",
      registrationSource: "all",
      room: "all",
      examination: "all",
      service: "all",
      consentStatus: "all",
      date: getDailyRegistrationPreviewRows()[0]?.registrationDate ?? "",
    });

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.patientName, "LINAWATI");
  });

  test("filters rows by multiple HIS-style filters", () => {
    const rows = getDailyRegistrationPreviewRows();
    const filtered = filterRegistrationRows(rows, {
      search: "",
      guarantor: "all",
      paymentStatus: "sudah_bayar",
      registrationSource: "walk_in",
      room: "umum",
      examination: "sedang_diperiksa",
      service: "pendaftaran",
      consentStatus: "belum",
      date: rows[0]?.registrationDate ?? "",
    });

    assert.deepEqual(filtered.map((row) => row.registrationNumber), ["0002"]);
  });

  test("returns expected surface styles for each status", () => {
    assert.equal(getRegistrationStatusSurface("belum_diperiksa").row, "bg-background");
    assert.equal(getRegistrationStatusSurface("sedang_diperiksa").badge.includes("rose"), true);
    assert.equal(getRegistrationStatusSurface("sudah_diperiksa").badge.includes("lime"), true);
  });

  test("formats assessment CTA and screening labels for registration detail", () => {
    assert.deepEqual(formatRegistrationAssessmentStatus("menunggu_asesmen"), {
      screeningLabel: "Belum skrining",
      screeningNote: "Menunggu asesmen awal",
      actionLabel: "Mulai Skrining",
    });

    assert.deepEqual(formatRegistrationAssessmentStatus("draft", "Draft tanda vital tersimpan"), {
      screeningLabel: "Draft skrining",
      screeningNote: "Draft tanda vital tersimpan",
      actionLabel: "Lanjutkan Skrining",
    });

    assert.deepEqual(formatRegistrationAssessmentStatus("ready_for_doctor", "Siap dibaca dokter"), {
      screeningLabel: "Siap ke Dokter",
      screeningNote: "Siap dibaca dokter",
      actionLabel: "Lihat Ringkasan",
    });

    assert.deepEqual(formatRegistrationAssessmentStatus("priority_handover", "Perlu evaluasi dokter segera"), {
      screeningLabel: "Serah Terima Prioritas",
      screeningNote: "Perlu evaluasi dokter segera",
      actionLabel: "Lihat Ringkasan",
    });

    assert.deepEqual(formatRegistrationAssessmentStatus("observation"), {
      screeningLabel: "Observasi",
      screeningNote: "Pasien masih dipantau sebelum ke dokter",
      actionLabel: "Lihat Ringkasan",
    });
  });

  test("resolves registration assessment fallback status from visit and assessment state", () => {
    assert.equal(resolveRegistrationAssessmentStatus({ visitStatus: "menunggu_asesmen" }), "menunggu_asesmen");
    assert.equal(
      resolveRegistrationAssessmentStatus({
        visitStatus: "registered",
        assessmentStatus: "draft",
        disposition: null,
      }),
      "draft",
    );
    assert.equal(
      resolveRegistrationAssessmentStatus({
        visitStatus: "registered",
        assessmentStatus: "finalized",
        disposition: "ready_for_doctor",
      }),
      "ready_for_doctor",
    );
    assert.equal(
      resolveRegistrationAssessmentStatus({
        visitStatus: "registered",
        assessmentStatus: null,
        disposition: null,
      }),
      "menunggu_asesmen",
    );
  });

  test("returns preview detail by id", () => {
    const detail = getRegistrationPreviewDetail("reg-001");

    assert.equal(detail?.registrationId, "5");
    assert.equal(detail?.serviceRows.length, 1);
  });

  test("returns null for unknown detail id", () => {
    assert.equal(getRegistrationPreviewDetail("missing"), null);
  });

  test("keeps filter option labels stable", () => {
    assert.equal(GUARANTOR_FILTER_OPTIONS[0]?.label, "- Asuransi -");
    assert.equal(PAYMENT_FILTER_OPTIONS[0]?.label, "- Status Pembayaran -");
    assert.equal(SOURCE_FILTER_OPTIONS[0]?.label, "- Asal Pendaftaran -");
    assert.equal(ROOM_FILTER_OPTIONS[0]?.label, "- Semua Ruangan -");
    assert.equal(SERVICE_FILTER_OPTIONS[0]?.label, "- Semua Pelayanan -");
    assert.equal(CONSENT_FILTER_OPTIONS[0]?.label, "- Semua Status General Consent -");
  });
});
