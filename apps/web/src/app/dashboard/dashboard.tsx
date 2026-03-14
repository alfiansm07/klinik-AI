"use client";

import Link from "next/link";
import {
  Activity,
  BriefcaseMedical,
  CalendarClock,
  ClipboardList,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardProps = {
  userName: string;
  clinicName: string;
  role: string;
};

type Tone = "primary" | "info" | "success" | "warning";

const statCards = [
  {
    title: "Pasien Hari Ini",
    value: "24",
    detail: "4 pasien menunggu verifikasi awal.",
    icon: Users,
    tone: "info",
    badge: "Target < 10 menit",
  },
  {
    title: "Kunjungan Aktif",
    value: "8",
    detail: "2 pasien sedang di ruang tindakan.",
    icon: Stethoscope,
    tone: "primary",
    badge: "2 butuh tindakan",
  },
  {
    title: "Resep Siap Tebus",
    value: "6",
    detail: "Farmasi perlu menutup 3 resep dalam 30 menit.",
    icon: Pill,
    tone: "success",
    badge: "3 prioritas cepat",
  },
  {
    title: "Klaim Perlu Review",
    value: "3",
    detail: "Pastikan data penjamin lengkap sebelum tutup shift.",
    icon: ShieldCheck,
    tone: "warning",
    badge: "Butuh validasi manual",
  },
] as const satisfies readonly {
  title: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone: Tone;
  badge: string;
}[];

const focusItems = [
  {
    title: "Jaga ritme antrian pagi",
    detail: "Pastikan waktu tunggu awal tidak melewati 10 menit per pasien agar triase tetap lancar.",
    tone: "info",
  },
  {
    title: "Antisipasi stok obat cepat habis",
    detail: "Cek obat kronis dan item fast moving sebelum jam sibuk sore dimulai.",
    tone: "success",
  },
  {
    title: "Validasi kesiapan ruang tindakan",
    detail: "Konfirmasi peralatan dan pergantian dokter jaga supaya layanan tetap mulus.",
    tone: "warning",
  },
] as const satisfies readonly {
  title: string;
  detail: string;
  tone: Tone;
}[];

const serviceOverview = [
  {
    label: "Poli Umum",
    value: "12 pasien",
    note: "Arus paling tinggi pagi ini.",
    tone: "info",
  },
  {
    label: "Laboratorium",
    value: "5 order",
    note: "2 hasil perlu validasi dokter.",
    tone: "warning",
  },
  {
    label: "Kasir",
    value: "9 transaksi",
    note: "Mayoritas pembayaran non-tunai.",
    tone: "primary",
  },
  {
    label: "Farmasi",
    value: "14 item",
    note: "Obat kronis paling banyak diminta.",
    tone: "success",
  },
] as const satisfies readonly {
  label: string;
  value: string;
  note: string;
  tone: Tone;
}[];

const workflowSteps = [
  {
    title: "Registrasi dan triase",
    detail: "Pastikan data pasien baru dan penjamin diverifikasi sebelum diarahkan ke poli.",
  },
  {
    title: "Pelayanan klinis",
    detail: "Pantau antrean dokter, status EMR, dan kebutuhan tindakan tambahan dari dashboard tim.",
  },
  {
    title: "Farmasi dan pembayaran",
    detail: "Sinkronkan resep, stok obat, dan transaksi kasir agar pasien selesai dalam satu alur.",
  },
] as const;

const shiftHighlights = [
  {
    label: "Respon triase",
    value: "8 menit",
    note: "Masih dalam ambang aman.",
    tone: "info",
  },
  {
    label: "Kesiapan tim",
    value: "92%",
    note: "1 ruang tindakan sedang disiapkan.",
    tone: "success",
  },
  {
    label: "Administrasi rawan",
    value: "3 kasus",
    note: "Fokus di klaim penjamin dan checkout akhir.",
    tone: "warning",
  },
] as const satisfies readonly {
  label: string;
  value: string;
  note: string;
  tone: Tone;
}[];

const agendaItems = [
  {
    time: "08.00",
    title: "Briefing pembuka",
    detail: "Validasi kesiapan poli, petugas registrasi, dan status ruang tindakan.",
    tone: "info",
  },
  {
    time: "13.00",
    title: "Sinkronisasi farmasi",
    detail: "Pastikan resep aktif, stok kritis, dan pembayaran pasien sudah selaras.",
    tone: "primary",
  },
  {
    time: "17.00",
    title: "Penutupan shift",
    detail: "Review klaim tertunda, pasien belum checkout, dan ringkasan transaksi harian.",
    tone: "warning",
  },
] as const satisfies readonly {
  time: string;
  title: string;
  detail: string;
  tone: Tone;
}[];

const toneStyles: Record<
  Tone,
  {
    badge: string;
    icon: string;
    line: string;
    soft: string;
  }
> = {
  primary: {
    badge: "border-primary/15 bg-primary/10 text-primary",
    icon: "bg-primary/12 text-primary ring-1 ring-primary/10",
    line: "bg-primary/70",
    soft: "bg-primary/5",
  },
  info: {
    badge: "border-info/15 bg-info/10 text-info",
    icon: "bg-info/12 text-info ring-1 ring-info/10",
    line: "bg-info/70",
    soft: "bg-info/5",
  },
  success: {
    badge: "border-success/15 bg-success/10 text-success",
    icon: "bg-success/12 text-success ring-1 ring-success/10",
    line: "bg-success/70",
    soft: "bg-success/5",
  },
  warning: {
    badge: "border-warning/15 bg-warning/10 text-warning",
    icon: "bg-warning/12 text-warning ring-1 ring-warning/10",
    line: "bg-warning/80",
    soft: "bg-warning/5",
  },
};

function getMotionProps(prefersReducedMotion: boolean, delay = 0) {
  if (prefersReducedMotion) {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.45,
      delay,
      ease: "easeOut" as const,
    },
  };
}

