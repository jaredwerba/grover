import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatApp from "@/components/ChatApp";

export default async function ChatPage() {
  const session = await getSession();
  if (!session) redirect("/join");
  return <ChatApp />;
}
