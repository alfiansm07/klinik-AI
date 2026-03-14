import { DoorOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getRuanganList } from "./actions";
import { RuanganView } from "./ruangan-view";

export default async function RuanganPage() {
  const data = await getRuanganList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ruangan"
        description="Kelola data ruangan klinik untuk operasional dan antrian dasar."
        icon={DoorOpen}
      />
      <RuanganView data={data} />
    </div>
  );
}
