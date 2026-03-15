import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getPegawaiList } from "./actions";
import { PegawaiSchemaError } from "./pegawai-schema";
import { PegawaiView } from "./pegawai-view";

export default async function PegawaiPage() {
  try {
    const data = await getPegawaiList();

    return (
      <div className="space-y-6">
        <PageHeader
          title="Pegawai"
          description="Kelola data pegawai klinik, penempatan kerja, dan perizinan praktik utama."
          icon={Users}
        />
        <PegawaiView data={data} />
      </div>
    );
  } catch (error) {
    if (error instanceof PegawaiSchemaError) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Pegawai"
            description="Kelola data pegawai klinik, penempatan kerja, dan perizinan praktik utama."
            icon={Users}
          />
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
            <p className="font-medium text-destructive">Modul pegawai belum siap dibuka.</p>
            <p className="mt-1 text-muted-foreground">{error.message}</p>
          </div>
        </div>
      );
    }

    throw error;
  }
}
