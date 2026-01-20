// app/expert/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, FileText, Activity, Bug, Syringe, 
  ImageIcon, ChevronRight, HeartPulse, Home
} from 'lucide-react';
import FunFactLoader from '@/components/common/FunFactLoader';
import ExpertHeader from '@/components/expert/Header';
import { CaseProvider } from '@/contexts/CaseContext';

// Import Dynamique des vues "lourdes" (Grilles de données, Formulaires)
const Overview = dynamic(() => import('@/components/expert/Overview'), { loading: () => <FunFactLoader /> });
const CreateCase = dynamic(() => import('@/components/expert/Create'), { loading: () => <div className="p-10 text-center text-blue-500">Chargement de l'éditeur...</div> });
const SymptomLibrary = dynamic(() => import('@/components/expert/Symptom'), { loading: () => <FunFactLoader /> });
const CaseLibrary = dynamic(() => import('@/components/expert/CaseLybrary'), { loading: () => <FunFactLoader /> });
const DrugLibrary = dynamic(() => import('@/components/expert/Drug'), { loading: () => <FunFactLoader /> });
const DiseaseLibrary = dynamic(() => import('@/components/expert/Disease'), { loading: () => <FunFactLoader /> });
const MediaLibrary = dynamic(() => import('@/components/expert/MediaLybrary'), { ssr: false, loading: () => <FunFactLoader /> });

type ViewType = 'dashboard' | 'cas' | 'symptom' | 'pathologies' | 'traitements' | 'media' | 'create';

export default function ExpertPage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const renderContent = () => {
    // Layout commun pour l'expert
    const containerClass = "h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-300";

    switch (activeView) {
      case 'dashboard': return <div className="p-4 md:p-8"><Overview /></div>;
      case 'cas': return <div className={containerClass}><CaseLibrary /></div>;
      case 'create': return <div className="p-4 md:p-12 max-w-5xl mx-auto"><CreateCase /></div>;
      case 'symptom': return <div className={`p-4 md:p-8 ${containerClass}`}><SymptomLibrary /></div>;
      case 'traitements': return <div className={`p-4 md:p-8 ${containerClass}`}><DrugLibrary /></div>;
      case 'pathologies': return <div className={`p-4 md:p-8 ${containerClass}`}><DiseaseLibrary /></div>;
      case 'media': return <div className={`p-4 md:p-8 ${containerClass}`}><MediaLibrary /></div>;
      default: return null;
    }
  };

  return (
    <CaseProvider>
      <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800 selection:bg-blue-100">
        <Toaster position="top-right" />

        {/* SIDEBAR EXPERT */}
        <aside 
          className={`hidden md:flex flex-col h-screen bg-[#052648] text-white fixed left-0 top-0 z-40 transition-all duration-500 ease-in-out border-r border-blue-900/50 shadow-2xl ${isSidebarHovered ? 'w-64' : 'w-20'}`}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          {/* Logo */}
          <div className="h-20 flex items-center justify-center relative border-b border-white/5">
             <div className={`flex items-center gap-3 transition-all duration-300 ${isSidebarHovered ? 'px-6 w-full justify-start' : ''}`}>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm cursor-pointer" onClick={() => setActiveView('dashboard')}>
                      <HeartPulse className="text-blue-400" />
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                      <span className="font-bold text-lg whitespace-nowrap tracking-wide">Expert<span className="text-blue-400">Hub</span></span>
                  </div>
             </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
            {[
                { id: 'dashboard', name: 'Vue d\'ensemble', icon: LayoutDashboard },
                { id: 'cas', name: 'Cas Cliniques', icon: FileText },
                { id: 'symptom', name: 'Symptômes', icon: Activity },
                { id: 'pathologies', name: 'Pathologies', icon: Bug },
                { id: 'traitements', name: 'Pharmacopée', icon: Syringe },
                { id: 'media', name: 'Imagerie', icon: ImageIcon },
            ].map((item) => (
                <button 
                  key={item.id} onClick={() => setActiveView(item.id as ViewType)}
                  className={`relative flex items-center h-12 w-full px-6 transition-all duration-200 group outline-none ${activeView === item.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {activeView === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" />}
                  <div className={`relative z-10 flex items-center gap-4 ${isSidebarHovered ? 'justify-start w-full' : 'justify-center w-full'}`}>
                      <item.icon className={`w-5 h-5 transition-all duration-300 ${activeView === item.id ? 'text-blue-400 scale-110' : ''}`} />
                      <span className={`font-medium whitespace-nowrap transition-all duration-300 origin-left ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 w-0'}`}>{item.name}</span>
                      {isSidebarHovered && activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />}
                  </div>
                </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 bg-[#04203d]">
              <Link href="/" className={`w-full flex items-center h-12 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all px-2 ${isSidebarHovered ? '' : 'justify-center'}`}>
                  <div className={`${isSidebarHovered ? 'mr-4' : ''}`}><Home className="w-5 h-5" /></div>
                  <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Retour Site</span>
              </Link>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1 flex flex-col relative transition-all duration-500 ease-in-out md:ml-20">
          {activeView !== 'dashboard' && <ExpertHeader />}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50">
             <Suspense fallback={<FunFactLoader />}>
                {renderContent()}
             </Suspense>
          </main>
        </div>
      </div>
    </CaseProvider>
  );
}