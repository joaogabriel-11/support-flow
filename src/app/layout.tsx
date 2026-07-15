import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Flow",
  description: "Gestão de chamados de suporte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
