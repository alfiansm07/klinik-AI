"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileBarChart2,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const heroSignals = [
  "Rawat jalan, jadwal, billing, dan farmasi dalam satu ritme kerja.",
  "Visual command centre yang membantu staf bergerak lebih tenang.",
  "Fondasi multi-klinik dengan akses berbasis peran dan data yang rapi.",
];

const proofMetrics = [
  { value: "Hitungan menit", label: "untuk proses check-in yang lebih ringkas" },
  { value: "4 peran inti", label: "front desk, dokter, farmasi, kasir" },
  { value: "Sepanjang hari", label: "visibilitas operasional yang tetap terbaca" },
  { value: "1 data flow", label: "untuk seluruh meja layanan" },
];

const features: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}> = [
  {
    icon: Users,
    title: "Registrasi dan antrean yang tidak terasa berat",
    description:
      "Front desk melihat kedatangan pasien, status pembayaran, dan alur layanan tanpa berpindah konteks terus-menerus.",
    accent: "from-cyan-500/18 to-cyan-200/0",
  },
  {
    icon: Stethoscope,
    title: "Pemeriksaan lebih fokus, layar lebih tenang",
    description:
      "Dokter mendapat hierarki informasi yang jelas supaya keputusan klinis terasa cepat, bersih, dan minim distraksi.",
    accent: "from-emerald-500/18 to-emerald-200/0",
  },
  {
    icon: HeartPulse,
    title: "Farmasi dan billing bergerak dari data yang sama",
    description:
      "Transisi dari tindakan ke resep hingga pembayaran dibuat sinkron untuk mengurangi miskomunikasi antar meja.",
    accent: "from-sky-500/18 to-sky-200/0",
  },
  {
    icon: FileBarChart2,
    title: "Insight owner yang langsung enak dibaca",
    description:
      "KPI harian, beban layanan, dan performa operasional muncul dalam format yang terasa premium sekaligus praktikal.",
    accent: "from-slate-500/12 to-slate-200/0",
  },
];

const workflow = [
  {
    step: "01",
    title: "Front desk melihat konteks, bukan cuma antrean",
    description:
      "Kedatangan, jadwal, dan status layanan tersusun agar penerimaan pasien terasa cepat tanpa suasana terburu-buru.",
    icon: Users,
  },
  {
    step: "02",
    title: "Dokter masuk ke tampilan yang fokus pada keputusan",
    description:
      "Informasi penting diurutkan secara visual supaya sesi pemeriksaan lebih yakin dan tidak melelahkan mata.",
    icon: Stethoscope,
  },
  {
    step: "03",
    title: "Farmasi dan kasir menutup layanan dengan ritme yang rapi",
    description:
      "Pergerakan akhir layanan tetap sinkron karena semua tim membaca sumber data operasional yang sama.",
    icon: Database,
  },
];

const securityPillars = [
  {
    icon: ShieldCheck,
    title: "Tenant-aware by design",
    description: "Struktur data disiapkan untuk isolasi klinik dan pertumbuhan multi-cabang sejak awal.",
  },
  {
    icon: BadgeCheck,
    title: "Role-based access",
    description: "Akses dapat dibedakan untuk admin, dokter, kasir, dan staf operasional sesuai kebutuhan lapangan.",
  },
  {
    icon: Clock3,
    title: "Audit-friendly workflow",
    description: "Perubahan penting dan keputusan operasional lebih mudah dilacak saat sistem dipakai harian.",
  },
];

const liveBoardStats = [
  { label: "Antrian aktif", value: "18 pasien", tone: "text-cyan-300" },
  { label: "Dokter on duty", value: "4 shift", tone: "text-white" },
  { label: "Pelunasan hari ini", value: "Rp 12,8 jt", tone: "text-emerald-300" },
];

const visitMoments = [
  { time: "08:30", title: "Rawat jalan umum", detail: "12 slot terisi" },
  { time: "10:00", title: "Kontrol penyakit kronis", detail: "4 pasien menunggu" },
  { time: "13:15", title: "Farmasi dan pembayaran", detail: "aliran kas stabil" },
];

const trustedLabels = [
  "Operasional rawat jalan",
  "Pusat komando klinik",
  "Billing dan farmasi",
  "Visibilitas owner",
  "Akses berbasis peran",
];

const easing = [0.16, 1, 0.3, 1] as const;

function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted && prefersReducedMotion;
}

