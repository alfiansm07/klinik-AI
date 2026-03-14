"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Settings,
  Trash2,
  Pencil,
  Upload,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────
// Proposed override classes (simulating new sizes)
// ─────────────────────────────────────────────────
const proposed = {
  button: {
    default: "h-10 px-4 text-sm gap-2",
    sm: "h-8 px-3 text-sm gap-1.5",
    lg: "h-11 px-5 text-sm gap-2",
    xs: "h-7 px-2 text-xs gap-1",
    icon: "!size-10",
    "icon-sm": "!size-8",
    "icon-lg": "!size-11",
  },
  input: "!h-10 text-sm",
  textarea: "text-sm px-3 py-2.5",
  label: "text-sm font-medium",
  select: "!h-10 text-sm",
  badge: "h-6 px-2.5 text-xs",
  switch: "!h-[22px] !w-[40px] [&_[data-slot=switch-thumb]]:!size-[18px]",
  tableHead: "h-11 text-xs font-semibold",
  tableCell: "px-3 py-2.5 text-sm",
  dialogContent: "max-w-lg p-6 text-sm",
  dialogTitle: "text-lg font-semibold",
  dialogDescription: "text-sm",
};

// ─────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────
function CompareSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-bold text-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-8">
        {children}
      </div>
    </div>
  );
}

