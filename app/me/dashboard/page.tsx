import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function MeDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/me");
  return <DashboardClient email={session.email} />;
}
