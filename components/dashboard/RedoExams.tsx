// components/dashboard/RedoExams.tsx
'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Repeat, Check, AlertCircle } from 'lucide-react';
import type { UseCase } from '@/types/simulation/types';
import { Button } from '../ui/Button';

interface RedoExamsProps {
  allCases: UseCase[]; // Toujours utile si on veut afficher "cas non commencés"
  userProgress: any[];
}

const RedoExams: React.FC<RedoExamsProps> = ({ allCases, userProgress }) => {
  const router = useRouter();
  
  // Calcule la liste des cas à refaire ou à continuer.
  const casesToRedo = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'started' || (p.status === 'completed' && (p.score || 0) < 50))
      .map(p => ({
        ...p.clinical_cases,
        progressStatus: p.status, // On ajoute le statut et le score pour l'affichage
        progressScore: p.score
      }));
  }, [userProgress]);

  // Redirige simplement vers la page de simulation
  const handleRelaunchCase = (caseId: string) => {
    router.push(`/simulation?caseId=${caseId}`);
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200/80 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-8 h-8 text-orange-500" />
        <h3 className="text-2xl font-bold text-slate-800">Échéances & Cas à Améliorer</h3>
      </div>
      <p className="text-slate-600 mb-6">
        Voici les simulations que vous avez commencées mais pas encore terminées, ou celles où votre score peut être amélioré.
      </p>

      {casesToRedo.length > 0 ? (
        <div className="space-y-4">
          {casesToRedo.map(c => (
            <div key={c.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div>
                <p className="font-semibold text-slate-800">{c.patient?.nom}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span>Difficulté: <span className="font-bold text-slate-700">{c.difficulty}</span></span>
                  {c.progressScore !== null && (
                     <span className="font-bold text-red-600">Score: {c.progressScore}%</span>
                  )}
                </div>
              </div>
              <Button onClick={() => handleRelaunchCase(c.id)} className="w-full md:w-auto">
                <Repeat size={16} className="mr-2"/> 
                {c.progressStatus === 'started' ? 'Continuer' : 'Recommencer'}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-green-50 rounded-lg text-green-700 font-semibold flex flex-col items-center gap-3">
          <Check size={24} />
          <p>Félicitations, vous n'avez aucune évaluation à recommencer !</p>
        </div>
      )}
    </div>
  );
};

export default RedoExams;