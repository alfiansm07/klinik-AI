import { getPageAuthContext } from "@/lib/auth-helpers";

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  // Enforce module access for master data
  await getPageAuthContext("master");

  return <>{children}</>;
}
