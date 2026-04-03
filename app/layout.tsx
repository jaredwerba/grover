import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Alfa_Slab_One } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AgeGate from "@/components/AgeGate";
import Nav from "@/components/Nav";
import MountainBackground from "@/components/MountainBackground";
import { getSession } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alfaSlabOne = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-groovy",
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
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
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
      className={`${geistSans.variable} ${geistMono.variable} ${alfaSlabOne.variable} h-full`}
    >
      <body className="h-full text-cream antialiased flex flex-col" style={{ background: "#0b2d1b" }}>
        <MountainBackground />
        <ServiceWorkerRegister />
        <AgeGate>
          <Nav isAuthenticated={isAuthenticated} />
          {/* z-index 1 — sits on top of fixed footer, slides away on scroll */}
          <div className="flex-1 flex flex-col min-h-0">{children}</div>
        </AgeGate>
      </body>
    </html>
  );
}
