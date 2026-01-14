// app/expert/layout.tsx
'use client';
import React, { useState, ReactNode } from 'react';
import { LayoutDashboard, CheckCircle, PlusCircle, UserCircle, Bell, TrendingUp, HeartPulse, BookUser, Check } from 'lucide-react';
import Link from 'next/link';
import { CaseProvider } from '@/contexts/CaseContext';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
// Importez les composants qui deviendront nos "pages"
import ExpertDashboardPage from '@/app/expert/page';
import ValidationListPage from '@/app/expert/validation/page';
import CreateCase from '@/components/expert/Create';
import Analytics from '@/components/expert/Analytics';
import Library from '@/components/dashboard/Library';
import SymptomLibrary from '@/components/expert/Symptom';

type ExpertView = 'dashboard' | 'validation' | 'analytics' | 'create' | 'lib' | 'symptom';

// --- SIDEBAR ---
const Sidebar = ({ activeView, setActiveView }: { activeView: ExpertView, setActiveView: (view: ExpertView) => void }) => {
  const navItems = [
    { id: 'dashboard', name: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'validation', name: 'Validation en Attente', icon: CheckCircle },
    { id: 'analytics', name: 'Analyse des Sessions', icon: TrendingUp },
    { id: 'create', name: 'Créer un Cas', icon: PlusCircle },
    { id: 'lib', name: 'Bibliothèque de cas', icon: BookUser },
    { id: 'symptom', name: 'Symptômes', icon: Check },
  ];
  return (
    <aside className="w-64 flex-shrink-0 bg-[#052648] text-white flex flex-col">
      <div className="h-20 flex items-center justify-center px-4 border-b border-white/10">
        <Link href="/expert" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-white"/>
          </div>
          <h1 className="text-xl font-bold">The Good Doctor <span className="font-light opacity-80 text-xs">Expert</span></h1>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ExpertView)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-left ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
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

// --- HEADER ---
const Header = () => {
  const { profile } = useAuth();
  const getShortName = (name: string | undefined) => {
      if (!name) return "Expert";
      return name.split(' ')[0];
  }

  return (
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-8 flex-shrink-0">
          <div className="flex items-center gap-6">
              <button className="text-slate-500 hover:text-primary relative" title="Notifications">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">2</span>
              </button>      
              <div className="flex items-center gap-3">
                  <UserCircle className="w-10 h-10 text-slate-400" />
                  <div>
                      <p className="font-semibold text-primary">Pr. {getShortName(profile?.username)}</p>
                      <p className="text-xs text-slate-500">Superviseur Expert</p>
                  </div>
              </div>
          </div>
      </header>
  );
};

// --- LAYOUT PRINCIPAL ---
export default function ExpertLayout({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ExpertView>('dashboard');
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <ExpertDashboardPage />;
      case 'validation':
        return <ValidationListPage />;
      case 'analytics':
        return <Analytics />;
      case 'create':
        return <CreateCase />;
      case 'lib':
        return <Library />;
      case 'symptom':
        return <SymptomLibrary />;
      default:
        return <ExpertDashboardPage />;
    }
  };
  return (
    <CaseProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen flex bg-slate-100 font-sans">
        
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
          
          <div className="flex-1 flex flex-col h-screen">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">
              {renderContent()}
            </main>
          </div>
        </div>
    </CaseProvider>
  );
}