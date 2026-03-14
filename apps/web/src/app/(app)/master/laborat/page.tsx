import { FlaskConical } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getLaboratList } from "./actions";
import { LaboratView } from "./laborat-view";

export default async function LaboratPage() {
  const data = await getLaboratList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jenis Laboratorium"
        description="Kelola data jenis pemeriksaan laboratorium klinik."
        icon={FlaskConical}
      />
      <LaboratView data={data} />
    </div>
  );
}
