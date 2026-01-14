'use client';

import React, { useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Eye, 
  PlusCircle, 
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react'; 
import Link from 'next/link';
import { useCases } from '@/contexts/CaseContext';
import { services } from '@/types/simulation/constant';
import { ExpertUseCase } from '@/types/expert/types';

// Import des sous-composants
import CreateCase from '@/components/expert/Create'; 
import Analytics from '@/components/expert/Analytics';
import SymptomLibrary from '@/components/expert/Symptom';

// --- TYPES ---
type ViewType = 'dashboard' | 'create' | 'analytics' | 'symptom';

// --- COMPOSANT CARTE DE STATISTIQUE ---
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  colorVar,
  onClick
}: { 
  title: string;
  value: string;
  icon: any; 
  colorVar: string; // Ex: 'var(--success)'
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className={`stat-card bg-white p-6 rounded-xl border border-slate-100 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div 
        className="icon-wrapper w-14 h-14 rounded-lg flex items-center justify-center text-white"
        style={{ backgroundColor: colorVar }}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color: '#052648' }}>{value}</p>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
      </div>
    </div>
    <style jsx>{`
      .stat-card {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(5, 38, 72, 0.1);
      }
    `}</style>
  </div>
);

// --- COMPOSANT LIGNE DE TABLEAU ---
const PendingCaseRow = ({ useCase }: { useCase: ExpertUseCase }) => {
  const service = services.find(s => s.id === useCase.serviceId);
  const submittedDate = new Date(useCase.submittedAt);
  const timeAgo = Math.round((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60));

  return (
    <div className="case-row grid grid-cols-12 gap-4 items-center p-4 bg-white rounded-lg border border-transparent">
      {/* Colonne Identité */}
      <div className="col-span-5 md:col-span-4 flex items-center gap-4">
        <div className="service-badge flex items-center justify-center flex-shrink-0">
          {service ? <service.icon className="w-5 h-5 text-white"/> : <LayoutDashboard size={20} />}
        </div>
        <div>
            <p className="font-bold text-slate-800 text-sm">{useCase.patient.nom}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              {service?.name || 'Général'}
            </p>
        </div>
      </div>

      {/* Colonne Difficulté */}
      <div className="col-span-3 md:col-span-3">
        <span className={`difficulty-badge px-3 py-1 text-xs rounded-full font-semibold border
          ${useCase.difficulty === 'Expert' ? 'bg-red-50 text-red-700 border-red-200' : 
            useCase.difficulty === 'Débutant' ? 'bg-green-50 text-green-700 border-green-200' : 
            'bg-blue-50 text-blue-700 border-blue-200'}
        `}>
          {useCase.difficulty}
        </span>
      </div>

      {/* Colonne Temps */}
      <div className="hidden md:flex col-span-3 items-center gap-2 text-sm text-slate-500">
        <Clock className="w-4 h-4" /> 
        <span>{timeAgo}h passées</span>
      </div>

      {/* Colonne Action */}
      <div className="col-span-4 md:col-span-2 flex justify-end">
          <Link 
            href={`/expert/validation/${useCase.id}`} 
            className="action-btn flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Eye size={16}/> Voir
          </Link>
      </div>

      <style jsx>{`
        .case-row {
          transition: background-color 0.2s;
        }
        .case-row:hover {
          background-color: #f8fafc; /* slate-50 */
          border-color: #e2e8f0;
        }
        .service-badge {
          width: 40px; height: 40px;
          border-radius: 10px;
          background-color: var(--primary);
        }
        .action-btn {
          color: var(--primary);
          background-color: rgba(5, 38, 72, 0.05);
        }
        .action-btn:hover {
          background-color: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
};

// ==========================================================
// PAGE PRINCIPALE
// ==========================================================

export default function ExpertDashboardPage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const { cases } = useCases();

  // Statistiques calculées
  const pendingCases = cases.filter(c => c.status === 'pending');
  const approvedCasesCount = cases.filter(c => c.status === 'approved').length;
  
  // Titres dynamiques
  const titles: Record<ViewType, {title: string, subtitle: string}> = {
    dashboard: { 
      title: "Tableau de Bord", 
      subtitle: "Supervision globale et gestion des validations." 
    },
    create: { 
      title: "Nouvelle Simulation", 
      subtitle: "Créez un cas clinique connecté au moteur expert." 
    },
    analytics: { 
      title: "Analyse des Données", 
      subtitle: "Statistiques de performance des étudiants." 
    },
  };

  const renderContent = () => {
    if (activeView === 'create') return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><CreateCase /></div>;
    if (activeView === 'analytics') return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><Analytics /></div>;
    if (activeView === 'symptom') return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><SymptomLibrary /></div>;

    // VUE TABLEAU DE BORD
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Succès Global" 
              value="82%" 
              icon={TrendingUp} 
              colorVar="var(--success)" 
              onClick={() => setActiveView('analytics')}
            />
            <StatCard 
              title="Cas Total" 
              value={cases.length.toString()} 
              icon={ClipboardList} 
              colorVar="var(--info)" 
            />
            <StatCard 
              title="À Valider" 
              value={pendingCases.length.toString()} 
              icon={Clock} 
              colorVar="var(--warning)" 
            />
            <StatCard 
              title="Cas Actifs" 
              value={approvedCasesCount.toString()} 
              icon={CheckCircle} 
              colorVar="var(--primary)" 
            />
        </div>

        {/* LISTE VALIDATION */}
        <div className="section-container bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold" style={{color: 'var(--primary)'}}>Dernières Soumissions</h2>
                  <p className="text-sm text-slate-500 mt-1">Cas générés par l'IA nécessitant une expertise.</p>
                </div>
                <Link href="/expert/validation" className="text-sm font-semibold text-slate-500 hover:text-[#052648]">
                  Tout voir →
                </Link>
            </div>
            
            <div className="p-4 flex flex-col gap-2 bg-slate-50/50">
                {pendingCases.length > 0 ? (
                    pendingCases.slice(0, 5).map(c => <PendingCaseRow key={c.id} useCase={c} />)
                ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                          <CheckCircle size={32}/>
                        </div>
                        <p className="text-slate-600 font-medium">Tout est à jour !</p>
                        <p className="text-sm text-slate-400">Aucun cas en attente.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="expert-layout min-h-full">
      {/* 1. Header Dynamique */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {activeView !== 'dashboard' && (
             <button 
                onClick={() => setActiveView('dashboard')} 
                className="mb-2 text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{color: 'var(--slate-500)'}}
             >
                <ArrowLeft size={16}/> Retour
            </button>
          )}
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>
            {titles[activeView].title}
          </h1>
          <p className="text-slate-500 mt-1 text-lg">{titles[activeView].subtitle}</p>
        </div>

        {activeView === 'dashboard' && (
          <button 
              onClick={() => setActiveView('create')} 
              className="create-btn shadow-lg shadow-blue-900/20"
          >
              <PlusCircle size={20}/>
              Créer un Cas
          </button>
        )}
      </div>
      
      {/* 2. Contenu */}
      <main className="content-wrapper">
        {renderContent()}
      </main>

      {/* --- STYLES GLOBAUX DU DASHBOARD --- */}
      <style jsx global>{`
        /* Définition de la palette Expert */
        :root {
          --primary: #052648;    /* Bleu Marine Profond */
          --primary-hover: #0a4d8f;
          
          --success: #10B981;    /* Vert */
          --warning: #F59E0B;    /* Ambre/Orange */
          --danger: #EF4444;     /* Rouge */
          --info: #3B82F6;       /* Bleu clair */
          
          --bg-light: #F8FAFC;   /* Slate 50 */
          --border-color: #E2E8F0;
        }

        .expert-layout {
          animation: fadeIn 0.5s ease-out;
        }

        /* Bouton de création principal */
        .create-btn {
          background-color: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .create-btn:hover {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
        }
        .create-btn:active {
          transform: translateY(0);
        }

        /* Container blanc propre */
        .section-container {
          border-radius: 1rem;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}