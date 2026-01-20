'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLearnerHistoryDetailed, DetailedHistoryResponse } from '@/services/SimulationService';
import { 
  TrendingUp, Award, Clock, FileText, Calendar, 
  BarChart2, FolderOpen, Heart, Activity, AlertCircle
} from 'lucide-react';
import FunFactLoader from '@/components/common/FunFactLoader';
import { services } from '@/types/simulation/constant'; // Pour récupérer les icônes des services

// Fonction pour formater la date proprement
const formatDate = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { 
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
        });
    } catch { return dateStr; }
};

// Fonction couleur selon la note
const getScoreColor = (note: number) => {
    if (note >= 16) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (note >= 10) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (note >= 1) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-slate-400 bg-slate-100 border-slate-200';
};

export default function AnalyticProfile() {
    const { user } = useAuth();
    const [history, setHistory] = useState<DetailedHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            console.group("📊 [Profile] Fetching Learner Journey");
            try {
                // Utilise le service SimulationService avec la route spécifiée
                const data = await getLearnerHistoryDetailed(user.id);
                setHistory(data);
            } catch (error) {
                console.error("Erreur chargement profil:", error);
            } finally {
                setLoading(false);
                console.groupEnd();
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="h-96 flex items-center justify-center"><FunFactLoader /></div>;

    // Calculs de stats globales
    const totalSessions = history?.historique_par_categorie.reduce((acc, cat) => acc + cat.sessions.length, 0) || 0;
    const globalAverage = history?.historique_par_categorie.length 
        ? (history.historique_par_categorie.reduce((acc, cat) => acc + cat.moyenne_categorie, 0) / history.historique_par_categorie.length).toFixed(1)
        : 0;

    return (
        <div className="flex flex-col gap-8 h-full pb-20 animate-in fade-in duration-500">
            
            {/* --- EN-TÊTE : Identité & KPIs Globaux --- */}
            <div className="bg-[#052648] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
                {/* Deco Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-[80px] opacity-20 pointer-events-none"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl text-3xl">
                        🎓
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{user?.nom || "Docteur"}</h1>
                        <p className="text-blue-200 text-sm flex items-center gap-2">
                            <span className="bg-blue-600/30 px-3 py-1 rounded-full text-xs font-mono">{user?.matricule}</span>
                            <span>{user?.niveau_etudes || "Étudiant en Médecine"}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 relative z-10">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center min-w-[100px] border border-white/5">
                        <div className="text-blue-300 text-xs uppercase font-bold mb-1">Total Cas</div>
                        <div className="text-3xl font-bold">{totalSessions}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center min-w-[100px] border border-white/5">
                        <div className="text-emerald-300 text-xs uppercase font-bold mb-1">Moyenne</div>
                        <div className="text-3xl font-bold">{globalAverage}<span className="text-sm opacity-50">/20</span></div>
                    </div>
                </div>
            </div>

            {/* --- CONTENU PRINCIPAL : HISTORIQUE PAR CATEGORIE --- */}
            <div className="grid grid-cols-1 gap-8">
                
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-[#052648]"><TrendingUp size={24}/></div>
                    <h2 className="text-xl font-bold text-slate-800">Parcours d'Apprentissage par Spécialité</h2>
                </div>

                {!history?.historique_par_categorie || history.historique_par_categorie.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                        <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
                        <p>Aucune session enregistrée pour le moment.</p>
                        <p className="text-sm">Allez dans l'onglet "Objectifs" pour commencer.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {history.historique_par_categorie.map((categoryGroup, index) => {
                            // Essayer de trouver une icône correspondante, sinon defaut
                            const ServiceObj = services.find(s => categoryGroup.categorie.toLowerCase().includes(s.name.toLowerCase())) || services[0];
                            const ServiceIcon = ServiceObj.icon || Activity;

                            return (
                                <div key={index} className="flex flex-col md:flex-row gap-6 relative">
                                    {/* LIGNE VERTICALE GAUCHE (Trace) */}
                                    <div className="absolute left-[26px] top-10 bottom-0 w-0.5 bg-slate-200 hidden md:block"></div>

                                    {/* --- 1. EN-TETE CATEGORIE (GAUCHE) --- */}
                                    <div className="md:w-1/4 flex flex-col md:items-end md:text-right shrink-0 relative z-10 bg-transparent">
                                        <div className="flex items-center md:flex-row-reverse gap-4 mb-2">
                                            <div className="w-14 h-14 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center text-[#052648] shrink-0">
                                                <ServiceIcon size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-[#052648]">{categoryGroup.categorie}</h3>
                                                <div className="flex items-center gap-2 md:justify-end text-sm text-slate-500">
                                                    <span>{categoryGroup.sessions.length} sessions</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Score de la catégorie */}
                                        <div className="bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 mt-1">
                                            Moyenne : <span className="text-blue-600 text-sm font-bold">{Math.round(categoryGroup.moyenne_categorie)}/20</span>
                                        </div>
                                    </div>

                                    {/* --- 2. LISTE DES SESSIONS (TIMELINE DROITE) --- */}
                                    <div className="md:w-3/4 space-y-4">
                                        {categoryGroup.sessions.map((session, sIdx) => {
                                            const statusClass = getScoreColor(session.note);
                                            return (
                                                <div 
                                                    key={sIdx} 
                                                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                >
                                                    {/* Info Principale */}
                                                    <div className="flex gap-4">
                                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${session.etat === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
                                                                {session.cas_titre}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                                                                <span className="flex items-center gap-1 font-mono">
                                                                    <AlertCircle size={10} /> ID: {session.session_id.substring(0,8)}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={10} /> {formatDate(session.date)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Score & Badge */}
                                                    <div className="flex items-center gap-3 pl-6 border-l border-slate-100 sm:border-0 sm:pl-0">
                                                        {session.etat === 'completed' ? (
                                                            <div className={`px-4 py-2 rounded-xl text-center border ${statusClass}`}>
                                                                <div className="text-[10px] uppercase font-bold tracking-wider">Note</div>
                                                                <div className="text-lg font-black leading-none">{Math.round(session.note)}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200">
                                                                Abandonné
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Fin de catégorie marqueur */}
                                        <div className="flex items-center gap-4 pt-4 opacity-30">
                                            <div className="flex-1 h-px bg-slate-300"></div>
                                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}