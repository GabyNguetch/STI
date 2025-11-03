import React from 'react';
import { CheckCircle2, Award, BarChart2, BriefcaseMedical } from 'lucide-react';
import { Stats, ClinicalCase } from '@/types/dashboard';

// Sous-composant pour les cartes de statistiques
const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/80 flex items-center gap-5">
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
  stats: Stats;
  cases: ClinicalCase[];
}

const Overview: React.FC<OverviewProps> = ({ stats, cases }) => {
  return (
    <div className="space-y-8">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={BriefcaseMedical} title="Cas cliniques complétés" value={stats.casesCompleted} color="#052648" />
        <StatCard icon={CheckCircle2} title="Taux de réussite" value={`${stats.successRate}%`} color="#22C55E" />
        <StatCard icon={Award} title="Niveau actuel" value={stats.currentLevel} color="#F59E0B" />
      </div>

      {/* Derniers cas cliniques */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Activité Récente</h3>
        <div className="space-y-3">
          {cases.slice(0, 3).map((caseItem) => (
            <div key={caseItem.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
              <div>
                <p className="font-semibold text-slate-700">{caseItem.title}</p>
                <p className="text-sm text-slate-500">{caseItem.specialty} · Terminé le {caseItem.dateCompleted}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  caseItem.status === 'réussi'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {caseItem.status === 'réussi' ? `${caseItem.score}%` : 'À revoir'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Carte du parcours (simplifiée) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80">
         <h3 className="text-lg font-bold text-slate-800 mb-4">Votre Parcours</h3>
         {/* Ceci est une représentation visuelle simple. Peut être remplacé par une librairie SVG ou de charting */}
         <div className="relative flex items-center justify-between pt-6">
            <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 w-full"></div>
            {['Débutant', 'Interne', 'Confirmé', 'Expert'].map((level, index) => (
                <div key={level} className="z-10 text-center">
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center border-4 ${index <= 1 ? 'border-blue-700 bg-white' : 'border-slate-300 bg-slate-300'}`}>
                       {index <= 1 && <div className="w-2.5 h-2.5 bg-blue-700 rounded-full"></div>}
                    </div>
                    <p className={`mt-2 text-sm font-semibold ${index <= 1 ? 'text-blue-700' : 'text-slate-500'}`}>{level}</p>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Overview;