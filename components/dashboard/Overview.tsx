// components/dashboard/Overview.tsx
'use client';

import React from 'react';
import { CheckCircle2, Award, BriefcaseMedical, TrendingUp, AlertCircle } from 'lucide-react';
import { services } from '@/types/simulation/constant';
import { UserProgressData } from '@/services/caseService'; // Import du type

// Le composant StatCard reste inchangé
const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/80 flex items-center gap-5 transition-transform hover:-translate-y-1">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}1A` }}>
        <Icon size={24} style={{ color }}/>
    </div>
    <div>
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

interface OverviewProps {
  userProgress: UserProgressData[]; // Utilisation du bon type
}

const Overview: React.FC<OverviewProps> = ({ userProgress }) => {
  
  // --- CALCUL DES STATISTIQUES RÉELLES ---
  
  // 1. Nombre de cas lancés
  const startedCasesCount = userProgress.length;

  // 2. Cas complétés (ceux avec un statut 'completed')
  const completedCases = userProgress.filter(p => p.status === 'completed' && p.score !== null);
  const completedCasesCount = completedCases.length;

  // 3. Moyenne des notes (uniquement sur les cas complétés)
  const averageScore = completedCases.length > 0
    ? Math.round(completedCases.reduce((acc, p) => acc + (p.score || 0), 0) / completedCases.length)
    : 0;

  // 4. Activité récente (les 3 derniers cas commencés)
  const recentActivity = userProgress.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* --- CARTES DE STATISTIQUES DYNAMIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={BriefcaseMedical} title="Cas lancés" value={startedCasesCount} color="#052648" />
        <StatCard icon={TrendingUp} title="Cas terminés" value={completedCasesCount} color="#F59E0B" />
        <StatCard icon={CheckCircle2} title="Score moyen" value={averageScore > 0 ? `${averageScore}%` : '-'} color="#22C55E" />
      </div>

      {/* --- ACTIVITÉ RÉCENTE DYNAMIQUE --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Activité Récente</h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((progress) => {
              // Note : Supabase retourne 'clinical_cases' en snake_case
              const caseInfo = progress.clinical_cases;
              // Notre constante service utilise 'serviceId' en camelCase, donc il faut corriger ici
              const serviceInfo = services.find(s => s.id === caseInfo.service_id); 
              return (
                <div key={caseInfo.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-700">{caseInfo.patient?.nom || 'Cas sans nom'}</p>
                    <p className="text-sm text-slate-500">{serviceInfo?.name || 'Inconnu'} · Le {new Date(progress.started_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${progress.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {progress.status === 'started' ? 'En cours' : 'Terminé'}
                    </span>
                    {progress.score !== null && <p className="text-sm font-bold mt-1 text-slate-600">{progress.score} / 100</p>}
                  </div>
                </div>
              );
            })
          ) : (
             <div className="text-center py-8 text-slate-500">
                <BriefcaseMedical className="mx-auto w-10 h-10 text-slate-400 mb-2"/>
                <p className="font-medium">Aucune activité pour le moment.</p>
                <p className="text-sm">Commencez un cas depuis la bibliothèque pour voir votre progression ici.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;