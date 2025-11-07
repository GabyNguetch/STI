// app/expert/validation/page.tsx
'use client';

import React from 'react';
import { useCases } from '@/contexts/CaseContext';
import { services } from '@/types/simulation/constant';
import Link from 'next/link';
import { Eye, AlertCircle } from 'lucide-react';

export default function ValidationListPage() {
    const { cases } = useCases();
    const pendingCases = cases.filter(c => c.status === 'pending');

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold text-primary">Validation en Attente</h1>
                <p className="text-slate-600 mt-1">Liste de tous les cas générés par l'IA en attente d'approbation.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
                {/* En-têtes */}
                <div className="grid grid-cols-5 gap-4 px-4 text-xs font-semibold text-slate-500 uppercase">
                    <p className="col-span-2">Patient</p>
                    <p>Difficulté</p>
                    <p>Soumis par</p>
                    <p className="text-right">Action</p>
                </div>
                {pendingCases.length > 0 ? (
                    pendingCases.map(c => {
                        const service = services.find(s => s.id === c.serviceId);
                        return (
                             <div key={c.id} className="grid grid-cols-5 gap-4 items-center p-4 rounded-lg hover:bg-slate-50">
                                <div className="col-span-2">
                                    <p className="font-semibold text-primary">{c.patient.nom}</p>
                                    <p className="text-xs text-slate-500">{service?.name}</p>
                                </div>
                                <p className="text-sm text-slate-600">{c.difficulty}</p>
                                <p className="text-sm text-slate-600">{c.submittedBy}</p>
                                <div className="flex justify-end">
                                    <Link href={`/expert/validation/${c.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-700">
                                        <Eye size={16}/> Examiner
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                ) : (
                     <div className="text-center py-12">
                        <AlertCircle className="mx-auto w-12 h-12 text-green-500" />
                        <h2 className="mt-4 font-semibold text-primary">File d'attente vide !</h2>
                        <p className="text-sm text-slate-500 mt-1">Tous les cas ont été traités. Excellent travail !</p>
                    </div>
                )}
            </div>
        </div>
    );
}