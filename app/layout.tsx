import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PYYJE — Plateforme Piges",
  description: "Mets en relation journalistes pigistes et rédactions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
