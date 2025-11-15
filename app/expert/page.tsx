// app/expert/page.tsx
'use client';

import React, { useState } from 'react'; // <-- Ajout de useState
import { ClipboardList, CheckCircle, Clock, TrendingUp, Eye, PlusCircle, ArrowLeft } from 'lucide-react'; 
import Link from 'next/link';
import { useCases } from '@/contexts/CaseContext';
import { services } from '@/types/simulation/constant';
import { ExpertUseCase } from '@/types/expert/types';

// Importez les composants que vous souhaitez afficher "en interne"
import CreateCase from '@/components/expert/Create'; 
import Analytics from '@/components/expert/Analytics';

/**
 * Composant réutilisable pour afficher une carte de statistique sur le tableau de bord.
 * (Inchangé)
 */
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.FC<any>, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-sm text-slate-500">{title}</p>
        </div>
    </div>
);

/**
 * Composant réutilisable pour afficher une ligne dans la liste des cas à valider.
 * (Inchangé)
 */
const PendingCaseRow = ({ useCase }: { useCase: ExpertUseCase }) => {
  const service = services.find(s => s.id === useCase.serviceId);
  const submittedDate = new Date(useCase.submittedAt);
  const timeAgo = Math.round((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60));

  return (
    <div className="grid grid-cols-5 gap-4 items-center p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors">
      <div className="col-span-2 flex items-center gap-3">
        {service && <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><service.icon className="w-4 h-4 text-primary"/></div>}
        <div>
            <p className="font-semibold text-primary text-sm">{useCase.patient.nom}</p>
            <p className="text-xs text-slate-500">{service?.name || 'Service'}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">{useCase.difficulty}</p>
      <p className="text-sm text-slate-600 flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Il y a {timeAgo}h</p>
      <div className="flex justify-end">
          <Link href={`/expert/validation/${useCase.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-700" title="Examiner en détail">
            <Eye size={16}/> Examiner
          </Link>
      </div>
    </div>
  );
};

// ==========================================================
// DÉBUT DES MODIFICATIONS PRINCIPALES
// ==========================================================

/**
 * La page principale du tableau de bord de l'expert.
 * Affiche les statistiques clés et les actions prioritaires.
 * Gère maintenant l'affichage de plusieurs vues.
 */
export default function ExpertDashboardPage() {
  // 1. Ajout de l'état pour gérer la vue active
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'analytics'>('dashboard');
  const { cases } = useCases();

  // Calcul des statistiques à partir de l'état global (uniquement pour la vue dashboard)
  const pendingCases = cases.filter(c => c.status === 'pending');
  const approvedCasesCount = cases.filter(c => c.status === 'approved').length;
  
  // 2. Fonction pour rendre le contenu en fonction de la vue active
  const renderContent = () => {
    switch (activeView) {
      case 'create':
        return <CreateCase />;
      case 'analytics':
        // NOTE: Le lien "Analytics" est dans le layout. Pour une meilleure expérience,
        // l'état `activeView` devrait être géré dans un contexte partagé. 
        // Voir la note à la fin de la réponse pour plus de détails.
        return <Analytics />;
      case 'dashboard':
      default:
        return (
          <>
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* On peut rendre une carte cliquable pour aller aux analyses */}
                <div onClick={() => setActiveView('analytics')} className="cursor-pointer">
                    <StatCard title="Taux de Succès (Étudiants)" value="82%" icon={TrendingUp} color="bg-green-500" />
                </div>
                <StatCard title="Cas Cliniques Total" value={cases.length.toString()} icon={ClipboardList} color="bg-blue-500" />
                <StatCard title="Validations en Attente" value={pendingCases.length.toString()} icon={Clock} color="bg-yellow-500" />
                <StatCard title="Cas Validés au total" value={approvedCasesCount.toString()} icon={CheckCircle} color="bg-primary" />
            </div>

            {/* Section des cas à valider */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-primary">Cas Récents à Valider</h2>
                    <p className="text-sm text-slate-500 mt-1">Examinez et approuvez les derniers cas générés par l'IA.</p>
                </div>
                <div className="p-4 space-y-2">
                    <div className="grid grid-cols-5 gap-4 px-4 text-xs font-semibold text-slate-500 uppercase">
                        <p className="col-span-2">Patient</p>
                        <p>Difficulté</p>
                        <p>Soumission</p>
                        <p className="text-right">Action</p>
                    </div>
                    {pendingCases.length > 0 ? (
                        pendingCases.slice(0, 5).map(c => <PendingCaseRow key={c.id} useCase={c} />)
                    ) : (
                        <p className="text-center text-slate-500 p-8">Aucun cas en attente de validation. Bravo !</p>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 text-center">
                    <Link href="/expert/validation" className="text-sm font-semibold text-primary hover:text-blue-700">
                      Voir toute la file d'attente ({pendingCases.length})
                    </Link>
                </div>
            </div>
          </>
        );
    }
  };
  
  // Titres dynamiques pour l'en-tête de page
  const titles = {
    dashboard: { title: "Tableau de Bord", subtitle: "Vue d'ensemble de l'activité de la plateforme de simulation." },
    create: { title: "Créer un Nouveau Cas Clinique", subtitle: "Remplissez ce formulaire pour construire un cas personnalisé." },
    analytics: { title: "Analyse des Performances", subtitle: "Suivez les résultats et identifiez les points d'amélioration." },
  };

  return (
    <div className="space-y-8">
      {/* 3. En-tête de page dynamique */}
      <div className="flex items-center justify-between">
        <div>
          {/* Le bouton "Retour" n'apparaît que si nous ne sommes pas sur le dashboard principal */}
          {activeView !== 'dashboard' && (
             <button 
                onClick={() => setActiveView('dashboard')} 
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary mb-2 transition-colors">
                <ArrowLeft size={16}/>
                Retour au Tableau de Bord
            </button>
          )}
          <h1 className="text-3xl font-bold text-primary">{titles[activeView].title}</h1>
          <p className="text-slate-600 mt-1">{titles[activeView].subtitle}</p>
        </div>

        {/* Le bouton "Créer" n'est visible que sur le dashboard */}
        {activeView === 'dashboard' && (
          <button 
              onClick={() => setActiveView('create')} // <-- MODIFIÉ: change l'état au lieu de naviguer
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl">
              <PlusCircle size={20}/>
              Créer un Cas
          </button>
        )}
      </div>
      
      {/* Affiche le contenu dynamique */}
      {renderContent()}
    </div>
  );
}