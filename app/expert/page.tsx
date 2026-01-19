'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';

// Imports des Contextes et Types
import { CaseProvider } from '@/contexts/CaseContext';

// Imports des Composants d'Architecture
import ExpertHeader from '@/components/expert/Header';
// Note: On peut importer ExpertSidebar, mais pour que la navigation "State" fonctionne 
// sans changer d'URL (SPA), nous utilisons une logique adaptée ici.
import { 
  LayoutDashboard, FileText, Activity, Bug, Syringe, 
  ImageIcon, LogOut, ChevronRight, HeartPulse, Home
} from 'lucide-react';

// Imports des Vues (Contenus)
import Overview from '@/components/expert/Overview';
import CreateCase from '@/components/expert/Create';
import SymptomLibrary from '@/components/expert/Symptom';
import CaseLibrary from '@/components/expert/CaseLybrary';
import DrugLibrary from '@/components/expert/Drug';
import DiseaseLibrary from '@/components/expert/Disease';
import MediaLibrary from '@/components/expert/MediaLybrary';
// Les composants Analytics ou Validation peuvent être importés ici si nécessaire
// import Analytics from '@/components/expert/Analytics';

// --- CONFIGURATION NAVIGATION SIDEBAR LOCAL (Pour mode SPA) ---
type ViewType = 'dashboard' | 'cas' | 'symptom' | 'pathologies' | 'traitements' | 'media' | 'create';

export default function ExpertPage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);


