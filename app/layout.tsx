// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast'; // C'est une bonne pratique de mettre le Toaster ici
import { AuthProvider } from "@/contexts/AuthContext"; // <-- IMPORTER LE FOURNISSEUR

export const metadata: Metadata = {
  title: "The Good Doctor - Simulation Médicale",
  description: "Plateforme de simulation médicale interactive et d'aide à la décision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {/* ENVELOPPER L'APPLICATION AVEC LE FOURNISSEUR */}
        <AuthProvider>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </AuthProvider>
      </body>
    </html>
  );
}