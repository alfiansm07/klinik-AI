import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  formatPatientAge,
  getDefaultPatientFormValues,
  normalizePatientFormInput,
  patientFormSchema,
} from "./patient-shared";

describe("patient-shared", () => {
  test("returns empty default form values", () => {
    assert.deepEqual(getDefaultPatientFormValues(), {
      nik: "",
      name: "",
      gender: "",
      dateOfBirth: "",
      mobilePhone: "",
      address: "",
    });
  });

  test("normalizes whitespace-only optional fields to null", () => {
    assert.deepEqual(
      normalizePatientFormInput({
        nik: "  3201234567890123  ",
        name: "  Siti Maryanti  ",
        gender: "perempuan",
        dateOfBirth: "1997-08-04",
        mobilePhone: "   ",
        address: "  ",
      }),
      {
        nik: "3201234567890123",
        name: "Siti Maryanti",
        gender: "perempuan",
        dateOfBirth: "1997-08-04",
        mobilePhone: null,
        address: null,
      },
    );
  });

  test("rejects blank patient name", () => {
    const result = patientFormSchema.safeParse({
      nik: "",
      name: "  ",
      gender: "laki_laki",
      dateOfBirth: "1990-01-01",
      mobilePhone: "",
      address: "",
    });

    assert.equal(result.success, false);
  });

  test("rejects future date of birth", () => {
    const result = patientFormSchema.safeParse({
      nik: "",
      name: "Budi",
      gender: "laki_laki",
      dateOfBirth: "2999-01-01",
      mobilePhone: "",
      address: "",
    });

    assert.equal(result.success, false);
  });

  test("accepts a normal valid date of birth", () => {
    const result = patientFormSchema.safeParse({
      nik: "",
      name: "Budi",
      gender: "laki_laki",
      dateOfBirth: "1990-01-01",
      mobilePhone: "",
      address: "",
    });

    assert.equal(result.success, true);
  });

  test("accepts empty nik", () => {
    const result = patientFormSchema.safeParse({
      nik: "",
      name: "Budi",
      gender: "laki_laki",
      dateOfBirth: "1990-01-01",
      mobilePhone: "",
      address: "",
    });

    assert.equal(result.success, true);
  });

  test("rejects nik with invalid length", () => {
    const result = patientFormSchema.safeParse({
      nik: "12345",
      name: "Budi",
      gender: "laki_laki",
      dateOfBirth: "1990-01-01",
      mobilePhone: "",
      address: "",
    });

    assert.equal(result.success, false);
  });

  test("rejects impossible calendar dates", () => {
    const result = patientFormSchema.safeParse({
      nik: "",
      name: "Budi",
      gender: "laki_laki",
      dateOfBirth: "2026-02-31",
      mobilePhone: "",
      address: "",
    });

    assert.equal(result.success, false);
  });

  test("rejects submit when gender is not chosen", () => {
    const result = patientFormSchema.safeParse({
      nik: "",
      name: "Budi",
      gender: "",
      dateOfBirth: "1990-01-01",
      mobilePhone: "",
      address: "",
    });

    assert.equal(result.success, false);
  });

  test("formats age in years and months", () => {
    assert.equal(
      formatPatientAge("2020-01-15", new Date("2026-03-09T00:00:00")),
      "6 thn 1 bln",
    );
  });
});
