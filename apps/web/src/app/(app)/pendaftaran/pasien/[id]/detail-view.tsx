"use client";

import Link from "next/link";
import type { Route } from "next";

import {
  MASTER_ACTION_BUTTON_CLASSNAME,
  MasterDetailSection,
  type MasterDetailField,
} from "@/components/shared/master-data-ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { RegistrationDetail } from "../registration-list-shared";

type RegistrationDetailViewProps = {
  detail: RegistrationDetail;
};

export function RegistrationDetailView({ detail }: RegistrationDetailViewProps) {
  const leftFields: MasterDetailField[] = [
    { label: "ID", value: detail.registrationId },
    { label: "Tanggal Pendaftaran", value: detail.registrationDateTime },
    { label: "Antrean Poli", value: detail.queueNumber },
    {
      label: "Data Pasien",
      value: (
        <div className="space-y-1">
          {detail.patientInfoLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ),
    },
    {
      label: "Alergi Pasien",
      value: (
        <div className="space-y-2">
          {detail.allergyGroups.map((group) => (
            <div key={group.label}>
              <p className="font-medium">{group.label} :</p>
              <ul className="list-disc pl-5">
                {group.values.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const middleFields: MasterDetailField[] = [
    { label: "Umur", value: detail.ageLabel },
    { label: "Kunjungan", value: detail.visitKindLabel },
    { label: "Asuransi", value: detail.guarantorLabel },
    { label: "Pembayaran", value: <span className="font-semibold">{detail.paymentStatusLabel}</span> },
    { label: "Rujukan Dari", value: detail.referralSourceLabel },
    { label: "Nama Perujuk", value: detail.referrerNameLabel },
    { label: "Dibuat pada / oleh", value: detail.createdByLabel },
    { label: "Diubah pada / oleh", value: detail.updatedByLabel },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        {detail.actionButtons.slice(0, 3).map((button) => (
          <Link
            key={button.id}
            href={"/pendaftaran/pasien" as Route}
            className={cn(getActionButtonClass(button.tone), MASTER_ACTION_BUTTON_CLASSNAME)}
          >
            {button.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.05fr)_minmax(0,1.1fr)]">
        <MasterDetailSection title="Ringkasan Pendaftaran" fields={leftFields} />
        <MasterDetailSection title="Administrasi Kunjungan" fields={middleFields} />
        <div className="space-y-4">
          <MasterDetailSection title="Data Pelayanan">
            <div className="overflow-hidden rounded-xl border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Instalasi</TableHead>
                    <TableHead>Poli / Ruangan</TableHead>
                    <TableHead>Status Asesmen</TableHead>
                    <TableHead className="w-[180px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.serviceRows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.registrationDateTime}</TableCell>
                      <TableCell>{row.installationLabel}</TableCell>
                      <TableCell>{row.roomLabel}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs font-semibold">
                          {row.screeningLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.actionHref && row.actionLabel ? (
                          <Link
                            href={row.actionHref as Route}
                            className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-lg px-4 text-sm")}
                          >
                            {row.actionLabel}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">Tidak ada aksi</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </MasterDetailSection>

          <MasterDetailSection title="Data Skrining">
            <div className="overflow-hidden rounded-xl border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="w-[180px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.screeningRows.length > 0 ? (
                    detail.screeningRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs font-semibold">
                            {row.screeningLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.dateLabel}</TableCell>
                        <TableCell>{row.noteLabel}</TableCell>
                        <TableCell className="text-right">
                          {row.actionHref && row.actionLabel ? (
                            <Link
                              href={row.actionHref as Route}
                              className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-lg px-4 text-sm")}
                            >
                              {row.actionLabel}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">Tidak ada aksi</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4}>Data tidak ditemukan.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </MasterDetailSection>

          <MasterDetailSection title="Riwayat Pendaftaran Hari Ini">
            <div className="overflow-hidden rounded-xl border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Poli / Ruangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.sameDayHistoryRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.dateLabel}</TableCell>
                      <TableCell>{row.roomLabel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </MasterDetailSection>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {detail.actionButtons.slice(3).map((button) => (
          <Link
            key={button.id}
            href={"/pendaftaran/pasien" as Route}
            className={cn(getActionButtonClass(button.tone), MASTER_ACTION_BUTTON_CLASSNAME)}
          >
            {button.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function getActionButtonClass(tone: RegistrationDetail["actionButtons"][number]["tone"]) {
  switch (tone) {
    case "outline":
      return buttonVariants({ variant: "outline" });
    case "success":
      return "inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700";
    case "danger":
      return "inline-flex items-center justify-center rounded-lg bg-destructive px-4 text-sm font-medium text-white hover:bg-destructive/90";
    case "default":
      return buttonVariants({ variant: "default" });
  }
}
