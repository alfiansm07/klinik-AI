import { ClipboardPlus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { getPageAuthContext } from "@/lib/auth-helpers";

import { getAssessmentWorklist } from "./actions";
import { AssessmentWorklistView } from "./worklist-view";

export default async function InitialAssessmentPage() {
  const [context, worklist] = await Promise.all([
    getPageAuthContext("care"),
    getAssessmentWorklist(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asesmen Awal"
        description={`Pantau antrean asesmen awal ${context.activeMembership?.clinicName ?? "klinik aktif"}, lanjutkan draft skrining, dan handover pasien ke dokter tanpa pindah dari worklist utama.`}
        icon={ClipboardPlus}
      />
      <AssessmentWorklistView rows={worklist} />
    </div>
  );
}
