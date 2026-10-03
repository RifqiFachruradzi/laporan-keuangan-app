import type { Metadata } from "next";
import { Archivo_Narrow } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AppShell from "@/components/AppShell";

// Arial Narrow is a system font; Archivo Narrow is a close web fallback for
// devices that don't have it installed.
const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-narrow",
});

export const metadata: Metadata = {
  title: "Laporan Keuangan",
  description: "Aplikasi Laporan Keuangan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivoNarrow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-[15px] bg-slate-50 text-slate-800">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
