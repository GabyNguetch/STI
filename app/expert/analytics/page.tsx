// app/expert/analytics/page.tsx
'use client';

import React from 'react';
import { TrendingUp, Target, AlertTriangle, Clock, Eye } from 'lucide-react';

// Importez vos types et données mock
import { SessionLog } from '@/types/expert/types';
import { useCases } from '@/types/simulation/constant';
import { services } from '@/types/simulation/constant';

/**
 * Composant réutilisable pour afficher une carte de statistique.
 */
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.FC<any>, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
    </div>
  </div>
);

// Données "mock" pour simuler les logs de sessions des apprenants.
// À terme, ces données viendront de votre base de données via une API.
const mockSessionLogs: SessionLog[] = [
    { sessionId: 'S1-XYZ', caseId: 'neuro-001', studentId: 'Apprenant-A1B2', success: false, score: 45, timeSpent: 25, date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), isFlagged: true },
    { sessionId: 'S2-ABC', caseId: 'cardio-001', studentId: 'Apprenant-C3D4', success: true, score: 90, timeSpent: 15, date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isFlagged: false },
    { sessionId: 'S3-LMN', caseId: 'neuro-001', studentId: 'Apprenant-E5F6', success: false, score: 55, timeSpent: 30, date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), isFlagged: false },
    { sessionId: 'S4-PQR', caseId: 'orl-001', studentId: 'Apprenant-G7H8', success: true, score: 95, timeSpent: 8, date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), isFlagged: false },
    { sessionId: 'S5-IJK', caseId: 'pneumo-001', studentId: 'Apprenant-I9J0', success: false, score: 65, timeSpent: 22, date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), isFlagged: true },
];

const flaggedCases = mockSessionLogs.filter(s => s.isFlagged);

/**
 * La page principale d'analyse des performances.
 */
export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            {/* En-tête de la page */}
            <div>
                <h1 className="text-3xl font-bold text-primary">Analyse des Performances</h1>
                <p className="text-slate-600 mt-1">Suivez les résultats des apprenants et identifiez les points d'amélioration.</p>
            </div>
            
            {/* Cartes de statistiques clés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Taux de Succès Global" value="78%" icon={TrendingUp} color="bg-green-500" />
                <StatCard title="Score Moyen" value="82/100" icon={Target} color="bg-blue-500" />
                <StatCard title="Cas "Hors-Piste" à Examiner" value={flaggedCases.length.toString()} icon={AlertTriangle} color="bg-red-500" />
                <StatCard title="Temps Moyen par Cas" value="18 min" icon={Clock} color="bg-yellow-500" />
            </div>

            {/* Section des cas "hors-piste" / escaladés */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2"><AlertTriangle className="text-red-500"/> Sessions Escaladées ("Hors-Piste")</h2>
                    <p className="text-sm text-slate-500 mt-1">Ces sessions ont été marquées car l'apprenant a suivi un chemin de diagnostic inattendu.</p>
                </div>
                <div className="p-4 space-y-2">
                    {/* En-têtes de la liste */}
                    <div className="grid grid-cols-6 gap-4 px-4 text-xs font-semibold text-slate-500 uppercase">
                        <p className="col-span-2">Cas Clinique</p>
                        <p>Apprenant</p>
                        <p>Score</p>
                        <p>Temps</p>
                        <p className="text-right">Action</p>
                    </div>
                    {/* Liste des sessions */}
                    {flaggedCases.map(log => {
                        const useCase = useCases.find(c => c.id === log.caseId);
                        const service = services.find(s => s.id === useCase?.serviceId);
                        return (
                            <div key={log.sessionId} className="grid grid-cols-6 gap-4 items-center p-4 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="col-span-2 flex items-center gap-3">
                                    {service && <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><service.icon className="w-4 h-4 text-primary" /></div>}
                                    <div>
                                        <p className="font-semibold text-primary text-sm">{useCase?.patient.nom}</p>
                                        <p className="text-xs text-slate-500">{service?.name}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600">{log.studentId}</p>
                                <p className={`text-sm font-semibold ${log.score < 60 ? 'text-red-600' : 'text-yellow-600'}`}>{log.score}/100</p>
                                <p className="text-sm text-slate-600">{log.timeSpent} min</p>
                                <div className="flex justify-end">
                                    <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-700">
                                        <Eye size={16}/> Analyser
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}