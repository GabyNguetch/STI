// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  LayoutDashboard, Stethoscope, Bell, Search,
  Brain, Target, TrendingUp, ScanFace
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- Services & Types ---
import { LearnerService, Learner, LearnerTrace } from '@/services/learnerService';

// --- Composants de structure (statiques car légers et essentiels) ---
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardSkeleton from '@/components/ui/SkeletonDashboard';
import FunFactLoader from '@/components/common/FunFactLoader';
import AnalyticProfile from '@/components/dashboard/AnalyticProfile';

// --- Chargement Dynamique des Vues (Code Splitting) ---
// Chaque composant est isolé dans son propre bundle JS
const Overview = dynamic(() => import('@/components/dashboard/Overview'), { 
  loading: () => <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div></div> 
});
const Library = dynamic(() => import('@/components/dashboard/Library'), { loading: () => <DashboardSkeleton /> });
const Journey = dynamic(() => import('@/components/dashboard/Journey'), { loading: () => <DashboardSkeleton /> });
const Skills = dynamic(() => import('@/components/dashboard/Skills'), { loading: () => <DashboardSkeleton /> });
const Goals = dynamic(() => import('@/components/dashboard/Goal'), { loading: () => <DashboardSkeleton /> });
const ProfileSidebar = dynamic(() => import('@/components/dashboard/ProfileSidebar'), { ssr: false });

// --- CONFIGURATION HEADER ---
const HEADER_CONFIG: Record<string, { title: string; subtitle: string; icon: any, color: string }> = {
  overview: { title: "Vue d'Ensemble", subtitle: "Vision globale rapide.", icon: LayoutDashboard, color: "bg-blue-50 text-[#052648]" },
  competencies: { title: "Compétences", subtitle: "Gérer la maîtrise des compétences.", icon: Brain, color: "bg-purple-50 text-purple-700" },
  goals: { title: "Objectifs", subtitle: "Planifier et suivre les goals.", icon: Target, color: "bg-emerald-50 text-emerald-700" },
  journey: { title: "Mon parcours", subtitle: "Suivi de mon évolution.", icon: TrendingUp, color: "bg-indigo-50 text-indigo-700" },
  practice: { title: "M'exercer", subtitle: "Bibliothèque de cas cliniques.", icon: Stethoscope, color: "bg-cyan-50 text-cyan-700" },
  analytic_profile: { title: "Mon Profil", subtitle: "Diagnostic & Stratégies.", icon: ScanFace, color: "bg-orange-50 text-orange-700" }
};

const DashboardHeader = ({ activeView }: { activeView: string, user: Learner | null }) => {
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
         <div className="relative group flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors"/>
             <input type="text" placeholder="Rechercher..." className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-300 transition-all"/>
         </div>
         <button className="relative p-2 text-slate-400 hover:text-[#052648] bg-gray-50 hover:bg-blue-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
         </button>
      </div>
    </div>
  );
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState<Learner | null>(null);
  const [trace, setTrace] = useState<LearnerTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Sync URL query param with state view (facultatif mais pratique pour bookmark)
  useEffect(() => {
    const view = searchParams.get('view');
    if (view && Object.keys(HEADER_CONFIG).includes(view)) {
      setActiveView(view);
    }
  }, [searchParams]);

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
        toast.error("Erreur de synchronisation.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return <FunFactLoader />; // On utilise le loader "Fun Facts" ici

  const showProfileSidebar = activeView === 'overview';

  return (
    <div className="flex h-screen w-screen bg-[#f6f8fb] overflow-hidden font-sans relative text-slate-800">
      
      {/* Navigation Latérale */}
      <div 
        className="z-50 h-full fixed left-0 top-0"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
          <Sidebar activeView={activeView} onNavigate={setActiveView} />
      </div>

      {/* Contenu Principal */}
      <main className={`flex-1 flex flex-col h-full relative transition-all duration-500 md:ml-24 ${showProfileSidebar ? 'xl:mr-[360px]' : ''}`}>
        
        {activeView !== 'overview' && <DashboardHeader activeView={activeView} user={user} />}
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth custom-scrollbar">
            <div className={`max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <Suspense fallback={<DashboardSkeleton />}>
                {activeView === 'overview' && <Overview user={user} trace={trace} />}
                {activeView === 'goals' && <Goals />} 
                {activeView === 'practice' && <Library />} 
                {activeView === 'analytic_profile' && <AnalyticProfile />}
              </Suspense>
            </div>
        </div>
      </main>

      {/* Sidebar de Droite (Profil rapide) */}
      <aside 
        className={`hidden xl:block fixed right-0 top-0 bottom-0 h-full w-[360px] transition-transform duration-500 ease-in-out z-30 shadow-2xl bg-white ${showProfileSidebar ? 'translate-x-0' : 'translate-x-full'}`}
      >
          {showProfileSidebar && <ProfileSidebar user={user} trace={trace} />}
      </aside>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<FunFactLoader />}>
        <DashboardContent />
    </Suspense>
  );
}