// app/dashboard/goals/Goals.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, CheckCircle, Lock, Play, Award, Sparkles, School2, Activity, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { services } from '@/types/simulation/constant';
import { getLearnerHistoryDetailed } from '@/services/SimulationService';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GoalCardData {
    id: string;
    name: string;
    phase: 'diagnostic' | 'training' | 'evaluation';
    progress: number;
    currentStep: number;
    totalSteps: number;
    locked: boolean;
    avgScore: number | null;
    level_name: string;
    globalPercentage?: number;
    statusLabel?: string;
    icon?: any;
    bgImage?: string;
}

const STATUS_CONFIG = {
    diagnostic: { label: 'Test Niveau', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', icon: Target },
    training: { label: 'Entraînement', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', icon: BookOpen },
    evaluation: { label: 'Certification', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200', icon: Award },
    locked: { label: 'Bloqué', color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-slate-200', icon: Lock },
    completed: { label: 'Validé', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: CheckCircle }
};

const CHART_COLORS = ['#10B981', '#3B82F6', '#E5E7EB'];

export default function Goals() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<GoalCardData[]>([]);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setLoading(true);
            try {
                let historyData;
                try {
                    historyData = await getLearnerHistoryDetailed(user.id);
                } catch (err) {
                    console.warn("⚠️ [Goal] API History inaccessible, utilisation fallback local.", err);
                    historyData = { historique_par_categorie: [] };
                }

                const mappedGoals = services.map(service => {
                    const catHistory = historyData.historique_par_categorie.find(
                        (h: any) => h.categorie.toLowerCase().includes(service.name.toLowerCase()) || 
                                    service.name.toLowerCase().includes(h.categorie.toLowerCase())
                    );

                    const sessions = catHistory?.sessions || [];
                    const totalSessions = sessions.length;
                    const averageScore = catHistory?.moyenne_categorie || 0;

                    let currentPhase: 'diagnostic' | 'training' | 'evaluation' = 'diagnostic';
                    
                    if (totalSessions >= 1) currentPhase = 'training';
                    if (totalSessions >= 5) currentPhase = 'evaluation';

                    let globalPercentage = 0;
                    
                    if (currentPhase === 'diagnostic') {
                        globalPercentage = 0;
                    } else if (currentPhase === 'training') {
                        globalPercentage = Math.min(Math.round(((totalSessions - 1) / 4) * 100), 90); 
                    } else if (currentPhase === 'evaluation') {
                        globalPercentage = 100;
                    }

                    const isLocked = false; 

                    return {
                        id: service.id,
                        name: service.name,
                        icon: service.icon,
                        bgImage: service.bgImage,
                        
                        phase: currentPhase,
                        progress: globalPercentage,
                        currentStep: totalSessions > 5 ? 5 : totalSessions,
                        totalSteps: 5,
                        
                        locked: isLocked,
                        avgScore: totalSessions > 0 ? Math.round(averageScore) : null,
                        
                        level_name: totalSessions === 0 ? 'Novice' : 
                                   totalSessions < 3 ? 'Apprenti' : 
                                   totalSessions < 5 ? 'Junior' : 'Confirmé',
                        
                        globalPercentage: globalPercentage 
                    };
                });

                setGoals(mappedGoals);

            } catch (error) {
                console.error("❌ Critical error mapping goals:", error);
                toast.error("Erreur de synchronisation des objectifs.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleLaunch = (categoryName: string, phase: string, locked: boolean = false) => {
        if (locked) {
            toast.error('Ce module est verrouillé. Complétez les prérequis !', { 
                icon: '🔒',
                duration: 3000 
            });
            return;
        }
        
        const url = `/simulation?category=${encodeURIComponent(categoryName)}&mode=${phase}`;
        console.log('🚀 Lancement simulation:', { categoryName, phase, url });
        router.push(url);
    };

    const validatedCount = goals.filter(g => g.globalPercentage >= 100).length;
    const inProgressCount = goals.filter(g => g.globalPercentage > 0 && g.globalPercentage < 100).length;
    const todoCount = goals.length - validatedCount - inProgressCount;
    
    const chartData = [
        { name: 'Validés', value: validatedCount },
        { name: 'En cours', value: inProgressCount },
        { name: 'À démarrer', value: todoCount },
    ].filter(i => i.value > 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#052648]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row gap-6 h-full pb-20">
             
            <div className="flex-1 space-y-6">
                
                <div className="relative rounded-3xl bg-[#052648] text-white shadow-xl overflow-hidden group border border-[#0a4d8f] min-h-[280px]">
                    
                    <div 
                        className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{
                            backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#052648] via-[#052648]/90 to-transparent z-0"></div>

                    <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center h-full">
                        <div className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-blue-200 border border-white/20 text-xs font-bold uppercase tracking-wider w-fit">
                            <Sparkles size={14} className="text-yellow-400"/> Programme Personnalisé
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight tracking-tight max-w-2xl">
                                Progressez vers l'excellence,<br/><span className="text-blue-300">spécialité par spécialité.</span>
                        </h2>
                        
                         <div className="flex items-center gap-6 mt-2 text-blue-100 text-sm font-medium">
                            <span className="flex items-center gap-2"><Target size={16}/> 3 Phases par module</span>
                            <span className="flex items-center gap-2"><Award size={16}/> Certification Expert</span>
                        </div>
                    </div>
                    
                    <div className="absolute right-[-40px] bottom-[-40px] text-white opacity-5 rotate-12 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-1000 hidden md:block">
                        <School2 size={380} strokeWidth={1.5} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {goals.map((goal) => {
                        let statusKey = goal.locked ? 'locked' : (goal.phase as keyof typeof STATUS_CONFIG);
                        if(goal.globalPercentage >= 100) statusKey = 'completed';

                        const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.locked;
                        const StatusIcon = config.icon;
                        const ServiceIcon = goal.icon || Activity; 

                        return (
                            <div
                                key={goal.id}
                                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
                            >
                                <div className="h-32 relative bg-slate-100 overflow-hidden">
                                     <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60"
                                         style={{backgroundImage: `url(${goal.bgImage || '/images/default-medical.jpg'})`}}>
                                     </div>
                                     <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                     
                                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm px-2.5 py-1 rounded-lg text-xs font-bold text-[#052648] border border-slate-100">
                                         Niveau {goal.level_name}
                                     </div>
                                </div>

                                <div className="px-6 flex-1 relative -mt-8 flex flex-col">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg mb-3 z-10 transition-transform group-hover:scale-110 ${goal.locked ? 'bg-slate-300 text-white' : 'bg-gradient-to-br from-[#052648] to-blue-700 text-white'}`}>
                                        <ServiceIcon size={26} />
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-[#052648] mb-1">{goal.name}</h3>

                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-4 border w-fit ${config.bg} ${config.color} ${config.border}`}>
                                         <StatusIcon size={12}/> {config.label}
                                    </div>
                                    
                                    <div className="space-y-1.5 mt-auto">
                                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                                            <span>Étape {goal.currentStep} / {goal.totalSteps}</span>
                                            <span>{Math.round(goal.progress)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ease-out ${goal.locked ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-500 to-[#052648]'}`}
                                                style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="p-4 mt-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-4">
                                     {goal.avgScore !== null ? (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Moyenne</span>
                                            <span className={`text-sm font-bold ${goal.avgScore >= 12 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                {goal.avgScore}/20
                                            </span>
                                        </div>
                                     ) : (
                                         <span className="text-xs text-slate-400 italic">Pas de note</span>
                                     )}
                                     
                                     <Button
                                        onClick={() => handleLaunch(goal.name, goal.phase, goal.locked)}
                                        disabled={goal.locked}
                                        className={`flex-1 rounded-xl shadow-md transition-all text-xs font-bold py-2.5 ${
                                            goal.locked 
                                            ? 'bg-slate-200 text-slate-400 shadow-none' 
                                            : statusKey === 'completed'
                                              ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                              : 'bg-[#052648] text-white hover:bg-blue-900 hover:shadow-lg'
                                        }`}
                                    >
                                        {goal.locked ? <><Lock size={14} className="mr-2"/> Verrouillé</> : 
                                         statusKey === 'completed' ? <><CheckCircle size={14} className="mr-2"/> Revoir</> :
                                         goal.progress === 0 ? <><Play size={14} className="mr-2"/> Démarrer</> : <><Play size={14} className="mr-2"/> Reprendre</>}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="xl:w-80 w-full space-y-6">
                
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-[#052648] mb-4 flex items-center gap-2">
                        <Activity className="text-blue-500" size={20}/> Synthèse
                    </h3>
                    <div className="h-48 relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-[#052648]">{goals.length}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Modules</span>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                         <div className="flex justify-between items-center text-xs">
                             <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: CHART_COLORS[0]}}/> Terminés</span>
                             <span className="font-bold text-slate-700">{validatedCount}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                             <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: CHART_COLORS[1]}}/> En cours</span>
                             <span className="font-bold text-slate-700">{inProgressCount}</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}