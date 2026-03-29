import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
