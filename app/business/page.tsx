import type { Metadata } from "next";
import BusinessLanding from "@/components/b2b/BusinessLanding";

export const metadata: Metadata = {
  title: "Covebud — the Botanical Understanding Dashboard for Vermont Cannabis",
  description:
    "Covebud is a Botanical Understanding Dashboard: real-time dashboards, demand radar, and AI insights for Vermont growers and dispensaries — live menus, demand signals, and verified foot traffic in one place.",
  openGraph: {
    title: "Cove for Business — Vermont Cannabis Intelligence",
    description:
      "Know your market before they walk in. Demand radar, market gaps, price intelligence, and verified foot traffic for Vermont cannabis businesses.",
    url: "https://covebud.com/business",
    siteName: "Cove",
    type: "website",
  },
  alternates: {
    canonical: "https://covebud.com/business",
  },
};

export default function BusinessPage() {
  return <BusinessLanding />;
}
