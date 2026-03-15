import { notFound } from "next/navigation";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getPegawaiDetail } from "../actions";
import { PegawaiSchemaError } from "../pegawai-schema";
import { PegawaiDetailView } from "./detail-view";

type PegawaiDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PegawaiDetailPage({ params }: PegawaiDetailPageProps) {
  const { id } = await params;

  try {
    const detail = await getPegawaiDetail(id);

    if (!detail) {
      notFound();
    }

    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <PageHeader
          title={detail.fullName}
          description="Detail pegawai, penempatan, dan perizinan praktik."
          icon={Users}
        />
        <PegawaiDetailView detail={detail} />
      </div>
    );
  } catch (error) {
    if (error instanceof PegawaiSchemaError) {
      return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <PageHeader
            title="Pegawai"
            description="Detail pegawai, penempatan, dan perizinan praktik."
            icon={Users}
          />
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
            <p className="font-medium text-destructive">Detail pegawai belum dapat dimuat.</p>
            <p className="mt-1 text-muted-foreground">{error.message}</p>
          </div>
        </div>
      );
    }

    throw error;
  }
}
