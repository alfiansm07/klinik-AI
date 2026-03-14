import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  formatAssessmentStatusSummary,
  getAssessmentWorklistStatusSurface,
  resolveAssessmentWorklistStatus,
} from "./worklist-shared";

describe("worklist-shared", () => {
  test("maps menunggu_asesmen to a waiting badge", () => {
    const surface = getAssessmentWorklistStatusSurface("menunggu_asesmen");

    assert.equal(surface.label, "Menunggu asesmen");
    assert.equal(surface.ctaLabel, "Mulai Skrining");
    assert.equal(surface.badge.includes("amber"), true);
  });

  test("maps draft to a continue-assessment badge", () => {
    const surface = getAssessmentWorklistStatusSurface("draft");

    assert.equal(surface.label, "Draft skrining");
    assert.equal(surface.ctaLabel, "Lanjutkan Skrining");
    assert.equal(surface.badge.includes("cyan"), true);
  });

  test("maps ready_for_doctor to a success badge", () => {
    const surface = getAssessmentWorklistStatusSurface("ready_for_doctor");

    assert.equal(surface.label, "Siap ke Dokter");
    assert.equal(surface.ctaLabel, "Lihat Ringkasan");
    assert.equal(surface.badge.includes("emerald"), true);
  });

  test("maps priority_handover to an urgent badge", () => {
    const surface = getAssessmentWorklistStatusSurface("priority_handover");

    assert.equal(surface.label, "Serah Terima Prioritas");
    assert.equal(surface.ctaLabel, "Lihat Ringkasan");
    assert.equal(surface.badge.includes("rose"), true);
  });

  test("maps observation to an observation badge", () => {
    const surface = getAssessmentWorklistStatusSurface("observation");

    assert.equal(surface.label, "Observasi");
    assert.equal(surface.ctaLabel, "Lihat Ringkasan");
    assert.equal(surface.badge.includes("slate"), true);
  });

  test("formats compact assessment status summaries", () => {
    assert.equal(formatAssessmentStatusSummary("menunggu_asesmen"), "Belum ada asesmen awal");
    assert.equal(
      formatAssessmentStatusSummary("draft", "Draft tersimpan oleh perawat jaga"),
      "Draft tersimpan oleh perawat jaga",
    );
    assert.equal(
      formatAssessmentStatusSummary("ready_for_doctor", "Siap ke dokter dengan nyeri sedang"),
      "Siap ke dokter dengan nyeri sedang",
    );
  });

  test("resolves fallback worklist status from assessment state", () => {
    assert.equal(resolveAssessmentWorklistStatus({ visitStatus: "draft" }), "draft");
    assert.equal(
      resolveAssessmentWorklistStatus({
        visitStatus: "registered",
        assessmentStatus: "draft",
        disposition: null,
      }),
      "draft",
    );
    assert.equal(
      resolveAssessmentWorklistStatus({
        visitStatus: "registered",
        assessmentStatus: "finalized",
        disposition: "ready_for_doctor",
      }),
      "ready_for_doctor",
    );
    assert.equal(
      resolveAssessmentWorklistStatus({
        visitStatus: "registered",
        assessmentStatus: null,
        disposition: null,
      }),
      "menunggu_asesmen",
    );
  });
});
