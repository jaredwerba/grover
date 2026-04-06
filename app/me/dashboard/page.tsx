import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MeDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/me");

  return (
    <div className="min-h-screen bg-forest-deep px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Welcome header */}
        <div className="mb-10">
          <h1 className="text-3xl font-groovy text-amber tracking-wide leading-tight mb-1">
            Me
          </h1>
          <p className="text-cream-muted text-sm">
            Welcome back,{" "}
            <span className="text-cream font-medium">{session.email}</span>
          </p>
        </div>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <DashCard
            icon={<LeafIcon />}
            title="My Strains"
            description="Saved strains"
          />
          <DashCard
            icon={<PinIcon />}
            title="My Dispensaries"
            description="Saved dispensaries"
          />
          <DashCard
            icon={<ChatIcon />}
            title="My History"
            description="Chat history"
          />
        </div>

        {/* Sign out */}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-cream-muted hover:text-cream transition-colors underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

function DashCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-forest rounded-2xl border border-forest-mid p-6">
      <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center text-amber mb-4">
        {icon}
      </div>
      <h2 className="text-cream font-semibold text-sm mb-1">{title}</h2>
      <p className="text-cream-muted text-xs">{description}</p>
      <p className="text-cream-muted/40 text-xs mt-3">Coming soon</p>
    </div>
  );
}

function LeafIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