function getToneClasses(tone: Tone) {
  return toneStyles[tone];
}

export default function Dashboard({ userName, clinicName, role }: DashboardProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <div className="space-y-6">
      <motion.section
        {...getMotionProps(prefersReducedMotion, 0)}
        className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]"
      >
        <Card className="border-primary/15 bg-card/95 shadow-sm shadow-primary/5">
          <CardContent className="relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgb(8_145_178_/_0.18),_transparent_60%)]"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-success/10 blur-2xl"
            />

            <div className="relative space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    Ringkasan shift hari ini
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Operasional {clinicName} terlihat stabil, dengan beberapa titik yang perlu dipantau lebih dekat.
                    </h2>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                      Halo {userName}. Fokus utama untuk peran {role} saat ini adalah menjaga ritme layanan tetap cepat,
                      memastikan farmasi bergerak selaras, dan menutup administrasi yang rawan tertunda.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/85 p-3 text-sm shadow-sm sm:min-w-56">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Mode operasional</span>
                    <span className="rounded-full border border-success/15 bg-success/10 px-2.5 py-1 font-medium text-success">
                      Stabil
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Shift aktif</span>
                    <span className="font-medium text-foreground">Pagi - Siang</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Fokus berikutnya</span>
                    <span className="font-medium text-foreground">Farmasi & klaim</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {shiftHighlights.map((item, index) => {
                  const tone = getToneClasses(item.tone);

                  return (
                    <motion.div
                      key={item.label}
                      {...getMotionProps(prefersReducedMotion, 0.08 + index * 0.06)}
                      className={cn(
                        "rounded-2xl border border-border/70 px-4 py-4 shadow-sm transition-colors duration-200",
                        tone.soft,
                      )}
                    >
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/pendaftaran/pasien"
                  className={cn(buttonVariants({ size: "lg" }), "justify-center sm:min-w-44")}
                >
                  Buka Registri Pasien
                </Link>
                <Link
                  href="/master"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "justify-center sm:min-w-44",
                  )}
                >
                  Lihat Master Data
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="gap-3 pb-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">Pulse Operasional</CardTitle>
                <CardDescription className="text-sm leading-6">
                  Tiga indikator ini membantu lihat kesehatan alur layanan tanpa membuka modul satu per satu.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {statCards.slice(0, 3).map((item, index) => {
              const tone = getToneClasses(item.tone);
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  {...getMotionProps(prefersReducedMotion, 0.12 + index * 0.06)}
                  className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm"
                >
                  <div className={cn("absolute inset-y-0 left-0 w-1 rounded-full", tone.line)} />
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xl font-semibold tracking-tight text-foreground">{item.value}</p>
                    </div>
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tone.icon)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 pl-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item, index) => {
          const tone = getToneClasses(item.tone);
          const Icon = item.icon;

          return (
            <motion.div key={item.title} {...getMotionProps(prefersReducedMotion, 0.18 + index * 0.05)}>
              <Card className="border-border/80 bg-card/95 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/20 hover:shadow-md">
                <CardHeader className="gap-3 space-y-0 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <span
                        className={cn(
                          "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                          tone.badge,
                        )}
                      >
                        {item.badge}
                      </span>
                      <div className="space-y-1">
                        <CardDescription className="text-sm font-medium text-muted-foreground">
                          {item.title}
                        </CardDescription>
                        <CardTitle className="text-3xl tracking-tight">{item.value}</CardTitle>
                      </div>
                    </div>
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", tone.icon)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <motion.div {...getMotionProps(prefersReducedMotion, 0.24)}>
          <Card className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader className="gap-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <BriefcaseMedical className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">Prioritas Shift Ini</CardTitle>
                  <CardDescription className="leading-6">
                    Ringkasan fokus kerja untuk {userName} sebagai {role} di {clinicName}.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {focusItems.map((item, index) => {
                const tone = getToneClasses(item.tone);

                return (
                  <div
                    key={item.title}
                    className={cn(
                      "rounded-2xl border border-border/70 px-4 py-4 shadow-sm transition-colors duration-200",
                      tone.soft,
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold", tone.icon)}>
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...getMotionProps(prefersReducedMotion, 0.3)}>
          <Card className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader className="gap-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-info/10 text-info ring-1 ring-info/10">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">Status Layanan</CardTitle>
                  <CardDescription className="leading-6">
                    Tiap layanan dibedakan lebih jelas supaya area sibuk bisa dipindai lebih cepat dari mobile sampai desktop.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {serviceOverview.map((item) => {
                const tone = getToneClasses(item.tone);

                return (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm"
                  >
                    <div className={cn("absolute inset-x-4 top-0 h-1 rounded-full", tone.line)} />
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{item.value}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.note}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <motion.div {...getMotionProps(prefersReducedMotion, 0.36)}>
          <Card className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader className="gap-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">Alur Operasional</CardTitle>
                  <CardDescription className="leading-6">
                    Tahapan utama dibuat lebih bertingkat supaya tim cepat membaca proses mana yang sedang dijaga.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/10">
                        0{index + 1}
                      </span>
                      <p className="font-medium text-foreground">{step.title}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Tahap prioritas</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...getMotionProps(prefersReducedMotion, 0.42)}>
          <Card className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader className="gap-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">Agenda Tim</CardTitle>
                  <CardDescription className="leading-6">
                    Agenda penting diberi penekanan visual agar transisi antar shift tetap terasa terkendali.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {agendaItems.map((item) => {
                const tone = getToneClasses(item.tone);

                return (
                  <div
                    key={`${item.time}-${item.title}`}
                    className={cn(
                      "rounded-2xl border border-border/70 px-4 py-4 shadow-sm",
                      tone.soft,
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                          tone.badge,
                        )}
                      >
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
