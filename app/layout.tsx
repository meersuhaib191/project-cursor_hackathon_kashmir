import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "LifeLine AI | Smart Ambulance Routing System",
  description: "Real-time AI-powered ambulance routing and traffic orchestration platform for smart cities.",
  keywords: ["Ambulance", "AI", "Traffic Control", "Smart City", "Routing", "Next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-red-500/30 selection:text-red-200`}>
        {children}
      </body>
    </html>
  );
}
