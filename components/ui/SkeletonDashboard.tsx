// components/dashboard/DashboardSkeleton.tsx
'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar'; // Nous réutilisons la vraie sidebar

// Petit composant pour un bloc de squelette animé
const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-slate-200 animate-pulse rounded-md ${className}`} />
);

const DashboardSkeleton = () => {
    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* On peut afficher la vraie sidebar car elle n'attend pas de données */}
            <Sidebar activeTab="overview" setActiveTab={() => {}} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Squelette du Header */}
                <header className="flex-shrink-0 h-20 flex items-center justify-between px-8 border-b border-slate-200 bg-white">
                    <div>
                        <SkeletonBlock className="h-7 w-64 mb-2" />
                        <SkeletonBlock className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-6">
                        <SkeletonBlock className="h-6 w-6 rounded-full" />
                        <div className="flex items-center gap-3">
                            <SkeletonBlock className="w-10 h-10 rounded-full" />
                            <div>
                                <SkeletonBlock className="h-5 w-24 mb-1" />
                                <SkeletonBlock className="h-3 w-16" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Squelette du Contenu Principal */}
                <main className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Squelette des StatCards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonBlock className="h-24 rounded-xl" />
                        <SkeletonBlock className="h-24 rounded-xl" />
                        <SkeletonBlock className="h-24 rounded-xl" />
                    </div>

                    {/* Squelette de la table d'activité récente */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80">
                        <SkeletonBlock className="h-6 w-40 mb-6" />
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <SkeletonBlock className="h-10 w-2/3" />
                                <SkeletonBlock className="h-6 w-1/5" />
                            </div>
                            <div className="flex justify-between items-center">
                                <SkeletonBlock className="h-10 w-2/3" />
                                <SkeletonBlock className="h-6 w-1/5" />
                            </div>
                            <div className="flex justify-between items-center">
                                <SkeletonBlock className="h-10 w-2/3" />
                                <SkeletonBlock className="h-6 w-1/5" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardSkeleton;