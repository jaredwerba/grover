import type { Metadata } from "next";

// The /join page itself is a client component ("use client"), so its
// metadata lives here in a server-component layout for the segment.
export const metadata: Metadata = {
  title: "Join Cove — Vermont Cannabis Companion",
  description:
    "Create your free Cove account to unlock the AI concierge, save favorite strains, and get personalized Vermont cannabis recommendations. Adults 21+.",
  openGraph: {
    title: "Join Cove",
    description:
      "Create your free Cove account to unlock the AI concierge and personalized Vermont cannabis recommendations.",
    url: "https://covebud.com/join",
    siteName: "Cove",
    type: "website",
  },
  alternates: { canonical: "https://covebud.com/join" },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