const sectionAnchorClassName = "scroll-mt-28 sm:scroll-mt-32";
const anchorLinkClassName =
  "cursor-pointer rounded-full transition-colors hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.55, delay, ease: easing }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <SectionReveal className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/85 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-cyan-700 uppercase shadow-[0_12px_40px_-24px_rgba(8,145,178,0.65)] backdrop-blur-sm">
        <Sparkles className="size-3.5" />
        {eyebrow}
      </div>
      <h2 className="mt-6 font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
    </SectionReveal>
  );
}

function AmbientOrb({
  className,
  animate,
}: {
  className: string;
  animate: { x?: number[]; y?: number[]; scale?: number[] };
}) {
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={shouldReduceMotion ? { opacity: 0.8 } : animate}
      transition={shouldReduceMotion ? undefined : { duration: 16, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
    />
  );
}

function LiveBoardPreview() {
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.12, ease: easing }}
      className="relative"
    >
      <div className="absolute inset-x-10 top-8 h-36 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 p-4 shadow-[0_42px_120px_-52px_rgba(8,145,178,0.62)] backdrop-blur-xl sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_30%)]" />

        <div className="relative rounded-[1.7rem] border border-white/10 bg-slate-950 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-cyan-200 uppercase">Live ops board</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Control room klinik harian</h2>
            </div>
            <motion.div
              animate={shouldReduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={shouldReduceMotion ? undefined : { duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"
            >
              <span className="size-2 rounded-full bg-emerald-300" />
              Operasional stabil
            </motion.div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="space-y-4">
              <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-300">Utilisasi layanan hari ini</p>
                    <p className="mt-3 font-heading text-4xl font-semibold tracking-tight">87%</p>
                  </div>
                  <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
                    <LayoutDashboard className="size-5" />
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={shouldReduceMotion ? { width: "87%" } : { width: 0 }}
                    animate={{ width: "87%" }}
                    transition={{ delay: 0.45, duration: 0.9, ease: "easeOut" }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,_rgba(34,211,238,1),_rgba(16,185,129,1))]"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {liveBoardStats.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + index * 0.08, duration: 0.45, ease: easing }}
                    className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3"
                  >
                    <div className="text-[11px] tracking-[0.18em] text-slate-400 uppercase">{item.label}</div>
                    <div className={cn("mt-3 font-heading text-lg font-semibold tracking-tight", item.tone)}>{item.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CalendarDays className="size-4 text-cyan-200" />
                Agenda real-time
              </div>

              <div className="mt-4 space-y-3">
                {visitMoments.map((item, index) => (
                  <motion.div
                    key={item.time}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.62 + index * 0.1, duration: 0.45, ease: easing }}
                    className="flex items-start gap-3 rounded-[1.2rem] border border-white/8 bg-black/20 p-3"
                  >
                    <div className="rounded-xl bg-white/10 px-2.5 py-2 text-xs font-semibold text-cyan-100">{item.time}</div>
                    <div>
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-400">{item.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
                transition={shouldReduceMotion ? undefined : { duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="mt-4 rounded-[1.2rem] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50"
              >
                Alert lembut: lonjakan pembayaran 14:00-15:00, sistem sarankan buka counter tambahan.
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0.9, 1, 0.92], y: [0, -6, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute top-6 right-6 hidden rounded-[1.3rem] border border-white/70 bg-white/88 px-4 py-3 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.38)] backdrop-blur-sm sm:block"
        >
          <div className="text-[11px] tracking-[0.2em] text-slate-500 uppercase">Cashflow pulse</div>
          <div className="mt-2 flex items-end gap-1.5">
            {[
              { id: "mon", height: 48 },
              { id: "tue", height: 62 },
              { id: "wed", height: 54 },
              { id: "thu", height: 78 },
              { id: "fri", height: 69 },
              { id: "sat", height: 92 },
            ].map((bar) => (
              <div
                key={bar.id}
                className="w-2.5 rounded-full bg-[linear-gradient(180deg,_rgba(8,145,178,0.95),_rgba(16,185,129,0.95))]"
                style={{ height: bar.height }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Langsung ke konten utama
      </a>

      <main
        id="main-content"
        className="relative min-h-svh overflow-x-clip bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,_#ecfeff_0%,_#f8fafb_22%,_#ffffff_60%,_#f0fdfa_100%)] text-slate-900"
      >
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
        <AmbientOrb
          className="absolute top-24 left-[-8rem] -z-10 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
          animate={{ x: [0, 32, -14, 0], y: [0, -20, 18, 0], scale: [1, 1.08, 0.96, 1] }}
        />
        <AmbientOrb
          className="absolute top-16 right-[-9rem] -z-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl"
          animate={{ x: [0, -36, 24, 0], y: [0, 22, -14, 0], scale: [1, 0.96, 1.08, 1] }}
        />
        <AmbientOrb
          className="absolute right-[12%] bottom-[18%] -z-10 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl"
          animate={{ y: [0, -16, 10, 0], x: [0, 8, -6, 0], scale: [1, 1.04, 0.98, 1] }}
        />

        <div className="mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-10">
          <motion.header
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="sticky top-0 z-40 pt-5"
          >
            <div className="flex items-center justify-between rounded-full border border-white/70 bg-white/72 px-5 py-3 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.38)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(8,145,178,1),_rgba(16,185,129,0.92))] text-white shadow-[0_18px_45px_-20px_rgba(8,145,178,0.95)]">
                  <Activity className="size-5" />
                </div>
                <div>
                  <div className="font-heading text-lg font-semibold tracking-tight text-slate-950">Klinikai</div>
                  <div className="text-xs tracking-[0.24em] text-slate-500 uppercase">Clinic Intelligence System</div>
                </div>
              </div>

              <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="Navigasi utama">
                <a href="#fitur" className={anchorLinkClassName}>
                  Fitur
                </a>
                <a href="#alur" className={anchorLinkClassName}>
                  Alur kerja
                </a>
                <a href="#keamanan" className={anchorLinkClassName}>
                  Keamanan
                </a>
              </nav>

              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "hidden cursor-pointer rounded-full px-4 text-slate-700 md:inline-flex",
                  )}
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,_rgba(8,145,178,1),_rgba(16,185,129,0.95))] px-5 text-white shadow-[0_24px_60px_-28px_rgba(8,145,178,1)] transition-all duration-200 hover:brightness-110",
                  )}
                >
                  Masuk ke produk
                </Link>
              </div>
            </div>
          </motion.header>

          <section className="relative pt-14 sm:pt-20 lg:pt-24">
            <div className="grid items-center gap-16 lg:grid-cols-[1.04fr_0.96fr]">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.72, ease: easing }}
                className="relative"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/85 px-4 py-2 text-sm font-medium text-cyan-700 shadow-[0_16px_45px_-28px_rgba(8,145,178,0.9)] backdrop-blur-sm">
                  <BadgeCheck className="size-4" />
                  Dibangun untuk klinik yang ingin terasa modern, tenang, dan sangat rapi
                </div>

                <div className="mt-8 max-w-3xl">
                  <h1 className="font-heading text-5xl leading-[0.95] font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                    Satu control room untuk operasional klinik yang bergerak cepat.
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                    Klinikai menyatukan registrasi, pemeriksaan, farmasi, billing, dan visibilitas owner ke dalam satu
                    pengalaman yang terasa profesional sejak detik pertama dibuka.
                  </p>
                </div>

                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  className="mt-8 flex flex-col gap-4 sm:flex-row"
                >
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,_rgba(8,145,178,1),_rgba(14,165,233,0.92),_rgba(16,185,129,0.92))] px-6 text-white shadow-[0_28px_80px_-30px_rgba(8,145,178,1)] transition-all duration-200 hover:brightness-110",
                    )}
                  >
                    Masuk untuk melihat produk
                    <ArrowRight className="ml-1 size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#fitur"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "cursor-pointer rounded-full border-cyan-200 bg-white/80 px-6 text-slate-800 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.38)] backdrop-blur-sm transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-50/80",
                    )}
                  >
                    Jelajahi fitur utama
                  </a>
                </motion.div>

                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-10 grid gap-3 sm:grid-cols-3"
                >
                  {heroSignals.map((signal, index) => (
                    <motion.div
                      key={signal}
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + index * 0.08, duration: 0.45, ease: easing }}
                      className="rounded-3xl border border-white/70 bg-white/78 px-4 py-4 text-sm leading-6 text-slate-600 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.32)] backdrop-blur-sm"
                    >
                      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                        <CheckCircle2 className="size-4" />
                      </div>
                      {signal}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <LiveBoardPreview />
            </div>
          </section>

          <section className="mt-14">
            <SectionReveal className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.32)] backdrop-blur-xl lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="text-xs font-semibold tracking-[0.24em] text-cyan-700 uppercase">Trust surface</div>
                  <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Cepat dipahami oleh staf, cukup meyakinkan untuk owner.
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Klinikai menonjolkan rasa percaya sejak pandangan pertama: produk terlihat matang, alur terasa
                    sinkron, dan nilai operasionalnya mudah ditangkap bahkan sebelum tim mulai bekerja di dalam aplikasi.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {trustedLabels.map((label) => (
                    <div
                      key={label}
                      className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {proofMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: index * 0.07, ease: easing }}
                    className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5"
                  >
                    <div className="font-heading text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{metric.label}</div>
                  </motion.div>
                ))}
              </div>
            </SectionReveal>
          </section>

          <section id="fitur" className={cn(sectionAnchorClassName, "pt-24 sm:pt-28")}>
            <SectionHeading
              eyebrow="Core capabilities"
              title="Setiap alur dirancang untuk membuat kerja klinik terasa lebih rapi dan lebih cepat."
              description="Klinikai paling kuat ketika setiap peran melihat informasi yang tepat pada saat yang tepat, sehingga operasional terasa lebih tenang dari meja depan hingga penutupan layanan."
            />

            <div className="mt-14 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.24 }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: easing }}
                >
                  <Card className="group relative h-full rounded-[1.9rem] border-white/70 bg-white/78 py-0 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-shadow duration-200 hover:shadow-[0_32px_90px_-40px_rgba(8,145,178,0.32)]">
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100", feature.accent)} />
                    <CardHeader className="relative px-6 pt-6">
                      <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-cyan-50 text-cyan-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <feature.icon className="size-6" />
                      </div>
                      <CardTitle className="mt-6 font-heading text-2xl font-semibold tracking-tight text-slate-950">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="mt-3 text-sm leading-7 text-slate-600">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative px-6 pb-6">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
                        Lihat nilai operasional
                        <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="alur" className={cn(sectionAnchorClassName, "pt-24 sm:pt-28")}>
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <SectionReveal className="lg:sticky lg:top-28">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-emerald-700 uppercase">
                  <Clock3 className="size-3.5" />
                  Motion with meaning
                </div>
                <h2 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Banyak efek, tetapi semuanya tetap tunduk pada rasa percaya.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                  Motion dipakai untuk mengarahkan perhatian, memberi kedalaman, dan membuat produk terasa hidup. Bukan
                  untuk mencuri fokus dari isi. Hasilnya lebih premium, tetapi tetap nyaman untuk konteks healthcare.
                </p>
              </SectionReveal>

              <div className="space-y-5">
                {workflow.map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.24 }}
                    transition={{ duration: 0.55, delay: index * 0.08, ease: easing }}
                  >
                    <Card className="relative rounded-[2rem] border-white/70 bg-white/78 py-0 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.38)] backdrop-blur-xl">
                      <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,_rgba(8,145,178,1),_rgba(16,185,129,1))]" />
                      <CardContent className="px-6 py-6 sm:px-7 sm:py-7">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-slate-950 text-white">
                              <item.icon className="size-6" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold tracking-[0.24em] text-cyan-700 uppercase">Step {item.step}</div>
                              <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-slate-950">
                                {item.title}
                              </h3>
                              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{item.description}</p>
                            </div>
                          </div>
                          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                            Smooth transition
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="keamanan" className={cn(sectionAnchorClassName, "pt-24 sm:pt-28")}>
            <SectionHeading
              eyebrow="Trust and governance"
              title="Produk healthcare perlu terasa aman sebelum ia terasa canggih."
              description="Karena itu section keamanan dibuat bukan sebagai formalitas, tetapi sebagai penguat rasa percaya untuk klinik yang ingin berkembang dengan sistem yang lebih serius."
            />

            <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <SectionReveal className="grid gap-5 sm:grid-cols-3">
                {securityPillars.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.24 }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: easing }}
                  >
                    <Card className="h-full rounded-[1.8rem] border-white/70 bg-white/78 py-0 shadow-[0_26px_70px_-36px_rgba(15,23,42,0.3)] backdrop-blur-xl">
                      <CardHeader className="px-6 pt-6">
                        <div className="flex size-12 items-center justify-center rounded-[1.2rem] bg-slate-950 text-white">
                          <item.icon className="size-5" />
                        </div>
                        <CardTitle className="mt-5 font-heading text-xl font-semibold tracking-tight text-slate-950">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="mt-3 text-sm leading-7 text-slate-600">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </SectionReveal>

              <SectionReveal>
                <Card className="overflow-hidden rounded-[2rem] border-cyan-200/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.88),_rgba(236,254,255,0.88))] py-0 shadow-[0_30px_90px_-40px_rgba(8,145,178,0.34)] backdrop-blur-xl">
                  <CardHeader className="px-6 pt-6 sm:px-7 sm:pt-7">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-cyan-700 uppercase">
                      <ShieldCheck className="size-3.5" />
                      Clinical confidence
                    </div>
                    <CardTitle className="mt-5 font-heading text-3xl font-semibold tracking-tight text-slate-950">
                      Visual yang meyakinkan, fondasi yang serius.
                    </CardTitle>
                    <CardDescription className="mt-4 text-base leading-8 text-slate-600">
                      Bahasa visual Klinikai dibuat bersih dan matang: cukup premium untuk menunjukkan kualitas produk,
                      cukup tenang untuk menjaga rasa aman dalam operasional healthcare yang dijalankan setiap hari.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 sm:px-7 sm:pb-7">
                    <div className="grid gap-3">
                      {[
                        "Kontras tinggi dan fokus keyboard tetap jelas.",
                        "Motion ringan dengan reduced-motion support.",
                        "CTA utama tetap terlihat pada mobile hingga desktop.",
                      ].map((item) => (
                        <div key={item} className="rounded-[1.2rem] border border-cyan-100 bg-white/90 px-4 py-3 text-sm text-slate-700">
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </SectionReveal>
            </div>
          </section>

          <section id="cta" className={cn(sectionAnchorClassName, "pt-24 sm:pt-28")}>
            <SectionReveal>
              <div className="relative overflow-hidden rounded-[2.4rem] border border-cyan-200/70 bg-[linear-gradient(135deg,_rgba(6,182,212,0.96),_rgba(8,145,178,0.96),_rgba(5,150,105,0.96))] px-7 py-10 text-white shadow-[0_40px_120px_-40px_rgba(8,145,178,0.88)] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.18),_transparent_24%)]" />
                <motion.div
                  aria-hidden="true"
                  animate={shouldReduceMotion ? undefined : { x: [0, 8, 0], y: [0, -8, 0] }}
                  transition={shouldReduceMotion ? undefined : { duration: 7.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="absolute top-10 right-10 h-28 w-28 rounded-full border border-white/20 bg-white/10 blur-2xl"
                />

                <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] uppercase">
                      <Sparkles className="size-3.5" />
                      Ready for the next step
                    </div>
                    <h2 className="mt-6 max-w-3xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                      Saat sistem utama terasa tenang, seluruh klinik ikut terasa lebih siap.
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-cyan-50/88 sm:text-lg">
                      Klinikai hadir untuk klinik yang ingin tampil lebih siap, bekerja lebih sinkron, dan memberi kesan
                      profesional sejak pengalaman pertama pengguna melihat produknya.
                    </p>
                  </div>

                  <div className="grid gap-4 rounded-[1.8rem] border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
                    <div className="text-sm font-medium text-white/80">Yang langsung terasa saat melihat Klinikai</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        "Hero dengan dashboard preview yang hidup",
                        "Motion halus yang menjaga fokus",
                        "Section storytelling untuk tiap peran",
                        "Trust layer yang kuat untuk healthcare",
                      ].map((item) => (
                        <div key={item} className="rounded-[1.2rem] border border-white/15 bg-black/10 px-4 py-3 text-sm text-white/88">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/login"
                        className={cn(
                          buttonVariants({ size: "lg" }),
                          "cursor-pointer rounded-full border-0 bg-white px-6 text-cyan-800 shadow-[0_24px_70px_-30px_rgba(255,255,255,0.85)] transition-colors duration-200 hover:bg-cyan-50",
                        )}
                      >
                        Buka aplikasi
                      </Link>
                      <a
                        href="#fitur"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" }),
                          "cursor-pointer rounded-full border-white/30 bg-white/10 px-6 text-white transition-colors duration-200 hover:bg-white/15 hover:text-white",
                        )}
                      >
                        Tinjau fitur lagi
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </section>

          <footer className="pb-8 pt-14 text-sm text-slate-500">
            <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-medium text-slate-700">Klinikai</span> - SaaS operasional klinik untuk pengalaman yang lebih rapi.
              </div>
              <div className="flex flex-wrap gap-4">
                        <a href="#fitur" className={anchorLinkClassName}>
                          Fitur
                        </a>
                        <a href="#alur" className={anchorLinkClassName}>
                          Alur kerja
                        </a>
                        <a href="#keamanan" className={anchorLinkClassName}>
                          Keamanan
                        </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </MotionConfig>
  );
}
