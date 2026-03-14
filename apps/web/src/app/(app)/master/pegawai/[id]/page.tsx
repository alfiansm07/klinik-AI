import { notFound } from "next/navigation";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getPegawaiDetail } from "../actions";
import { PegawaiDetailView } from "./detail-view";

type PegawaiDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PegawaiDetailPage({ params }: PegawaiDetailPageProps) {
  const { id } = await params;
  const detail = await getPegawaiDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.fullName}
        description="Detail pegawai, penempatan, dan perizinan praktik."
        icon={Users}
      />
      <PegawaiDetailView detail={detail} />
    </div>
  );
}
