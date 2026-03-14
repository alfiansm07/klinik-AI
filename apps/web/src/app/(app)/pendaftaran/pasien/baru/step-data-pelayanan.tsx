"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  ClipboardPlus,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSelectedOptionLabel } from "@/lib/select-utils";
import { Textarea } from "@/components/ui/textarea";

import type { PatientSearchRow } from "../actions";
import {
  getServiceFormOptions,
  submitRegistration,
  type ServiceFormOptions,
} from "./service-actions";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VISIT_KIND_OPTIONS = [
  { value: "baru", label: "Baru" },
  { value: "lama", label: "Lama" },
] as const;

const VISIT_TYPE_OPTIONS = [
  { value: "sakit", label: "Sakit" },
  { value: "sehat", label: "Sehat" },
] as const;

const REGISTRATION_SOURCE_OPTIONS = [
  { value: "datang_langsung", label: "Datang Langsung" },
  { value: "telepon", label: "Telepon" },
  { value: "rujukan_internal", label: "Rujukan Internal" },
] as const;

const ALLERGY_OPTIONS = [
  { value: "tidak_ada", label: "Tidak Ada Alergi" },
  { value: "ada", label: "Ada Alergi" },
  { value: "belum_dikaji", label: "Belum Dikaji" },
] as const;

const NO_DOCTOR_VALUE = "__none__";

