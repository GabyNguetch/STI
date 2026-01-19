'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Stethoscope, BookOpen, 
  Trophy, Settings as SettingsIcon, Bell, Search,
  GraduationCap,
  Brain,
  Target,
  TrendingUp,
  ScanFace
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- Services & Context ---
import { LearnerService, Learner, LearnerTrace } from '@/services/learnerService';

// --- Composants ---
import Sidebar from '@/components/dashboard/Sidebar';
import ProfileSidebar from '@/components/dashboard/ProfileSidebar';
import DashboardSkeleton from '@/components/ui/SkeletonDashboard';

// --- Vues ---
import Overview from '@/components/dashboard/Overview';
import Library from '@/components/dashboard/Library';
import Journey from '@/components/dashboard/Journey'; 
import Settings from '@/components/dashboard/Settings';
import Skills from '@/components/dashboard/Skills';
import Goals from '@/components/dashboard/Goal';

// --- DÉFINITION DU HEADER DYNAMIQUE ---
const HEADER_CONFIG: Record<string, { title: string; subtitle: string; icon: React.ElementType, color: string }> = {
  overview: { 
    title: "Vue d'Ensemble", 
    subtitle: "Vision globale rapide.", 
    icon: LayoutDashboard,
    color: "bg-blue-50 text-[#052648]"
  },
  competencies: { 
    title: "Compétences", 
    subtitle: "Gérer la maîtrise des compétences.", 
    icon: Brain,
    color: "bg-purple-50 text-purple-700"
  },
  goals: { 
    title: "Objectifs", 
    subtitle: "Planifier et suivre les goals.", 
    icon: Target,
    color: "bg-emerald-50 text-emerald-700"
  },
  journey: { 
    title: "Mon parcours", 
    subtitle: "Suivi de mon évolution et traces d'activité.", 
    icon: TrendingUp,
    color: "bg-indigo-50 text-indigo-700"
  },
  practice: { 
    title: "M'exercer", 
    subtitle: "S'entraîner sur des cas cliniques réels.", 
    icon: Stethoscope,
    color: "bg-cyan-50 text-cyan-700"
  },
  analytic_profile: { 
    title: "Mon Profil", 
    subtitle: "Diagnostic, Stratégies, Profil Cognitif & Affectif.", 
    icon: ScanFace,
    color: "bg-orange-50 text-orange-700"
  }
};


const DashboardHeader = ({ activeView, user }: { activeView: string, user: Learner | null }) => {
  const config = HEADER_CONFIG[activeView] || HEADER_CONFIG.overview;
  const Icon = config.icon;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-6 bg-white border-b border-slate-100 sticky top-0 z-20 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-[#052648] rounded-xl flex items-center justify-center shadow-sm">
           <Icon size={24} />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{config.title}</h1>
           <p className="text-slate-500 text-sm mt-0.5 hidden sm:block">{config.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
         {/* Recherche contextuelle */}
         <div className="relative group flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors"/>
             <input 
               type="text" 
               placeholder="Rechercher..." 
               className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
             />
         </div>
         {/* Notifications */}
         <button className="relative p-2 text-slate-400 hover:text-[#052648] hover:bg-blue-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
         </button>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();

  // --- ÉTATS ---
  const [user, setUser] = useState<Learner | null>(null);
  const [trace, setTrace] = useState<LearnerTrace | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeView, setActiveView] = useState('overview');
  
  // État pour gérer le "décalage" réactif du contenu principal
  // Remarque : Si vous voulez que la sidebar POUZ le contenu, utilisez cet état.
  // Si la sidebar doit passer par dessus (overlay), cet état n'est pas nécessaire pour le CSS, mais gardons-le pour la flexibilité.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Détection si on doit afficher la barre de droite (Profile)
  const showProfileSidebar = activeView === 'overview';

  // --- CHARGEMENT ---
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/connexion'); return; }

      try {
        const u = await LearnerService.getMe();
        setUser(u);
        const t = await LearnerService.getTraces(u.id);
        const myTrace = t.learners.find(l => String(l.id) === String(u.id));
        if (myTrace) setTrace(myTrace);
      } catch (e) {
        console.error(e);
        toast.error("Connexion perdue.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return <DashboardSkeleton />;

  // --- RENDU ---
  return (
    <div className="flex h-screen w-screen bg-[#f6f8fb] overflow-hidden font-sans relative text-slate-800">

      {/* 
        1. GAUCHE: SIDEBAR
        On injecte un 'wrapper' autour du Sidebar original si on veut capturer le Hover state 
        sans modifier le fichier Sidebar.tsx.
        Si vous avez ajouté `onHoverChange` dans Sidebar.tsx comme suggéré implicitement, utilisez-le.
        Sinon, voici une astuce avec un div wrapper pour détecter le hover ici-même.
      */}
      <div 
        className="z-50 h-full fixed left-0 top-0"
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
          {/* Note: La Sidebar elle-même gère son animation CSS interne */}
          <Sidebar activeView={activeView} onNavigate={setActiveView} />
      </div>

      {/* 
        2. CENTRE: MAIN CONTENT
        Le décalage est géré ici via les marges (ml).
        - Base (Sidebar fermée): md:ml-24 (96px, taille approx sidebar icones)
        - Ouvert (Sidebar ouverte): Si on veut pousser le contenu -> ml-72
        - Pour cette version "fluide", nous allons garder la marge fixe "md:ml-24" pour que la sidebar 
          ouverte passe EN "FLOATING" au dessus de la marge blanche, ou si on veut l'effet pousser:
      */}
      <main 
        className={`
           flex-1 flex flex-col h-full relative transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
           /* Gestion Marge Gauche (Sidebar Main) */
           ${isSidebarOpen ? 'md:ml-72' : 'md:ml-24'} 
           
           /* Gestion Marge Droite (Sidebar Profile) - Uniquement si visible */
           ${showProfileSidebar ? 'xl:mr-[360px]' : 'mr-0'}
           
           /* Petit padding mobile */
           ml-0 pb-20 md:pb-0
        `}
      >
        {/* HEADER DYNAMIQUE STICKY */}
        {activeView !== 'overview' && (
                <DashboardHeader activeView={activeView} user={user} />
          )}
        {/* ZONE DE CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 scroll-smooth custom-scrollbar">
            {/* INJECTION DES VUES */}
            
            <div className={`max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              
              {activeView === 'overview' && <Overview user={user} trace={trace} />}
              {activeView === 'goals' && <Goals />} 
              {activeView === 'competencies' && <Skills />}
              {activeView === 'practice' && <Library />} 
              {activeView === 'journey' && <Journey allMilestones={[]} userProgress={[]} />} 
              {activeView === 'analytic_profile' && <div className='p-10 text-center text-slate-500'>Module Profil Complet à venir</div>}

            </div>
        </div>
      </main>

      {/* 
        3. DROITE: PROFILE SIDEBAR (Optionnelle)
        Ne s'affiche que sur 'overview' et sur grand écran (xl)
        Transition slide-in
      */}
      <aside 
        className={`
           hidden xl:block fixed right-0 top-0 bottom-0 h-full w-[360px] 
           transition-transform duration-500 ease-in-out z-30 shadow-2xl bg-white
           ${showProfileSidebar ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
          {/* Note: ProfileSidebar a été mis à jour dans l'étape précédente pour être sur fond blanc */}
          <ProfileSidebar user={user} trace={trace} />
      </aside>

      {/* OVERLAY MOBILE POUR SIDEBAR PRINCIPALE (Optionnel pour UX mobile propre) */}
      <div className={`md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}></div>
      
    </div>
  );
}