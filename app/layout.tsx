import type { Metadata, Viewport } from "next";
import { Geist_Mono, Fascinate, Quicksand } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AgeGate from "@/components/AgeGate";
import Nav from "@/components/Nav";
import MountainBackground from "@/components/MountainBackground";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display / groovy headers — 1970s hippie psychedelic
const fascinate = Fascinate({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-groovy",
});

// Pairing body font — warm, rounded, legible
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#1a4a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Cove",
  description: "Your Vermont cannabis companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cove",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    other: [
      { rel: "android-chrome", url: "/icons/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/icons/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isAuthenticated = session !== null;

  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${fascinate.variable} ${quicksand.variable} h-full`}
    >
      <body className="min-h-screen text-cream antialiased flex flex-col font-quicksand" style={{ background: "#0b2d1b" }}>
        <MountainBackground />
        <ServiceWorkerRegister />
        <AgeGate isAuthenticated={isAuthenticated}>
          <Nav isAuthenticated={isAuthenticated} email={session?.email ?? null} />
          {/* z-index 1 — sits on top of fixed footer, slides away on scroll */}
          <div className="flex-1 flex flex-col">{children}</div>
        </AgeGate>
        <Footer />
      </body>
    </html>
  );
}
