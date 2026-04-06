import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MeClient from "./MeClient";

export default async function MePage() {
  const session = await getSession();
  if (session) redirect("/me/dashboard");
  return <MeClient />;
}
