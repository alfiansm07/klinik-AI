import { Calculator } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getRoundingSettings } from "../klinik/actions";
import { PembulatanForm } from "./pembulatan-form";

export default async function PembulatanPage() {
  const settings = await getRoundingSettings();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="Konfigurasi Pembulatan"
        description="Atur nama dan nilai pembulatan untuk transaksi klinik."
        icon={Calculator}
      />
      <PembulatanForm defaultValues={settings} />
    </div>
  );
}
