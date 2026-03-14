import { getPageAuthContext } from "@/lib/auth-helpers";

export default async function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getPageAuthContext("registration");

  return <>{children}</>;
}
