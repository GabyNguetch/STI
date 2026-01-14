'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, AlertCircle, Loader2 } from 'lucide-react';
import { getAllClinicalCases } from '@/services/expertService'; // Nouveau service
import { BackendClinicalCase } from '@/types/backend'; // Nouveaux types

export default function ValidationListPage() {
    const [cases, setCases] = useState<BackendClinicalCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Appel API réel
                const data = await getAllClinicalCases();
                // Ici on pourrait filtrer localement ceux qui sont "en attente" si le backend ne le gère pas
                // Pour l'instant on affiche tout
                setCases(data);
            } catch (error) {
                console.error("Erreur chargement validation:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-[#052648] flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Récupération des cas du Backend...</div>;

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold text-primary">Gestion de la Connaissance</h1>
                <p className="text-slate-600 mt-1">Liste des cas cliniques enregistrés dans le backend expert (IDB).</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
                <div className="grid grid-cols-5 gap-4 px-4 text-xs font-semibold text-slate-500 uppercase">
                    <p className="col-span-2">Pathologie (ID Backend)</p>
                    <p>Difficulté</p>
                    <p>Code Ref</p>
                    <p className="text-right">Action</p>
                </div>
                {cases.length > 0 ? (
                    cases.map(c => {
                        return (
                             <div key={c.id} className="grid grid-cols-5 gap-4 items-center p-4 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                <div className="col-span-2">
                                    <p className="font-semibold text-primary">
                                        {c.pathologie_principale ? c.pathologie_principale.nom_fr : `Maladie ID #${c.pathologie_principale_id}`}
                                    </p>
                                    <p className="text-xs text-slate-500">Créé le {new Date(c.created_at).toLocaleDateString()}</p>
                                </div>
                                <p className="text-sm text-slate-600">Niveau {c.niveau_difficulte}</p>
                                <p className="text-sm text-slate-600 font-mono bg-slate-100 w-fit px-2 py-1 rounded">{c.code_fultang}</p>
                                <div className="flex justify-end">
                                    <Link href={`/expert/validation/${c.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                                        <Eye size={16}/> Détails API
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                ) : (
                     <div className="text-center py-12">
                        <AlertCircle className="mx-auto w-12 h-12 text-slate-400" />
                        <h2 className="mt-4 font-semibold text-primary">Aucun cas trouvé</h2>
                        <p className="text-sm text-slate-500 mt-1">Utilisez le formulaire "Créer" pour alimenter la base.</p>
                    </div>
                )}
            </div>
        </div>
    );
}