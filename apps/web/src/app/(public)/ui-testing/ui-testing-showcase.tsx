"use client";

import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleUser,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  Info,
  LayoutDashboard,
  LogOut,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      <Separator />
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Color swatch                                                       */
/* ------------------------------------------------------------------ */
function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-10 w-10 rounded-md border border-border shadow-sm ${className}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ================================================================== */
/*  Main Showcase                                                      */
/* ================================================================== */
export function UiTestingShowcase() {
  const { setTheme, theme } = useTheme();

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        {/* ============================================================ */}
        {/*  Sidebar — w-60 (240px) per MASTER.md                        */}
        {/* ============================================================ */}
        <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          {/* Branding — h-14 */}
          <div className="flex h-14 items-center border-b border-sidebar-border px-4">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="h-auto w-full justify-start px-2 py-1.5 text-sidebar-foreground hover:bg-sidebar-accent" />}>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                    K
                  </div>
                  <span className="font-heading text-sm font-semibold">Klinikai HQ</span>
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Klinik Utama</DropdownMenuLabel>
                <DropdownMenuItem>Cabang Jakarta</DropdownMenuItem>
                <DropdownMenuItem>Cabang Surabaya</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" /> Tambah Klinik Baru
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-auto px-3 py-4">
            <div className="mb-4 px-3">
              <Button className="w-full justify-start gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" size="sm">
                <Plus className="h-4 w-4" />
                Pasien Baru
              </Button>
            </div>

            <nav className="space-y-4 text-sm font-medium">
              {/* Group: Menu Utama */}
              <div>
                <p className="mb-1 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Menu Utama
                </p>
                <div className="flex flex-col gap-0.5">
                  <a href="#" className="flex h-9 items-center gap-3 rounded-lg bg-sidebar-primary px-3 text-sidebar-primary-foreground transition-colors duration-150">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </a>
                  <a href="#" className="flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Users className="h-4 w-4" />
                    Data Pasien
                  </a>
                  <a href="#" className="flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Calendar className="h-4 w-4" />
                    Jadwal & Antrean
                  </a>
                  <a href="#" className="flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Activity className="h-4 w-4" />
                    Rekam Medis
                  </a>
                </div>
              </div>

              {/* Group: Manajemen */}
              <div>
                <p className="mb-1 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Manajemen
                </p>
                <div className="flex flex-col gap-0.5">
                  <a href="#" className="flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <BarChart3 className="h-4 w-4" />
                    Laporan
                  </a>
                  <a href="#" className="flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <FileText className="h-4 w-4" />
                    Farmasi & Stok
                  </a>
                  <a href="#" className="flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Settings className="h-4 w-4" />
                    Pengaturan
                  </a>
                </div>
              </div>
            </nav>
          </div>

          {/* User footer */}
          <div className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="h-auto w-full justify-start px-2 py-1.5 text-sidebar-foreground hover:bg-sidebar-accent" />}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">DR</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium leading-none">Dr. Andi</span>
                    <span className="mt-1 text-xs text-muted-foreground">Admin Klinik</span>
                  </div>
                  <MoreHorizontal className="ml-auto h-4 w-4 opacity-50" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuItem>
                  <CircleUser className="mr-2 h-4 w-4" /> Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" /> Tagihan Klinik
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ============================================================ */}
        {/*  Main Area                                                    */}
        {/* ============================================================ */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header — h-14 sticky */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-6 backdrop-blur">
            <h1 className="font-heading text-sm font-semibold tracking-tight">Design System — UI Testing</h1>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden sm:flex">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari pasien, RM, atau tindakan..."
                  className="h-9 w-64 border-none bg-muted/50 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button variant="outline" className="hidden px-4 text-xs font-medium shadow-sm sm:flex">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                Hari Ini
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="shadow-sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 text-muted-foreground transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-muted-foreground transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>

          {/* Content — full-width, no max-w-* */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="space-y-8">

              {/* Page Title Row */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-heading text-xl font-semibold">Klinikai Design System</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Referensi visual komprehensif — Clinical Cyan theme, Swiss Modernism 2.0
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-3.5 w-3.5" /> Export
                  </Button>
                  <Button size="sm">
                    <Plus className="mr-2 h-3.5 w-3.5" /> Buat Baru
                  </Button>
                </div>
              </div>

              {/* ================================================== */}
              {/*  1. COLOR PALETTE                                    */}
              {/* ================================================== */}
              <Section title="1. Color Palette">
                <div className="space-y-4">
                  {/* Core */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Core Colors</p>
                    <div className="flex flex-wrap gap-2">
                      <Swatch label="Primary" className="bg-primary" />
                      <Swatch label="Primary FG" className="bg-primary-foreground" />
                      <Swatch label="Secondary" className="bg-secondary" />
                      <Swatch label="Background" className="bg-background" />
                      <Swatch label="Foreground" className="bg-foreground" />
                      <Swatch label="Muted" className="bg-muted" />
                      <Swatch label="Accent" className="bg-accent" />
                      <Swatch label="Card" className="bg-card" />
                      <Swatch label="Border" className="bg-border" />
                      <Swatch label="Destructive" className="bg-destructive" />
                    </div>
                  </div>

                  {/* Semantic */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Semantic / Status Colors</p>
                    <div className="flex flex-wrap gap-2">
                      <Swatch label="Success" className="bg-success" />
                      <Swatch label="Warning" className="bg-warning" />
                      <Swatch label="Info" className="bg-info" />
                      <Swatch label="Destructive" className="bg-destructive" />
                    </div>
                  </div>

                  {/* Chart */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Chart Colors</p>
                    <div className="flex flex-wrap gap-2">
                      <Swatch label="Chart 1" className="bg-chart-1" />
                      <Swatch label="Chart 2" className="bg-chart-2" />
                      <Swatch label="Chart 3" className="bg-chart-3" />
                      <Swatch label="Chart 4" className="bg-chart-4" />
                      <Swatch label="Chart 5" className="bg-chart-5" />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sidebar Colors</p>
                    <div className="flex flex-wrap gap-2">
                      <Swatch label="Sidebar" className="bg-sidebar" />
                      <Swatch label="Sidebar Accent" className="bg-sidebar-accent" />
                      <Swatch label="Sidebar Primary" className="bg-sidebar-primary" />
                      <Swatch label="Sidebar Border" className="bg-sidebar-border" />
                    </div>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  2. TYPOGRAPHY                                       */}
              {/* ================================================== */}
              <Section title="2. Typography Scale">
                <div className="space-y-3 rounded-lg border bg-card p-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Page title — text-xl font-heading font-semibold</span>
                    <p className="font-heading text-xl font-semibold">Dashboard Klinik Utama</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Section heading — text-base font-heading font-semibold</span>
                    <p className="font-heading text-base font-semibold">Statistik Kunjungan Hari Ini</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Card title — text-sm font-heading font-medium</span>
                    <p className="font-heading text-sm font-medium">Total Pendapatan</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">KPI number — text-2xl font-heading font-bold tabular-nums</span>
                    <p className="font-heading text-2xl font-bold tabular-nums">Rp 12.450.000</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Body text — text-sm (14px default)</span>
                    <p className="text-sm">Pasien Budi Santoso datang untuk kontrol rutin di Poli Umum pada tanggal 7 Maret 2026.</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Table header — text-xs font-medium uppercase tracking-wider text-muted-foreground</span>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">NAMA PASIEN</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Table cell (numeric) — text-sm tabular-nums</span>
                    <p className="text-sm tabular-nums">Rp 1.250.000</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Small / Caption — text-xs text-muted-foreground</span>
                    <p className="text-xs text-muted-foreground">Terakhir diperbarui 5 menit yang lalu</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Form label — text-sm font-medium</span>
                    <p className="text-sm font-medium">Nama Lengkap Pasien</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs text-muted-foreground">Monospace — font-mono text-sm</span>
                    <p className="font-mono text-sm">MR-2026-00001</p>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  3. BUTTONS                                          */}
              {/* ================================================== */}
              <Section title="3. Button Variants & Sizes">
                <div className="space-y-4">
                  {/* Variants */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Variants</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button>Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sizes</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="lg">Large (h-10)</Button>
                      <Button>Default (h-9)</Button>
                      <Button size="sm">Small (h-8)</Button>
                      <Button size="xs">XS (h-7)</Button>
                      <Button size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  {/* With icons */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">With Icons</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Pasien Baru
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </Button>
                    </div>
                  </div>

                  {/* Disabled */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Disabled State</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button disabled>Disabled Primary</Button>
                      <Button variant="outline" disabled>Disabled Outline</Button>
                      <Button variant="secondary" disabled>Disabled Secondary</Button>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  4. STATUS BADGES                                    */}
              {/* ================================================== */}
              <Section title="4. Status Badges">
                <div className="space-y-4">
                  {/* Healthcare status pattern from MASTER.md */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Healthcare Status Pattern</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Selesai
                      </Badge>
                      <Badge variant="outline" className="border-warning/20 bg-warning/10 text-warning">
                        <Clock className="mr-1 h-3 w-3" /> Menunggu
                      </Badge>
                      <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                        <XCircle className="mr-1 h-3 w-3" /> Batal
                      </Badge>
                      <Badge variant="outline" className="border-info/20 bg-info/10 text-info">
                        <Info className="mr-1 h-3 w-3" /> Draft
                      </Badge>
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Tidak Aktif
                      </Badge>
                    </div>
                  </div>

                  {/* Built-in badge variants */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Built-in Badge Variants</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  5. KPI CARDS                                        */}
              {/* ================================================== */}
              <Section title="5. KPI Cards — Dashboard Widgets">
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Pendapatan</CardTitle>
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="font-heading text-2xl font-bold tabular-nums tracking-tight">Rp 12.450.000</div>
                      <p className="mt-1 flex items-center text-xs text-muted-foreground">
                        <span className="mr-1 flex items-center font-medium text-success">
                          <TrendingUp className="mr-0.5 inline h-3 w-3" /> +20.1%
                        </span>
                        dari bulan lalu
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pasien Baru</CardTitle>
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="font-heading text-2xl font-bold tabular-nums tracking-tight">+350</div>
                      <p className="mt-1 flex items-center text-xs text-muted-foreground">
                        <span className="mr-1 flex items-center font-medium text-success">
                          <TrendingUp className="mr-0.5 inline h-3 w-3" /> +15.5%
                        </span>
                        dari bulan lalu
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tindakan Selesai</CardTitle>
                      <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="font-heading text-2xl font-bold tabular-nums tracking-tight">1.234</div>
                      <p className="mt-1 flex items-center text-xs text-muted-foreground">
                        <span className="mr-1 flex items-center font-medium text-destructive">
                          <TrendingDown className="mr-0.5 inline h-3 w-3" /> -2%
                        </span>
                        dari target harian
                      </p>
                    </CardContent>
                  </Card>
                  {/* Highlighted KPI card — primary bg */}
                  <Card className="border-transparent bg-primary shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary-foreground/80">Antrean Aktif</CardTitle>
                      <Activity className="h-3.5 w-3.5 text-primary-foreground/80" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-primary-foreground">
                      <div className="font-heading text-2xl font-bold tabular-nums tracking-tight">18 Pasien</div>
                      <p className="mt-1 text-xs text-primary-foreground/80">
                        Estimasi tunggu 24 menit
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  6. FILTER BAR                                       */}
              {/* ================================================== */}
              <Section title="6. Filter Bar — Compact Controls (h-8)">
                <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama pasien..."
                      className="h-8 w-48 pl-7 text-sm"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="h-8 w-36 text-sm">
                      <SelectValue placeholder="Semua Poli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="umum">Poli Umum</SelectItem>
                      <SelectItem value="gigi">Poli Gigi</SelectItem>
                      <SelectItem value="anak">Poli Anak</SelectItem>
                      <SelectItem value="mata">Poli Mata</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="h-8 w-36 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="menunggu">Menunggu</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="batal">Batal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-3.5 w-3.5" /> Filter Lanjut
                  </Button>
                  <div className="ml-auto text-xs text-muted-foreground">
                    124 hasil ditemukan
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  7. DATA TABLE                                       */}
              {/* ================================================== */}
              <Section title="7. Data Table — shadcn Table (h-9 rows)">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm font-medium">Daftar Kunjungan Hari Ini</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3.5 w-3.5" /> Export
                      </Button>
                      <Button size="sm">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Registrasi
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-10">
                              <Checkbox />
                            </TableHead>
                            <TableHead>No. RM</TableHead>
                            <TableHead>Nama Pasien</TableHead>
                            <TableHead>Poli</TableHead>
                            <TableHead>Dokter</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Biaya</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { mr: "MR-001", name: "Budi Santoso", poli: "Poli Umum", doc: "Dr. Andi", status: "selesai" as const, fee: 150000 },
                            { mr: "MR-002", name: "Siti Aminah", poli: "Poli Gigi", doc: "Drg. Budi", status: "menunggu" as const, fee: 250000 },
                            { mr: "MR-003", name: "Anton Wijaya", poli: "Poli Anak", doc: "Dr. Citra", status: "aktif" as const, fee: 175000 },
                            { mr: "MR-004", name: "Desi Ratnasari", poli: "Poli Umum", doc: "Dr. Andi", status: "draft" as const, fee: 0 },
                            { mr: "MR-005", name: "Eka Pratama", poli: "Poli Gigi", doc: "Drg. Budi", status: "batal" as const, fee: 200000 },
                          ].map((row) => (
                            <TableRow key={row.mr} className="h-9 cursor-pointer transition-colors duration-150">
                              <TableCell>
                                <Checkbox />
                              </TableCell>
                              <TableCell className="font-mono text-sm">{row.mr}</TableCell>
                              <TableCell className="text-sm font-medium">{row.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{row.poli}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{row.doc}</TableCell>
                              <TableCell>
                                {row.status === "selesai" && (
                                  <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Selesai
                                  </Badge>
                                )}
                                {row.status === "menunggu" && (
                                  <Badge variant="outline" className="border-warning/20 bg-warning/10 text-warning">
                                    <Clock className="mr-1 h-3 w-3" /> Menunggu
                                  </Badge>
                                )}
                                {row.status === "aktif" && (
                                  <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                                    Aktif
                                  </Badge>
                                )}
                                {row.status === "draft" && (
                                  <Badge variant="outline" className="border-info/20 bg-info/10 text-info">
                                    <Info className="mr-1 h-3 w-3" /> Draft
                                  </Badge>
                                )}
                                {row.status === "batal" && (
                                  <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                                    <XCircle className="mr-1 h-3 w-3" /> Batal
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-sm tabular-nums">
                                {row.fee > 0 ? `Rp ${row.fee.toLocaleString("id-ID")}` : "—"}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" />}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem><FileText className="mr-2 h-3.5 w-3.5" /> Detail</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
                      <div>Menampilkan 5 dari 124 kunjungan</div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 px-2" disabled>Sblm</Button>
                        <Button variant="outline" size="sm" className="h-7 px-2 bg-primary text-primary-foreground hover:bg-primary/90">1</Button>
                        <Button variant="outline" size="sm" className="h-7 px-2">2</Button>
                        <Button variant="outline" size="sm" className="h-7 px-2">3</Button>
                        <Button variant="outline" size="sm" className="h-7 px-2">Selanjutnya</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  8. FORM ELEMENTS                                    */}
              {/* ================================================== */}
              <Section title="8. Form Elements">
                <Card className="shadow-sm">
                  <CardHeader className="p-3">
                    <CardTitle className="font-heading text-sm font-medium">Formulir Pendaftaran Pasien</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Text inputs */}
                      <div className="space-y-2">
                        <Label htmlFor="nama" className="text-sm font-medium">Nama Lengkap</Label>
                        <Input id="nama" placeholder="Masukkan nama lengkap" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nik" className="text-sm font-medium">NIK (KTP)</Label>
                        <Input id="nik" placeholder="16 digit NIK" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">No. Telepon</Label>
                        <Input id="phone" type="tel" placeholder="08xx-xxxx-xxxx" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input id="email" type="email" placeholder="email@contoh.com" />
                      </div>

                      {/* Select */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Jenis Kelamin</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="laki_laki">Laki-laki</SelectItem>
                            <SelectItem value="perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Select - Poli */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Poli Tujuan</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih poli" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="umum">Poli Umum</SelectItem>
                            <SelectItem value="gigi">Poli Gigi</SelectItem>
                            <SelectItem value="anak">Poli Anak</SelectItem>
                            <SelectItem value="mata">Poli Mata</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Textarea */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="alamat" className="text-sm font-medium">Alamat</Label>
                        <Textarea id="alamat" placeholder="Masukkan alamat lengkap" rows={3} />
                      </div>

                      {/* Error state */}
                      <div className="space-y-2">
                        <Label htmlFor="error-demo" className="text-sm font-medium">Input Error State</Label>
                        <Input id="error-demo" placeholder="Field wajib diisi" className="border-destructive focus-visible:ring-destructive" />
                        <p className="text-xs text-destructive" role="alert">
                          <AlertCircle className="mr-1 inline h-3 w-3" />
                          Nama pasien wajib diisi
                        </p>
                      </div>

                      {/* Disabled input */}
                      <div className="space-y-2">
                        <Label htmlFor="disabled-demo" className="text-sm font-medium">Disabled Input</Label>
                        <Input id="disabled-demo" placeholder="Tidak bisa diedit" disabled value="MR-2026-00001" />
                      </div>

                      {/* Checkbox */}
                      <div className="flex items-center gap-2 md:col-span-2">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms" className="text-sm">Pasien menyetujui pemrosesan data medis</Label>
                      </div>

                      {/* Switch */}
                      <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
                        <div>
                          <Label className="text-sm font-medium">Pasien BPJS</Label>
                          <p className="text-xs text-muted-foreground">Aktifkan jika pasien menggunakan BPJS Kesehatan</p>
                        </div>
                        <Switch />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 md:col-span-2">
                        <Button>Simpan Pasien</Button>
                        <Button variant="outline">Batal</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Section>

              {/* ================================================== */}
              {/*  9. CHART AREA                                       */}
              {/* ================================================== */}
              <Section title="9. Chart Area — Placeholder">
                <Card className="shadow-sm">
                  <CardHeader className="p-3">
                    <CardTitle className="font-heading text-base font-semibold">Trafik Kunjungan (Bulan Ini)</CardTitle>
                    <p className="text-xs text-muted-foreground">Grafik simulasi kunjungan harian per poli.</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border/50 bg-muted/20">
                      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,80 Q10,70 20,80 T40,60 T60,70 T80,40 T100,50 L100,100 L0,100 Z" fill="var(--primary)" opacity="0.1" />
                        <path d="M0,80 Q10,70 20,80 T40,60 T60,70 T80,40 T100,50" fill="none" stroke="var(--primary)" strokeWidth="2" />
                        <path d="M0,90 Q15,85 25,95 T50,80 T75,90 T100,85 L100,100 L0,100 Z" fill="var(--chart-2)" opacity="0.2" />
                        <path d="M0,90 Q15,85 25,95 T50,80 T75,90 T100,85" fill="none" stroke="var(--chart-2)" strokeWidth="2" />
                      </svg>
                      <div className="z-10 rounded-md border border-border bg-background/80 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
                        Area Chart Placeholder
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Section>

              {/* ================================================== */}
              {/*  10. TABS                                             */}
              {/* ================================================== */}
              <Section title="10. Tabs Component">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                    <TabsTrigger value="visits">Kunjungan</TabsTrigger>
                    <TabsTrigger value="prescriptions">Resep</TabsTrigger>
                    <TabsTrigger value="billing">Tagihan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-3">
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Konten tab Ringkasan — menampilkan overview data pasien, riwayat kunjungan terbaru, dan status pembayaran.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="visits" className="mt-3">
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Konten tab Kunjungan — daftar riwayat kunjungan pasien beserta detail tindakan.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="prescriptions" className="mt-3">
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Konten tab Resep — daftar e-resep yang pernah diberikan.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="billing" className="mt-3">
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Konten tab Tagihan — rincian tagihan dan status pembayaran.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </Section>

              {/* ================================================== */}
              {/*  11. AVATARS                                         */}
              {/* ================================================== */}
              <Section title="11. Avatars">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">DA</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Dr. Andi</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-chart-3 text-white font-medium">DB</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Drg. Budi</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-chart-2 text-white font-medium">DC</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Dr. Citra</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">NS</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Small (h-8)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium">LG</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Large (h-12)</span>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  12. PROGRESS BARS                                    */}
              {/* ================================================== */}
              <Section title="12. Progress Bars">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Stok Paracetamol</span>
                      <span className="tabular-nums text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75}>
                      <ProgressTrack>
                        <ProgressIndicator />
                      </ProgressTrack>
                    </Progress>
                  </div>
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Stok Amoxicillin</span>
                      <span className="tabular-nums text-warning">25%</span>
                    </div>
                    <Progress value={25}>
                      <ProgressTrack>
                        <ProgressIndicator className="bg-warning" />
                      </ProgressTrack>
                    </Progress>
                  </div>
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Target Kunjungan Harian</span>
                      <span className="tabular-nums text-success">92%</span>
                    </div>
                    <Progress value={92}>
                      <ProgressTrack>
                        <ProgressIndicator className="bg-success" />
                      </ProgressTrack>
                    </Progress>
                  </div>
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Stok Kritis</span>
                      <span className="tabular-nums text-destructive">8%</span>
                    </div>
                    <Progress value={8}>
                      <ProgressTrack>
                        <ProgressIndicator className="bg-destructive" />
                      </ProgressTrack>
                    </Progress>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  13. TOOLTIPS                                        */}
              {/* ================================================== */}
              <Section title="13. Tooltips">
                <div className="flex flex-wrap gap-3">
                  <Tooltip>
                    <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                      Hover untuk tooltip
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ini adalah tooltip dari Klinikai</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger render={<Button variant="outline" size="icon" />}>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Informasi tambahan untuk field ini</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger render={<span className="cursor-default" />}>
                      <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Selesai
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Kunjungan selesai pada 14:30 WIB</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  14. EMPTY STATE                                     */}
              {/* ================================================== */}
              <Section title="14. Empty State">
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-semibold">Belum Ada Data</h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Tidak ada kunjungan pasien untuk hari ini. Mulai dengan mendaftarkan pasien baru.
                    </p>
                    <Button className="mt-4" size="sm">
                      <Plus className="mr-2 h-3.5 w-3.5" /> Registrasi Pasien
                    </Button>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  15. LOADING / SKELETON                               */}
              {/* ================================================== */}
              <Section title="15. Loading States — Skeleton">
                <div className="space-y-4">
                  {/* KPI Skeleton */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">KPI Card Skeleton</p>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="shadow-sm">
                          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3.5 w-3.5" />
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <Skeleton className="h-7 w-32" />
                            <Skeleton className="mt-2 h-3 w-20" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Table Skeleton */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Table Row Skeleton</p>
                    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-10"><Skeleton className="h-4 w-4" /></TableHead>
                            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-3 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-3 w-20" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="ml-auto h-3 w-16" /></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i} className="h-9">
                              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  16. DROPDOWN MENU                                    */}
              {/* ================================================== */}
              <Section title="16. Dropdown Menu">
                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                      Aksi Pasien <ChevronDown className="ml-2 h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit Data</DropdownMenuItem>
                      <DropdownMenuItem><FileText className="mr-2 h-3.5 w-3.5" /> Lihat Rekam Medis</DropdownMenuItem>
                      <DropdownMenuItem><Stethoscope className="mr-2 h-3.5 w-3.5" /> Registrasi Kunjungan</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus Pasien
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  17. SPACING & GRID REFERENCE                        */}
              {/* ================================================== */}
              <Section title="17. Spacing Scale — 8px Base Unit">
                <div className="space-y-3 rounded-lg border bg-card p-4">
                  {[
                    { label: "8px — gap-2, p-2", className: "w-2 h-4" },
                    { label: "16px — gap-4, p-4", className: "w-4 h-4" },
                    { label: "24px — gap-6, p-6", className: "w-6 h-4" },
                    { label: "32px — gap-8, p-8", className: "w-8 h-4" },
                    { label: "48px — gap-12", className: "w-12 h-4" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`rounded-sm bg-primary ${item.className}`} />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ================================================== */}
              {/*  18. INTERACTION PATTERNS                             */}
              {/* ================================================== */}
              <Section title="18. Interaction Patterns">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Focus ring demo */}
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Focus Ring — ring-2 ring-ring ring-offset-2</p>
                    <div className="flex gap-2">
                      <Button size="sm">Tab ke sini</Button>
                      <Input placeholder="Atau ke sini" className="w-40" />
                    </div>
                    <p className="text-xs text-muted-foreground">Gunakan Tab key untuk melihat focus ring</p>
                  </div>

                  {/* Transition demo */}
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hover — transition-colors duration-150</p>
                    <div className="flex gap-2">
                      <div className="flex h-9 cursor-pointer items-center rounded-lg border px-3 text-sm transition-colors duration-150 hover:bg-accent">
                        Hover row effect
                      </div>
                      <Button variant="ghost" size="sm">Ghost hover</Button>
                    </div>
                  </div>

                  {/* Cursor pointer */}
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cursor — pointer on clickable</p>
                    <div className="flex gap-2">
                      <Badge className="cursor-pointer">Clickable badge</Badge>
                      <div className="flex h-9 cursor-pointer items-center rounded-lg border bg-muted/50 px-3 text-sm">Clickable element</div>
                    </div>
                  </div>

                  {/* Error pattern */}
                  <div className="space-y-2 rounded-lg border bg-card p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Error — role=alert + red border</p>
                    <Input className="border-destructive" defaultValue="Data tidak valid" />
                    <p className="text-xs text-destructive" role="alert">
                      <AlertCircle className="mr-1 inline h-3 w-3" />
                      Format NIK tidak valid (harus 16 digit)
                    </p>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  19. ICON SIZE REFERENCE                              */}
              {/* ================================================== */}
              <Section title="19. Icon Sizes — Lucide React">
                <div className="flex flex-wrap items-end gap-6 rounded-lg border bg-card p-4">
                  <div className="flex flex-col items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">14px (h-3.5)</span>
                    <span className="text-xs text-muted-foreground">Table inline</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">16px (h-4)</span>
                    <span className="text-xs text-muted-foreground">Buttons, nav</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">20px (h-5)</span>
                    <span className="text-xs text-muted-foreground">Page header</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">24px (h-6)</span>
                    <span className="text-xs text-muted-foreground">Empty state</span>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  20. SHADOW SCALE                                     */}
              {/* ================================================== */}
              <Section title="20. Shadow Scale">
                <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-6">
                  <div className="flex h-16 w-24 items-center justify-center rounded-md border bg-card shadow-xs">
                    <span className="text-xs text-muted-foreground">shadow-xs</span>
                  </div>
                  <div className="flex h-16 w-24 items-center justify-center rounded-md border bg-card shadow-sm">
                    <span className="text-xs text-muted-foreground">shadow-sm</span>
                  </div>
                  <div className="flex h-16 w-24 items-center justify-center rounded-md border bg-card shadow-md">
                    <span className="text-xs text-muted-foreground">shadow-md</span>
                  </div>
                  <div className="flex h-16 w-24 items-center justify-center rounded-md border bg-card shadow-lg">
                    <span className="text-xs text-muted-foreground">shadow-lg</span>
                  </div>
                </div>
              </Section>

              {/* ================================================== */}
              {/*  21. DARK MODE NOTE                                   */}
              {/* ================================================== */}
              <Section title="21. Dark Mode">
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    Gunakan tombol <strong>sun/moon</strong> di header untuk toggle dark mode.
                    Semua komponen di halaman ini mendukung light dan dark mode sesuai design system.
                    Primary bergeser ke <code className="font-mono text-xs text-primary">cyan-400 (#22D3EE)</code> di dark mode.
                  </p>
                </div>
              </Section>

            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
