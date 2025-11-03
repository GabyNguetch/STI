import React from 'react';
import { ClinicalCase } from '@/types/dashboard';

// Composant pour l'onglet Échéances
interface RedoExamsProps {
  cases: ClinicalCase[];
}

const RedoExams: React.FC<RedoExamsProps> = ({ cases }) => {
  const failedCases = cases.filter(c => c.status === 'échec');
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200/80">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Évaluations à Revoir</h3>
      <p className="text-slate-600 mb-6">
        Voici les cas cliniques où votre performance était inférieure au seuil de réussite. C'est une excellente occasion d'apprendre de vos erreurs.
      </p>
      {failedCases.length > 0 ? (
        <div className="space-y-4">
          {failedCases.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <p className="font-semibold text-slate-800">{c.title}</p>
                <p className="text-sm text-slate-500">Score: <span className="font-bold text-red-600">{c.score}%</span> · Spécialité: {c.specialty}</p>
              </div>
              <button className="px-4 py-2 bg-[#052648] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                Recommencer
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-10 bg-slate-50 rounded-lg text-slate-500">
          Félicitations, vous n'avez aucune évaluation à recommencer !
        </p>
      )}
    </div>
  );
};
export default RedoExams;