import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import GlassCanvas from "@/components/ui/GlassCanvas";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lunar Gallery",
  description: "A cosmic observatory for your astronomy photography.",
};

import { auth } from "@/auth";

import { getAdminConfig } from "@/app/lib/actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const adminConfig = await getAdminConfig();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}
      >
        <div className="flex min-h-screen">
          <Sidebar session={session} siteTitle={adminConfig?.siteTitle || "Lunar Gallery"} />
          <main className="flex-1 lg:ml-64 p-4 pt-16 lg:pt-8 lg:p-8 relative z-10">
            {children}
          </main>
          <GlassCanvas />
        </div>
      </body>
    </html>
  );
}
