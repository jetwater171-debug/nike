import type { Metadata } from "next";
import { Anton, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SiteTracker from "./components/SiteTracker";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-hero",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Camisa Brasil Jordan II 2026/27 | Premium Landing",
  description:
    "Landing page premium da Camisa Brasil Jordan II 2026/27 Jogador Masculina, com foco em design, atmosfera e tecnologia Aero-FIT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${cormorantGaramond.variable} ${anton.variable}`}>
        <SiteTracker />
        {children}
      </body>
    </html>
  );
}
