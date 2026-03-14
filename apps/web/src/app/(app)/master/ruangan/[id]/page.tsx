import { notFound } from "next/navigation";
import { DoorOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getRuanganDetail } from "../actions";
import { RuanganDetailView } from "./detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RuanganDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getRuanganDetail(id);

  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Data Ruangan (${detail.name})`}
        description="Tinjau detail ruangan, konfigurasi panggil, dan status penggunaannya."
        icon={DoorOpen}
      />
      <RuanganDetailView detail={detail} />
    </div>
  );
}
