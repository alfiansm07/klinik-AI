"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Download, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import { MASTER_ACTION_BUTTON_CLASSNAME } from "@/components/shared/master-data-ui";
import { Button, buttonVariants } from "@/components/ui/button";

// ─── Breadcrumb ────────────────────────────────────────────────

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/master/obat"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Obat & Alkes
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium text-foreground">Upload Master Data</span>
    </nav>
  );
}

// ─── Step Card ─────────────────────────────────────────────────

function StepCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {step}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function ObatUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan file .xlsx, .xls, atau .csv");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  }

  function handleUpload() {
    if (!selectedFile) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    setIsUploading(true);
    // TODO: Implement actual upload via server action
    // For now, simulate and show placeholder
    setTimeout(() => {
      setIsUploading(false);
      toast.info("Fitur upload belum tersedia. Akan diimplementasikan segera.");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1000);
  }

  function handleDownloadTemplate() {
    // TODO: Implement actual template download
    toast.info("Fitur download template belum tersedia. Akan diimplementasikan segera.");
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <div>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Upload Master Data Obat & Alkes
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Upload data obat dan alat kesehatan secara massal menggunakan file Excel.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-2xl space-y-4">
        {/* Step 1: Download Template */}
        <StepCard
          step={1}
          title="Download Template"
          description="Download template Excel yang sudah disesuaikan dengan format yang benar."
        >
          <Button
            variant="outline"
            className={MASTER_ACTION_BUTTON_CLASSNAME}
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4" />
            Download Template Excel
          </Button>
        </StepCard>

        {/* Step 2: Upload File */}
        <StepCard
          step={2}
          title="Upload File Excel"
          description="Pilih file Excel yang sudah diisi sesuai template, lalu klik Upload."
        >
          <div className="space-y-3">
            {/* File input area */}
            <button
              type="button"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 transition-colors hover:border-primary hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="h-8 w-8 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                {selectedFile ? (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Klik untuk memilih file, atau drag & drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      .xlsx, .xls, atau .csv (maks. 5MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </button>

            {/* Upload button */}
            <Button
              className={MASTER_ACTION_BUTTON_CLASSNAME}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Mengupload..." : "Upload File"}
            </Button>
          </div>
        </StepCard>
      </div>

      {/* Back link */}
      <div>
        <Link
          href="/master/obat"
          className={`${buttonVariants({ variant: "ghost" })} ${MASTER_ACTION_BUTTON_CLASSNAME}`}
        >
          &larr; Kembali ke Daftar Obat
        </Link>
      </div>
    </div>
  );
}