// --- LOGIQUE D'AFFICHAGE DU CONTENU CENTRAL ---
  const renderContent = () => {
    // Calcul de la hauteur utile : 100vh - 80px (hauteur du ExpertHeader)
    const contentHeightClass = "h-[calc(100vh-80px)]";

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="p-4 md:p-8">
            <Overview />
          </div>
        );
      
      case 'cas':
        // CaseLibrary gère ses propres sidebars et son défilement interne
        return (
          <div className={contentHeightClass}>
            <CaseLibrary />
          </div>
        );
      
      case 'create':
        return (
          <div className="p-4 md:p-12 max-w-5xl mx-auto">
            <CreateCase />
          </div>
        );

      case 'symptom':
        return (
          <div className={`p-4 md:p-8 ${contentHeightClass}`}>
            <SymptomLibrary />
          </div>
        );

      case 'traitements':
        return (
          <div className={`p-4 md:p-8 ${contentHeightClass}`}>
            <DrugLibrary />
          </div>
        );
      
      case 'pathologies':
        return (
          <div className={`p-4 md:p-8 ${contentHeightClass}`}>
            <DiseaseLibrary />
          </div>
        );

      case 'media':
        return (
          <div className={`p-4 md:p-8 ${contentHeightClass}`}>
            <MediaLibrary />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-slate-400">
            <div className="p-8 bg-slate-100 rounded-full mb-6 animate-pulse">
              <Activity size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 capitalize">Module {activeView}</h3>
            <p className="text-slate-400 mt-2 max-w-xs text-center">
              Cette section est actuellement en phase finale de déploiement technique.
            </p>
            {activeView === 'pathologies' && (
              <button 
                onClick={() => setActiveView('dashboard')}
                className="mt-6 px-6 py-2.5 text-sm font-bold bg-[#052648] text-white rounded-xl hover:bg-blue-900 transition-all shadow-lg"
              >
                Retour au tableau de bord
              </button>
            )}
          </div>
        );
    }
  };


  return (
    <CaseProvider>
      <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800 selection:bg-blue-100">
        <Toaster position="top-right" />

        {/* ======================= */}
        {/* SIDEBAR EXPERT INTÉGRÉE */}
        {/* ======================= */}
        <aside 
          className={`
            hidden md:flex flex-col h-screen bg-[#052648] text-white fixed left-0 top-0 z-40 
            transition-all duration-500 ease-in-out border-r border-blue-900/50 shadow-2xl
            ${isSidebarHovered ? 'w-64' : 'w-20'}
          `}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-center relative border-b border-white/5">
             <div className={`flex items-center gap-3 transition-all duration-300 ${isSidebarHovered ? 'px-6 w-full justify-start' : ''}`}>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm cursor-pointer"
                       onClick={() => setActiveView('dashboard')}>
                      <HeartPulse className="text-blue-400" />
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                      <span className="font-bold text-lg whitespace-nowrap tracking-wide">
                        GoDoc<span className="text-blue-400">+</span> <span className="font-light opacity-70">Expert</span>
                      </span>
                  </div>
             </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
            {[
                { id: 'dashboard', name: 'Vue d\'ensemble', icon: LayoutDashboard },
                { id: 'cas', name: 'Cas Cliniques', icon: FileText },
                { id: 'symptom', name: 'Symptômes', icon: Activity },
                { id: 'pathologies', name: 'Pathologies', icon: Bug },
                { id: 'traitements', name: 'Traitement', icon: Syringe },
                { id: 'media', name: 'Imagerie', icon: ImageIcon },
            ].map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveView(item.id as ViewType)}
                  className={`
                    relative flex items-center h-12 w-full px-6 transition-all duration-200 group outline-none
                    ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}
                  `}
                >
                  {/* Indicateur Actif */}
                  {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" />
                  )}

                  <div className={`relative z-10 flex items-center gap-4 ${isSidebarHovered ? 'justify-start w-full' : 'justify-center w-full'}`}>
                      <Icon 
                        className={`w-5 h-5 transition-all duration-300 
                        ${isActive ? 'text-blue-400 scale-110' : ''} 
                        ${!isSidebarHovered && 'group-hover:scale-125'}`} 
                      />
                      
                      <span className={`font-medium whitespace-nowrap transition-all duration-300 origin-left ${
                        isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 w-0'
                      }`}>
                        {item.name}
                      </span>
                      
                      {/* Chevron (Uniquement visible si ouvert) */}
                      {isSidebarHovered && isActive && (
                         <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />
                      )}
                  </div>
                  
                  {/* Hover Effect Background */}
                  <div className={`absolute inset-y-1 inset-x-2 rounded-lg bg-white/5 transition-opacity duration-200 pointer-events-none
                      ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}></div>
                </button>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-white/10 bg-[#04203d]">
              <Link href="/" className={`w-full flex items-center h-12 rounded-xl hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-all group px-2 ${isSidebarHovered ? '' : 'justify-center'}`}>
                  <div className={`${isSidebarHovered ? 'mr-4' : ''}`}>
                      <Home className="w-5 h-5" />
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                      Retour Accueil
                  </span>
              </Link>
          </div>
        </aside>


        {/* ======================== */}
        {/* MOBILE NAVIGATION BOTTOM */}
        {/* ======================== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#052648] text-white p-2 flex justify-around items-center z-50 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
            {[
              { id: 'dashboard', icon: LayoutDashboard },
              { id: 'cas', icon: FileText },
              { id: 'symptom', icon: Activity },
              { id: 'create', icon: Activity }, // Utilise icone +
            ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveView(item.id as ViewType)}
                  className={`p-3 rounded-2xl transition-all flex flex-col items-center justify-center relative ${
                      activeView === item.id ? 'text-white -translate-y-4 bg-blue-600 shadow-lg ring-4 ring-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                    <item.icon size={22} />
                    {activeView === item.id && (
                        <span className="absolute -bottom-6 text-[10px] font-bold text-slate-600 bg-white px-2 rounded shadow-sm opacity-0 animate-fade-in-up">
                            Actif
                        </span>
                    )}
                </button>
            ))}
        </nav>


        {/* ================= */}
        {/* MAIN LAYOUT WRAP */}
        {/* ================= */}
        {/* Marge gauche dynamique pour laisser place à la sidebar collapsed (20 * 4px = 80px) */}
        <div className="flex-1 flex flex-col relative transition-all duration-500 ease-in-out md:ml-20">
          
          {/* HEADER (Sticky) */}
           {activeView !== 'dashboard' && <ExpertHeader />}

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 pb-20 md:pb-0">
             
           {/* Fil d'ariane caché uniquement sur dashboard en mobile aussi */}
           {activeView !== 'dashboard' && (
             <div className="px-6 md:px-8 py-2 md:hidden">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Module Expert &gt; <span className="text-blue-600">{activeView}</span>
                </p>
             </div>
           )}

             {/* Injection de la vue active */}
             {renderContent()}

          </main>
        </div>

      </div>
    </CaseProvider>
  );
}