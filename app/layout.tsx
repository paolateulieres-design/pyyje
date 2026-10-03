import type { Metadata } from "next";
import "./globals.css";
import RecoveryRedirect from "@/components/RecoveryRedirect";

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
      <body className="min-h-screen">
        <RecoveryRedirect />
        {children}
      </body>
    </html>
  );
}
