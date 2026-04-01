import { redirect } from "next/navigation";
import { verifyMagicToken, createSession } from "@/lib/auth";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/join?error=missing_token");
  }

  const email = await verifyMagicToken(token);

  if (!email) {
    redirect("/join?error=invalid_token");
  }

  await createSession(email);
  redirect("/chat");
}
