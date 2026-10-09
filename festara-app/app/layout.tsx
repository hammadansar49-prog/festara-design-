import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import { RouteFlood } from "@/components/route-flood";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", axes: ["opsz"] });
const instrument = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", display: "swap", weight: "400", style: ["normal", "italic"] });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Festara", template: "%s | Festara" },
  description: "Plan an event together: guests, budget and tasks in one shared place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${instrument.variable} ${geist.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <RouteFlood />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
