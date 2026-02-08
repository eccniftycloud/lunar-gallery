import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import GlassCanvas from "@/components/ui/GlassCanvas";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gravity Gallery",
  description: "A cosmic journey through your astronomy photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 relative z-10">
            {children}
          </main>
          <GlassCanvas />
        </div>
      </body>
    </html>
  );
}
