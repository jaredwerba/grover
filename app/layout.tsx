import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Alfa_Slab_One } from "next/font/google";
import Image from "next/image";
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
      <body className="h-full text-cream antialiased flex flex-col" style={{ background: "transparent" }}>
        {/* Ski map — truly fixed at bottom, behind all content */}
        <div className="fixed bottom-0 left-0 right-0" style={{ zIndex: 0 }}>
          <Image
            src="/images/footer.jpg"
            alt="Vermont ski trail map"
            width={1020}
            height={428}
            className="w-full h-auto block"
          />
          {/* Gradient overlay at top of ski map — blends with page content */}
          <div className="absolute top-0 left-0 right-0" style={{ height: "160px", background: "linear-gradient(to bottom, #0b2d1b 0%, #0b2d1b 20%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center py-3 gap-1"
            style={{ background: "#0b2d1b" }}>
            <p className="text-white text-xs tracking-widest uppercase">
              Cove · Adults 21+ Only · Vermont State Law Applies
            </p>
            <p className="text-white/60 text-xs tracking-wide">
              Daniels AI · 2026
            </p>
          </div>
        </div>
        <MountainBackground />
        <ServiceWorkerRegister />
        <AgeGate>
          <Nav isAuthenticated={isAuthenticated} />
          <div className="flex-1 flex flex-col min-h-0" style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </AgeGate>
      </body>
    </html>
  );
}
