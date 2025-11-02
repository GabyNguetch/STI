// app/expert/layout.tsx
'use client';

import React from 'react';
import { LayoutDashboard, ClipboardList, CheckCircle, PlusCircle, UserCircle, Bell, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CaseProvider } from '@/contexts/CaseContext'; // Assurez-vous que le chemin est correct
import { Toaster } from 'react-hot-toast';

/**
 * La barre de navigation latérale (Sidebar) avec une meilleure lisibilité et un contraste amélioré.
 */
const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Tableau de Bord', icon: LayoutDashboard, href: '/expert' },
    { name: 'Validation en Attente', icon: CheckCircle, href: '/expert/validation' },
    { name: 'Bibliothèque de Cas', icon: ClipboardList, href: '/cas' },
    { name: 'Analyse des Sessions', icon: TrendingUp, href: '/expert/analytics' },
    { name: 'Créer un Cas', icon: PlusCircle, href: '/expert/creer' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-primary text-white flex flex-col">
      <div className="h-20 flex items-center justify-center px-4 border-b border-white/10">
        <Link href="/expert" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                 <span className="text-white font-bold text-xl">FT</span>
            </div>
            <h1 className="text-xl font-bold">FullTang <span className="font-light opacity-80">Expert</span></h1>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => {
          // Gère l'état actif pour les sous-pages (ex: /expert/validation/[id] sera actif pour /expert/validation)
          const isActive = item.href.length > 7 ? pathname.startsWith(item.href) : pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              // AMÉLIORATION IHM : Augmentation du contraste pour une meilleure lisibilité
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-white/20 text-white font-semibold' // Style du lien ACTIF
                  : 'text-white/80 hover:bg-white/10 hover:text-white' // Style du lien INACTIF (plus lisible)
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-sm text-white/70">© 2025 FullTang.</p>
        <p className="text-xs text-white/50">Tous droits réservés.</p>
      </div>
    </aside>
  );
};

/**
 * L'en-tête (Header) de la section expert.
 */
const Header = () => (
  <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-8 flex-shrink-0">
    <div className="flex items-center gap-6">
      <button className="text-slate-500 hover:text-primary relative" title="Notifications">
        <Bell className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">2</span>
      </button>      
      <div className="flex items-center gap-3">
        <UserCircle className="w-10 h-10 text-slate-400" />
        <div>
          <p className="font-semibold text-primary">Pr. BATCHAKUI Bernabé</p>
          <p className="text-xs text-slate-500">Superviseur Expert</p>
        </div>
      </div>
    </div>
  </header>
);

/**
 * Le Layout principal qui assemble la Sidebar, le Header et le contenu de la page.
 * Il enveloppe toutes les pages /expert avec le CaseProvider pour la gestion d'état
 * et le Toaster pour les notifications.
 */
export default function ExpertLayout({ children }: { children: React.ReactNode }) {
  return (
    <CaseProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen flex bg-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </CaseProvider>
  );
}