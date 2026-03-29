import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
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
      <body className={cormorantGaramond.variable}>{children}</body>
    </html>
  );
}