type VisitKind = (typeof VISIT_KIND_OPTIONS)[number]["value"];
type VisitType = (typeof VISIT_TYPE_OPTIONS)[number]["value"];
type RegistrationSource = (typeof REGISTRATION_SOURCE_OPTIONS)[number]["value"];
type AllergyStatus = (typeof ALLERGY_OPTIONS)[number]["value"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StepDataPelayananProps = {
  patient: PatientSearchRow;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepDataPelayanan({ patient }: StepDataPelayananProps) {
  const router = useRouter();
  // -- Server data (rooms, guarantors, doctors)
  const [options, setOptions] = useState<ServiceFormOptions | null>(null);
  const [optionsLoadError, setOptionsLoadError] = useState<string | null>(null);
  const [isLoadingOptions, startLoadOptions] = useTransition();

  const loadOptions = useCallback(() => {
    startLoadOptions(async () => {
      try {
        const data = await getServiceFormOptions();
        setOptions(data);
        setOptionsLoadError(null);
      } catch (error) {
        setOptions(null);
        setOptionsLoadError(
          error instanceof Error
            ? error.message
            : "Data pelayanan tidak dapat dimuat saat ini.",
        );
      }
    });
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // -- Form state
  const [visitDate, setVisitDate] = useState(() => getTodayString());
  const [visitKind, setVisitKind] = useState<VisitKind>("baru");
  const [visitType, setVisitType] = useState<VisitType>("sakit");
  const [registrationSource, setRegistrationSource] = useState<RegistrationSource>("datang_langsung");
  const [guarantorId, setGuarantorId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string>("");
  const [doctorCleared, setDoctorCleared] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [allergyStatus, setAllergyStatus] = useState<AllergyStatus>("belum_dikaji");
  const [allergyNote, setAllergyNote] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [frontOfficeNote, setFrontOfficeNote] = useState("");

  const [isPending, startSubmit] = useTransition();

  // -- Auto-select first guarantor if only one (usually "Umum")
  useEffect(() => {
    if (options && options.guarantors.length > 0 && !guarantorId) {
      setGuarantorId(options.guarantors[0].id);
    }
  }, [options, guarantorId]);

  useEffect(() => {
    if (!options) {
      return;
    }

    const hasGuarantor = options.guarantors.some(
      (guarantor) => guarantor.id === guarantorId,
    );
    if (guarantorId && !hasGuarantor) {
      setGuarantorId(options.guarantors[0]?.id ?? "");
    }

    const hasRoom = options.rooms.some((room) => room.id === roomId);
    if (roomId && !hasRoom) {
      setRoomId("");
    }

    const hasDoctor = options.doctors.some((doctor) => doctor.id === doctorId);
    if (doctorId && !hasDoctor) {
      setDoctorId("");
      setDoctorCleared(false);
    }
  }, [doctorId, guarantorId, options, roomId]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!roomId) {
        toast.error("Poli / Ruangan tujuan wajib dipilih");
        return;
      }

      if (!guarantorId) {
        toast.error("Penjamin wajib dipilih");
        return;
      }

      startSubmit(async () => {
        const result = await submitRegistration({
          patientId: patient.id,
          visitDate,
          visitKind,
          visitType,
          registrationSource,
          guarantorId,
          roomId,
          doctorId: doctorId || null,
          chiefComplaint: chiefComplaint.trim() || null,
          allergyStatus,
          allergyNote: allergyStatus === "ada" ? allergyNote.trim() || null : null,
          heightCm: heightCm ? Number(heightCm) : null,
          weightKg: weightKg ? Number(weightKg) : null,
          frontOfficeNote: frontOfficeNote.trim() || null,
        });

        if (!result.success) {
          toast.error(result.error ?? "Gagal menyimpan pendaftaran");
          return;
        }

        toast.success("Pendaftaran kunjungan berhasil disimpan");

        if (result.visitId) {
          router.push(`/pendaftaran/pasien/${result.visitId}`);
        }
      });
    },
    [
      patient.id,
      visitDate,
      visitKind,
      visitType,
      registrationSource,
      guarantorId,
      roomId,
      doctorId,
      chiefComplaint,
      allergyStatus,
      allergyNote,
      heightCm,
      weightKg,
      frontOfficeNote,
      router,
    ],
  );

  // -- Loading state for server options
  if (isLoadingOptions || !options) {
    if (optionsLoadError) {
      return (
        <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-5">
          <p className="text-sm font-medium text-foreground">
            Data pelayanan belum bisa dimuat
          </p>
          <p className="text-sm text-muted-foreground">{optionsLoadError}</p>
          <div>
            <Button type="button" variant="outline" onClick={loadOptions}>
              Coba Muat Ulang
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat data pelayanan...
      </div>
    );
  }

  const guarantorOptions = options.guarantors.map((guarantor) => ({
    value: guarantor.id,
    label: guarantor.name,
  }));
  const roomOptions = options.rooms.map((room) => ({
    value: room.id,
    label: room.name,
  }));
  const doctorOptions = options.doctors.map((doctor) => ({
    value: doctor.id,
    label: doctor.name,
  }));

  const hasGuarantorOptions = guarantorOptions.length > 0;
  const hasRoomOptions = roomOptions.length > 0;
  const hasDoctorOptions = doctorOptions.length > 0;

  const selectedGuarantorLabel = getSelectedOptionLabel(
    guarantorOptions,
    guarantorId,
  );
  const selectedRoomLabel = getSelectedOptionLabel(roomOptions, roomId);
  const selectedDoctorLabel = getSelectedOptionLabel(doctorOptions, doctorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Patient context banner ── */}
      <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-3 ring-1 ring-primary/15">
        <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
        <p className="min-w-0 truncate text-sm font-medium text-foreground">
          Kunjungan untuk{" "}
          <span className="font-semibold text-primary">{patient.name}</span>
          <span className="text-muted-foreground">
            {" "}— {patient.medicalRecordNumber}
          </span>
        </p>
      </div>

      {/* ── Fieldset: Data Kunjungan ── */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          Data Kunjungan
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Waktu kunjungan */}
          <div className="space-y-2">
            <Label htmlFor="visitDate">
              Tanggal Kunjungan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="visitDate"
              type="date"
              value={visitDate}
              max={getTodayString()}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>

          {/* Jenis kunjungan: baru / lama */}
          <div className="space-y-2">
            <Label htmlFor="visitKind">
              Kunjungan <span className="text-destructive">*</span>
            </Label>
            <Select value={visitKind} onValueChange={(v) => setVisitKind(v as VisitKind)}>
              <SelectTrigger id="visitKind" className="w-full">
                <SelectValue placeholder="Pilih jenis kunjungan" />
              </SelectTrigger>
              <SelectContent>
                {VISIT_KIND_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jenis pelayanan: sakit / sehat */}
          <div className="space-y-2">
            <Label htmlFor="visitType">
              Jenis Pelayanan <span className="text-destructive">*</span>
            </Label>
            <Select value={visitType} onValueChange={(v) => setVisitType(v as VisitType)}>
              <SelectTrigger id="visitType" className="w-full">
                <SelectValue placeholder="Pilih jenis pelayanan" />
              </SelectTrigger>
              <SelectContent>
                {VISIT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asal pendaftaran */}
          <div className="space-y-2">
            <Label htmlFor="registrationSource">
              Asal Pendaftaran <span className="text-destructive">*</span>
            </Label>
            <Select
              value={registrationSource}
              onValueChange={(v) => setRegistrationSource(v as RegistrationSource)}
            >
              <SelectTrigger id="registrationSource" className="w-full">
                <SelectValue placeholder="Pilih asal pendaftaran" />
              </SelectTrigger>
              <SelectContent>
                {REGISTRATION_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      {/* ── Fieldset: Tujuan Layanan ── */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ClipboardPlus className="h-4 w-4 text-primary" />
          Tujuan Layanan
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Penjamin */}
          <div className="space-y-2">
            <Label htmlFor="guarantorId">
              Penjamin <span className="text-destructive">*</span>
            </Label>
            <Select
              value={guarantorId || null}
              onValueChange={(v) => setGuarantorId(v ?? "")}
            >
              <SelectTrigger
                id="guarantorId"
                className="w-full"
                disabled={!hasGuarantorOptions}
              >
                <SelectValue>
                  {selectedGuarantorLabel ??
                    (hasGuarantorOptions ? "Pilih penjamin" : "Tidak ada data penjamin")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {hasGuarantorOptions ? (
                  guarantorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_guarantor__" disabled>
                    Tidak ada data penjamin
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Instalasi — fixed to Rawat Jalan in MVP */}
          <div className="space-y-2">
            <Label>Instalasi</Label>
            <Input
              value="Instalasi Rawat Jalan"
              disabled
              className="bg-muted"
            />
          </div>

          {/* Poli / Ruangan */}
          <div className="space-y-2">
            <Label htmlFor="roomId">
              Poli / Ruangan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={roomId || null}
              onValueChange={(v) => setRoomId(v ?? "")}
            >
              <SelectTrigger
                id="roomId"
                className="w-full"
                disabled={!hasRoomOptions}
              >
                <SelectValue>
                  {selectedRoomLabel ??
                    (hasRoomOptions ? "Pilih poli / ruangan" : "Tidak ada data poli / ruangan")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {hasRoomOptions ? (
                  roomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_room__" disabled>
                    Tidak ada data poli / ruangan
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tenaga Medis */}
          <div className="space-y-2">
            <Label htmlFor="doctorId">Tenaga Medis</Label>
            <Select
              value={doctorId || null}
              onValueChange={(v) => {
                if (v === NO_DOCTOR_VALUE) {
                  setDoctorId("");
                  setDoctorCleared(true);
                  return;
                }

                setDoctorId(v ?? "");
                setDoctorCleared(false);
              }}
            >
              <SelectTrigger id="doctorId" className="w-full">
                <SelectValue>
                  {selectedDoctorLabel ??
                    (doctorCleared
                      ? "Tanpa tenaga medis"
                      : hasDoctorOptions
                        ? "Pilih tenaga medis"
                        : "Tidak ada data tenaga medis")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_DOCTOR_VALUE}>
                  Tanpa tenaga medis
                </SelectItem>
                {!hasDoctorOptions ? (
                  <SelectItem value="__empty__" disabled>
                    Tidak ada data tenaga medis
                  </SelectItem>
                ) : (
                  doctorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      {/* ── Fieldset: Keluhan & Skrining Awal ── */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <AlertCircle className="h-4 w-4 text-primary" />
          Keluhan &amp; Skrining Awal
        </legend>

        {/* Keluhan utama */}
        <div className="space-y-2">
          <Label htmlFor="chiefComplaint">Keluhan Utama</Label>
          <Textarea
            id="chiefComplaint"
            placeholder="Alasan kedatangan singkat (untuk routing antrean)"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            className="min-h-20 resize-y"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Alergi dasar */}
          <div className="space-y-2">
            <Label htmlFor="allergyStatus">Alergi</Label>
            <Select
              value={allergyStatus}
              onValueChange={(v) => setAllergyStatus(v as AllergyStatus)}
            >
              <SelectTrigger id="allergyStatus" className="w-full">
                <SelectValue placeholder="Status alergi" />
              </SelectTrigger>
              <SelectContent>
                {ALLERGY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catatan alergi — only if ada alergi */}
          {allergyStatus === "ada" && (
            <div className="space-y-2">
              <Label htmlFor="allergyNote">Catatan Alergi</Label>
              <Input
                id="allergyNote"
                placeholder="Mis. Amoxicillin, seafood"
                value={allergyNote}
                onChange={(e) => setAllergyNote(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Skrining visual ringan */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="heightCm">Tinggi Badan (cm)</Label>
            <Input
              id="heightCm"
              type="number"
              inputMode="decimal"
              min={0}
              max={300}
              step="0.1"
              placeholder="Opsional"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weightKg">Berat Badan (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              inputMode="decimal"
              min={0}
              max={500}
              step="0.1"
              placeholder="Opsional"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
        </div>

        {/* Catatan front office */}
        <div className="space-y-2">
          <Label htmlFor="frontOfficeNote">Catatan Front Office</Label>
          <Textarea
            id="frontOfficeNote"
            placeholder="Catatan non-klinis untuk internal front office"
            value={frontOfficeNote}
            onChange={(e) => setFrontOfficeNote(e.target.value)}
            className="min-h-16 resize-y"
          />
        </div>
      </fieldset>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={isPending || !hasGuarantorOptions || !hasRoomOptions}
          className="min-w-40"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Daftarkan Kunjungan"
          )}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