function SideLabel({ type }: { type: "current" | "proposed" }) {
  return (
    <div
      className={cn(
        "mb-3 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
        type === "current"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      )}
    >
      {type === "current" ? "CURRENT (base-lyra)" : "PROPOSED (standard)"}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Sample table data
// ─────────────────────────────────────────────────
const sampleMeds = [
  { code: "O2600001", name: "Paracetamol 500mg", category: "OBAT", unitBig: "Box", unitSmall: "Tablet", status: "Aktif" },
  { code: "O2600002", name: "Amoxicillin 500mg", category: "OBAT", unitBig: "Box", unitSmall: "Kapsul", status: "Aktif" },
  { code: "A2600001", name: "Syringe 3ml", category: "ALKES", unitBig: "Box", unitSmall: "Pcs", status: "Non-Aktif" },
];

// ─────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────
export default function SizeComparisonPage() {
  const [dialogCurrentOpen, setDialogCurrentOpen] = useState(false);
  const [dialogProposedOpen, setDialogProposedOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Size Comparison: Current vs Proposed
          </h1>
          <p className="text-sm text-muted-foreground">
            Side-by-side comparison of component sizes. Left = current base-lyra
            (compact). Right = proposed standard sizing (h-10 based).
          </p>
        </div>

        {/* ───── BUTTONS ───── */}
        <CompareSection title="Buttons">
          {/* Current */}
          <div className="space-y-4">
            <SideLabel type="current" />
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Default: h-8 (32px), text-xs (12px)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button>
                  <Plus data-icon="inline-start" /> Tambah Obat
                </Button>
                <Button variant="outline">
                  <Download data-icon="inline-start" /> Export
                </Button>
                <Button variant="secondary">
                  <Settings data-icon="inline-start" /> Atur Kolom
                </Button>
                <Button variant="destructive">
                  <Trash2 data-icon="inline-start" /> Hapus
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Size sm: h-7 (28px)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="sm" variant="outline">Small Outline</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Size lg: h-9 (36px)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="lg">
                  <Upload data-icon="inline-start" /> Upload Master Data
                </Button>
                <Button size="lg" variant="outline">Large Outline</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Icon buttons
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="icon-sm" variant="ghost"><Pencil /></Button>
                <Button size="icon" variant="outline"><Search /></Button>
                <Button size="icon-lg" variant="secondary"><Settings /></Button>
              </div>
            </div>
          </div>

          {/* Proposed */}
          <div className="space-y-4">
            <SideLabel type="proposed" />
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Default: h-10 (40px), text-sm (14px)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button className={proposed.button.default}>
                  <Plus data-icon="inline-start" /> Tambah Obat
                </Button>
                <Button variant="outline" className={proposed.button.default}>
                  <Download data-icon="inline-start" /> Export
                </Button>
                <Button variant="secondary" className={proposed.button.default}>
                  <Settings data-icon="inline-start" /> Atur Kolom
                </Button>
                <Button variant="destructive" className={proposed.button.default}>
                  <Trash2 data-icon="inline-start" /> Hapus
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Size sm: h-8 (32px)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" className={proposed.button.sm}>Small</Button>
                <Button size="sm" variant="outline" className={proposed.button.sm}>Small Outline</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Size lg: h-11 (44px)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="lg" className={proposed.button.lg}>
                  <Upload data-icon="inline-start" /> Upload Master Data
                </Button>
                <Button size="lg" variant="outline" className={proposed.button.lg}>Large Outline</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Icon buttons
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="icon-sm" variant="ghost" className={proposed.button["icon-sm"]}><Pencil /></Button>
                <Button size="icon" variant="outline" className={proposed.button.icon}><Search /></Button>
                <Button size="icon-lg" variant="secondary" className={proposed.button["icon-lg"]}><Settings /></Button>
              </div>
            </div>
          </div>
        </CompareSection>

        {/* ───── INPUT + LABEL ───── */}
        <CompareSection title="Input & Label">
          {/* Current */}
          <div className="space-y-4">
            <SideLabel type="current" />
            <p className="text-xs text-muted-foreground">
              Input h-9 (36px), Label text-xs (12px)
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cur-name">Nama Barang</Label>
                <Input id="cur-name" placeholder="Cari nama barang..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cur-code">Kode Barang</Label>
                <Input id="cur-code" placeholder="O2600001" disabled />
              </div>
            </div>
          </div>

          {/* Proposed */}
          <div className="space-y-4">
            <SideLabel type="proposed" />
            <p className="text-xs text-muted-foreground">
              Input h-10 (40px), Label text-sm (14px) font-medium
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="prop-name" className={proposed.label}>Nama Barang</Label>
                <Input id="prop-name" placeholder="Cari nama barang..." className={proposed.input} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prop-code" className={proposed.label}>Kode Barang</Label>
                <Input id="prop-code" placeholder="O2600001" disabled className={proposed.input} />
              </div>
            </div>
          </div>
        </CompareSection>

        {/* ───── TEXTAREA ───── */}
        <CompareSection title="Textarea">
          {/* Current */}
          <div className="space-y-4">
            <SideLabel type="current" />
            <p className="text-xs text-muted-foreground">
              text-xs (12px), px-2.5 py-2
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="cur-comp">Komposisi</Label>
              <Textarea id="cur-comp" placeholder="Masukkan komposisi obat..." rows={3} />
            </div>
          </div>

          {/* Proposed */}
          <div className="space-y-4">
            <SideLabel type="proposed" />
            <p className="text-xs text-muted-foreground">
              text-sm (14px), px-3 py-2.5
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="prop-comp" className={proposed.label}>Komposisi</Label>
              <Textarea id="prop-comp" placeholder="Masukkan komposisi obat..." rows={3} className={proposed.textarea} />
            </div>
          </div>
        </CompareSection>

        {/* ───── SELECT ───── */}
        <CompareSection title="Select">
          {/* Current */}
          <div className="space-y-4">
            <SideLabel type="current" />
            <p className="text-xs text-muted-foreground">
              h-9 (36px), text-sm
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obat">OBAT</SelectItem>
                    <SelectItem value="alkes">ALKES</SelectItem>
                    <SelectItem value="bhp">BHP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Golongan Obat</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih golongan obat --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bebas">Bebas</SelectItem>
                    <SelectItem value="keras">Keras</SelectItem>
                    <SelectItem value="narkotik">Narkotik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Proposed */}
          <div className="space-y-4">
            <SideLabel type="proposed" />
            <p className="text-xs text-muted-foreground">
              h-10 (40px), text-sm
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className={proposed.label}>Kategori</Label>
                <Select>
                  <SelectTrigger className={cn("w-full", proposed.select)}>
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obat">OBAT</SelectItem>
                    <SelectItem value="alkes">ALKES</SelectItem>
                    <SelectItem value="bhp">BHP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={proposed.label}>Golongan Obat</Label>
                <Select>
                  <SelectTrigger className={cn("w-full", proposed.select)}>
                    <SelectValue placeholder="-- Pilih golongan obat --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bebas">Bebas</SelectItem>
                    <SelectItem value="keras">Keras</SelectItem>
                    <SelectItem value="narkotik">Narkotik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CompareSection>

        {/* ───── SWITCH + BADGE ───── */}
        <CompareSection title="Switch & Badge">
          {/* Current */}
          <div className="space-y-4">
            <SideLabel type="current" />
            <p className="text-xs text-muted-foreground">
              Switch: 18.4x32px, Badge: h-5
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>AKTIF</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Label>NON AKTIF</Label>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Aktif</Badge>
              <Badge variant="destructive">Non-Aktif</Badge>
              <Badge variant="secondary">Draft</Badge>
              <Badge variant="outline">KFA Mapped</Badge>
            </div>
          </div>

          {/* Proposed */}
          <div className="space-y-4">
            <SideLabel type="proposed" />
            <p className="text-xs text-muted-foreground">
              Switch: 22x40px, Badge: h-6
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch defaultChecked className={proposed.switch} />
                <Label className={proposed.label}>AKTIF</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch className={proposed.switch} />
                <Label className={proposed.label}>NON AKTIF</Label>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={proposed.badge}>Aktif</Badge>
              <Badge variant="destructive" className={proposed.badge}>Non-Aktif</Badge>
              <Badge variant="secondary" className={proposed.badge}>Draft</Badge>
              <Badge variant="outline" className={proposed.badge}>KFA Mapped</Badge>
            </div>
          </div>
        </CompareSection>

        {/* ───── TABLE ───── */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Table
          </h2>

          {/* Current Table */}
          <div className="space-y-3">
            <SideLabel type="current" />
            <p className="text-xs text-muted-foreground">
              Header: h-9, text-xs (12px) | Cell: p-2, text-sm (14px)
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Kode Barang</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan Besar</TableHead>
                  <TableHead>Satuan Kecil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleMeds.map((med, i) => (
                  <TableRow key={med.code}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{med.code}</TableCell>
                    <TableCell>{med.name}</TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell>{med.unitBig}</TableCell>
                    <TableCell>{med.unitSmall}</TableCell>
                    <TableCell>
                      <Badge variant={med.status === "Aktif" ? "default" : "destructive"}>
                        {med.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon-sm" variant="ghost"><Pencil /></Button>
                        <Button size="icon-sm" variant="ghost"><Trash2 /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Proposed Table */}
          <div className="mt-6 space-y-3">
            <SideLabel type="proposed" />
            <p className="text-xs text-muted-foreground">
              Header: h-11, text-xs font-semibold | Cell: px-3 py-2.5, text-sm
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn("w-12", proposed.tableHead)}>No</TableHead>
                  <TableHead className={proposed.tableHead}>Kode Barang</TableHead>
                  <TableHead className={proposed.tableHead}>Nama Barang</TableHead>
                  <TableHead className={proposed.tableHead}>Kategori</TableHead>
                  <TableHead className={proposed.tableHead}>Satuan Besar</TableHead>
                  <TableHead className={proposed.tableHead}>Satuan Kecil</TableHead>
                  <TableHead className={proposed.tableHead}>Status</TableHead>
                  <TableHead className={cn("w-20", proposed.tableHead)}>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleMeds.map((med, i) => (
                  <TableRow key={med.code} className="cursor-pointer">
                    <TableCell className={proposed.tableCell}>{i + 1}</TableCell>
                    <TableCell className={proposed.tableCell}>{med.code}</TableCell>
                    <TableCell className={proposed.tableCell}>{med.name}</TableCell>
                    <TableCell className={proposed.tableCell}>{med.category}</TableCell>
                    <TableCell className={proposed.tableCell}>{med.unitBig}</TableCell>
                    <TableCell className={proposed.tableCell}>{med.unitSmall}</TableCell>
                    <TableCell className={proposed.tableCell}>
                      <Badge
                        variant={med.status === "Aktif" ? "default" : "destructive"}
                        className={proposed.badge}
                      >
                        {med.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={proposed.tableCell}>
                      <div className="flex gap-1">
                        <Button size="icon-sm" variant="ghost" className={proposed.button["icon-sm"]}><Pencil /></Button>
                        <Button size="icon-sm" variant="ghost" className={proposed.button["icon-sm"]}><Trash2 /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ───── FILTER BAR (Master Data style) ───── */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Filter Bar (Master Data Style)
          </h2>

          {/* Current */}
          <div className="space-y-3">
            <SideLabel type="current" />
            <div className="flex flex-wrap items-center gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="obat">Obat</SelectItem>
                  <SelectItem value="alkes">Alkes</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Cari Nama Barang" className="w-48" />
              <Button><Search data-icon="inline-start" /> Cari</Button>
              <Button variant="outline"><Download data-icon="inline-start" /> Export</Button>
              <Button variant="secondary"><Settings data-icon="inline-start" /> Atur Kolom</Button>
            </div>
          </div>

          {/* Proposed */}
          <div className="mt-4 space-y-3">
            <SideLabel type="proposed" />
            <div className="flex flex-wrap items-center gap-2">
              <Select>
                <SelectTrigger className={cn("w-44", proposed.select)}>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className={cn("w-44", proposed.select)}>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="obat">Obat</SelectItem>
                  <SelectItem value="alkes">Alkes</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Cari Nama Barang" className={cn("w-52", proposed.input)} />
              <Button className={proposed.button.default}><Search data-icon="inline-start" /> Cari</Button>
              <Button variant="outline" className={proposed.button.default}><Download data-icon="inline-start" /> Export</Button>
              <Button variant="secondary" className={proposed.button.default}><Settings data-icon="inline-start" /> Atur Kolom</Button>
            </div>
          </div>
        </div>

        {/* ───── DIALOG ───── */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Dialog / Modal
          </h2>

          <div className="grid grid-cols-2 gap-8">
            {/* Current Dialog */}
            <div className="space-y-4">
              <SideLabel type="current" />
              <p className="text-xs text-muted-foreground">
                max-w-sm (384px), p-4, title text-sm, body text-xs
              </p>
              <Dialog open={dialogCurrentOpen} onOpenChange={setDialogCurrentOpen}>
                <DialogTrigger render={<Button variant="outline" />}>
                  Open Current Dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Obat & Alat Kesehatan</DialogTitle>
                    <DialogDescription>
                      Form ini menggunakan ukuran current base-lyra. Perhatikan ukuran teks dan padding.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Nama Barang</Label>
                      <Input placeholder="Nama barang" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kategori</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- Pilih --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="obat">OBAT</SelectItem>
                          <SelectItem value="alkes">ALKES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Komposisi</Label>
                      <Textarea placeholder="Komposisi..." rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogCurrentOpen(false)}>Batal</Button>
                    <Button>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Proposed Dialog */}
            <div className="space-y-4">
              <SideLabel type="proposed" />
              <p className="text-xs text-muted-foreground">
                max-w-lg (512px), p-6, title text-lg, body text-sm
              </p>
              <Dialog open={dialogProposedOpen} onOpenChange={setDialogProposedOpen}>
                <DialogTrigger render={<Button variant="outline" className={proposed.button.default} />}>
                  Open Proposed Dialog
                </DialogTrigger>
                <DialogContent className={proposed.dialogContent}>
                  <DialogHeader>
                    <DialogTitle className={proposed.dialogTitle}>Tambah Obat & Alat Kesehatan</DialogTitle>
                    <DialogDescription className={proposed.dialogDescription}>
                      Form ini menggunakan ukuran proposed standard. Perhatikan ukuran teks dan padding yang lebih besar.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className={proposed.label}>Nama Barang</Label>
                      <Input placeholder="Nama barang" className={proposed.input} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={proposed.label}>Kategori</Label>
                      <Select>
                        <SelectTrigger className={cn("w-full", proposed.select)}>
                          <SelectValue placeholder="-- Pilih --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="obat">OBAT</SelectItem>
                          <SelectItem value="alkes">ALKES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className={proposed.label}>Komposisi</Label>
                      <Textarea placeholder="Komposisi..." rows={2} className={proposed.textarea} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className={proposed.button.default} onClick={() => setDialogProposedOpen(false)}>Batal</Button>
                    <Button className={proposed.button.default}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* ───── FULL MOCK: Master Data Page ───── */}
        <div className="space-y-4 rounded-xl border-2 border-primary/20 bg-card p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Full Mock: Master Data Obat (Proposed Sizing)
          </h2>
          <p className="text-sm text-muted-foreground">
            Preview halaman master data obat menggunakan ukuran proposed.
          </p>

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              Master Data Obat & Alat Kesehatan
            </h3>
            <div className="flex items-center gap-2">
              <Button className={cn(proposed.button.default, "bg-orange-500 hover:bg-orange-600 text-white")}>
                <Upload data-icon="inline-start" /> Upload Master Data
              </Button>
              <Button className={proposed.button.default}>
                <Plus data-icon="inline-start" /> Tambah Obat & Alkes
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select>
                <SelectTrigger className={cn("w-44", proposed.select)}>
                  <SelectValue placeholder="Semua Status KFA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status KFA</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className={cn("w-36", proposed.select)}>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className={cn("w-40", proposed.select)}>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="obat">Obat</SelectItem>
                  <SelectItem value="alkes">Alkes</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Cari Nama Barang" className={cn("w-52", proposed.input)} />
              <Button className={cn(proposed.button.default, "bg-amber-500 hover:bg-amber-600 text-white")}>
                <Search data-icon="inline-start" /> Cari
              </Button>
              <Button variant="outline" className={proposed.button.default}>
                <Download data-icon="inline-start" /> Export
              </Button>
              <Button variant="secondary" className={proposed.button.default}>
                <Filter data-icon="inline-start" /> Atur Kolom
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn("w-12", proposed.tableHead)}>No</TableHead>
                <TableHead className={proposed.tableHead}>Kode Barang</TableHead>
                <TableHead className={proposed.tableHead}>Nama Barang</TableHead>
                <TableHead className={proposed.tableHead}>Kategori</TableHead>
                <TableHead className={proposed.tableHead}>Satuan Besar</TableHead>
                <TableHead className={proposed.tableHead}>Satuan Kecil</TableHead>
                <TableHead className={proposed.tableHead}>Kode KFA</TableHead>
                <TableHead className={proposed.tableHead}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleMeds.map((med, i) => (
                <TableRow key={med.code} className="cursor-pointer hover:bg-muted/70">
                  <TableCell className={proposed.tableCell}>{i + 1}</TableCell>
                  <TableCell className={cn(proposed.tableCell, "font-mono text-xs")}>{med.code}</TableCell>
                  <TableCell className={proposed.tableCell}>{med.name}</TableCell>
                  <TableCell className={proposed.tableCell}>{med.category}</TableCell>
                  <TableCell className={proposed.tableCell}>{med.unitBig}</TableCell>
                  <TableCell className={proposed.tableCell}>{med.unitSmall}</TableCell>
                  <TableCell className={cn(proposed.tableCell, "text-muted-foreground")}>-</TableCell>
                  <TableCell className={proposed.tableCell}>
                    <Badge
                      variant={med.status === "Aktif" ? "default" : "destructive"}
                      className={proposed.badge}
                    >
                      {med.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <Label className={proposed.label}>Tampilkan</Label>
            <Select defaultValue="10">
              <SelectTrigger className={cn("w-20", proposed.select)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </div>
  );
}
