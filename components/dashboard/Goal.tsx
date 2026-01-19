'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Lock, Play, Award, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { services } from '@/types/simulation/constant';
import { getLearnerGoalsStatus } from '@/services/SimulationService';
import toast from 'react-hot-toast';

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
}

const STATUS_CONFIG = {
    diagnostic: {
        label: 'Test Niveau',
        color: 'text-purple-600',
        bg: 'bg-purple-100',
        icon: Target
    },
    training: {
        label: 'Entraînement',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        icon: BookOpen
    },
    evaluation: {
        label: 'Certification',
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        icon: Award
    },
    locked: {
        label: 'Bloqué',
        color: 'text-gray-400',
        bg: 'bg-gray-100',
        icon: Lock
    }
};

export default function Goals() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<GoalCardData[]>([]);

    useEffect(() => {
        if (!user) return;
        
        const loadGoals = async () => {
            setLoading(true);
            try {
                const serverData = await getLearnerGoalsStatus(user.id);
                
                const mappedGoals = services.map(service => {
                    const serverStatus = serverData.find(
                        (d) => d.category === service.name
                    );

                    return {
                        id: service.id,
                        name: service.name,
                        phase: serverStatus?.phase || 'diagnostic',
                        progress: serverStatus
                            ? (serverStatus.cas_completed / serverStatus.total_cases_phase) * 100
                            : 0,
                        currentStep: serverStatus?.cas_completed || 0,
                        totalSteps: serverStatus?.total_cases_phase || 1,
                        locked: serverStatus?.locked || false,
                        avgScore: serverStatus?.score_avg || null,
                        level_name: serverStatus?.level_name || 'Débutant'
                    };
                });

                setGoals(mappedGoals);
            } catch (error) {
                console.error('Erreur chargement objectifs:', error);
                toast.error('Impossible de charger vos objectifs');
                
                // Fallback: initialiser avec données par défaut
                const defaultGoals = services.map(service => ({
                    id: service.id,
                    name: service.name,
                    phase: 'diagnostic' as const,
                    progress: 0,
                    currentStep: 0,
                    totalSteps: 1,
                    locked: false,
                    avgScore: null,
                    level_name: 'Débutant'
                }));
                setGoals(defaultGoals);
            } finally {
                setLoading(false);
            }
        };

        loadGoals();
    }, [user]);

    const handleLaunch = (categoryName: string, phase: string) => {
        router.push(`/simulation?category=${categoryName}&mode=${phase}`);
    };

    if (loading) {
        return (
            <div className="p-10 flex justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-blue-900" />
            </div>
        );
    }

    const validatedCount = goals.filter(
        g => g.avgScore && g.avgScore >= 12
    ).length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#052648]">
                            Parcours de Spécialisation
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-2xl">
                            Progressez à travers 3 phases : <strong>Diagnostic Initial</strong> (1 cas) →{' '}
                            <strong>Entraînement Guidé</strong> (3 cas) →{' '}
                            <strong>Certification</strong> (3 cas). Validez 2/3 des cas sommatifs pour
                            maîtriser une spécialité.
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-600">
                                {validatedCount}
                            </div>
                            <div className="text-xs uppercase text-slate-400 font-bold">
                                Validés
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                                {goals.filter(g => g.progress > 0 && g.progress < 100).length}
                            </div>
                            <div className="text-xs uppercase text-slate-400 font-bold">
                                En Cours
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des Objectifs */}
            <div className="grid grid-cols-1 gap-4">
                {goals.map((goal) => {
                    const statusKey = goal.locked
                        ? 'locked'
                        : (goal.phase as keyof typeof STATUS_CONFIG);
                    const style = STATUS_CONFIG[statusKey] || STATUS_CONFIG.training;
                    const StatusIcon = style.icon;

                    return (
                        <div
                            key={goal.id}
                            className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Icon & Name */}
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold ${
                                            goal.locked
                                                ? 'bg-slate-100 text-slate-400'
                                                : 'bg-gradient-to-br from-slate-50 to-white text-[#052648] border shadow-sm'
                                        }`}
                                    >
                                        {goal.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#052648]">
                                            {goal.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${style.bg} ${style.color}`}
                                            >
                                                <StatusIcon size={10} /> {style.label}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                • Étape {goal.currentStep}/{goal.totalSteps}
                                            </span>
                                            {goal.level_name && (
                                                <span className="text-xs text-slate-500 font-semibold">
                                                    • Niveau: {goal.level_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex-1 w-full md:max-w-xs flex flex-col gap-1">
                                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                                        <span>Progression Phase</span>
                                        <span>{Math.round(goal.progress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${
                                                goal.locked ? 'bg-slate-300' : 'bg-[#052648]'
                                            } transition-all duration-1000`}
                                            style={{ width: `${goal.progress}%` }}
                                        ></div>
                                    </div>
                                    {goal.avgScore !== null && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Score moyen: <strong>{goal.avgScore.toFixed(1)}/20</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="w-full md:w-auto">
                                    <Button
                                        onClick={() => handleLaunch(goal.name, goal.phase)}
                                        disabled={goal.locked}
                                        className={`w-full md:w-32 py-5 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 ${
                                            goal.locked
                                                ? 'bg-slate-200 text-slate-400'
                                                : 'bg-[#052648] text-white hover:bg-blue-900'
                                        }`}
                                    >
                                        {goal.locked ? (
                                            <Lock size={18} />
                                        ) : (
                                            <Play size={18} />
                                        )}
                                        <span className="ml-2">
                                            {goal.progress === 0 ? 'Commencer' : 'Continuer'}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}