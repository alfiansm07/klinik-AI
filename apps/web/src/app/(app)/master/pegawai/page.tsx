import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getPegawaiList } from "./actions";
import { PegawaiView } from "./pegawai-view";

export default async function PegawaiPage() {
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
}
