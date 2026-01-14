'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, AlertCircle, ArrowLeft, Search, Play, Activity, Stethoscope, 
  FileText, Pill, Thermometer, Calendar, Microscope, FileDigit, Syringe, 
  Tags, Eye, X, ListPlus 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CaseCard } from '@/components/ui/CaseCard'; 
import { getAllClinicalCases, getClinicalCaseById } from '@/services/expertService';
import { services } from '@/types/simulation/constant';
import type { BackendClinicalCase, BackendClinicalCaseSimple } from '@/types/backend';
import type { UseCase } from '@/types/simulation/types';

// --- TYPE LOCAL POUR LE JSON RICHE (MIMIC) ---
interface RichCaseData extends BackendClinicalCase {
    // Surcharge pour gérer la flexibilité des champs JSONB PostgreSQL
    donnees_paracliniques: {
        lab_results?: Array<{ itemid?: string|number; label?: string; value: string|number; flag?: string }>;
        signes_vitaux?: any;
    };
    medicaments_prescrits: Array<{ medicament_id: number; nom: string; dose: string }>;
    pathologies_secondaires: Array<{ id?: number; nom_fr?: string; code_icd10?: string }>;
    pathologies_secondaires_ids: number[];
}

// --- MAPPING HELPERS ---
const mapDifficulty = (level?: number) => {
    if (!level) return 'Non évalué';
    if (level <= 3) return 'Débutant';
    if (level <= 6) return 'Intermédiaire';
    if (level <= 8) return 'Avancé';
    return 'Expert (Complexe)'; 
};

// Convertit le format brut pour la liste des cartes
const mapBackendToFrontend = (backendCase: BackendClinicalCaseSimple | BackendClinicalCase): UseCase => {
    // Protection contre les valeurs nulles
    const pathoName = (backendCase as any).pathologie_principale?.nom_fr 
        || (backendCase as any).presentation_clinique?.histoire_maladie?.substring(0, 50) 
        || `Cas #${backendCase.id}`;
        
    return {
        id: String(backendCase.id),
        serviceId: 'general',
        difficulty: mapDifficulty(backendCase.niveau_difficulte),
        patient: { nom: backendCase.code_fultang, age: 0, sexe: 'Masculin', motif: pathoName, antecedents: '', symptomes: '', signesVitaux: '', temperature: '', pressionArterielle: '', saturationOxygene: '', examenClinique: '', analyseBiologique: '', diagnostic: '', traitementAttendu: '' }
    };
};

// --- COMPOSANT MODAL LISTE ---
// Une modale générique pour afficher la liste complète (Traitements ou Pathologies)
const FullListModal = ({ 
    isOpen, onClose, title, items, renderItem 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    items: any[]; 
    renderItem: (item: any, idx: number) => React.ReactNode; 
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-[#052648] flex items-center gap-2">
                        <ListPlus className="text-blue-600" /> {title} 
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{items.length}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50">
                    <div className="space-y-3">
                        {items.map((item, idx) => renderItem(item, idx))}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end">
                    <Button onClick={onClose}>Fermer</Button>
                </div>
            </div>
        </div>
    );
};

// --- SQUELETTE ---
const SkeletonCard = () => (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[340px] animate-pulse">
        <div className="h-40 bg-slate-200 w-full" />
        <div className="p-4 flex-1 flex flex-col space-y-3">
            <div className="h-3 w-1/2 bg-slate-200 rounded-md" />
            <div className="h-10 w-full bg-slate-200 rounded-lg mt-auto" />
        </div>
    </div>
);

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function Library() {
    const router = useRouter();

    const [casesList, setCasesList] = useState<BackendClinicalCaseSimple[]>([]);
    const [selectedCaseFull, setSelectedCaseFull] = useState<RichCaseData | null>(null);

    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDetailView, setIsDetailView] = useState(false);
    
    // États pour les Modales "Voir Tout"
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'meds' | 'patho' | null }>({ isOpen: false, type: null });
    
    const [selectedService, setSelectedService] = useState<'all' | string>('all');
    const [searchQuery, setSearchQuery] = useState("");

    // Charge la liste au montage
    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        setIsLoadingList(true);
        try {
            const data = await getAllClinicalCases();
            if (Array.isArray(data)) setCasesList(data);
        } catch (e: any) {
            setError(e.message || "Erreur de chargement de la bibliothèque");
        } finally {
            setIsLoadingList(false);
        }
    };

    // Click sur un cas -> Charge le détail (Heavy Payload)
    const handleCardClick = async (caseId: number) => {
        setIsDetailView(true);
        setIsLoadingDetail(true);
        setSelectedCaseFull(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const data = await getClinicalCaseById(caseId);
            setSelectedCaseFull(data as RichCaseData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleBack = () => {
        setIsDetailView(false);
        setSelectedCaseFull(null);
    };

    // --- FILTRAGE DE LA LISTE ---
    const filteredCases = useMemo(() => {
        let res = casesList;
        if (selectedService !== 'all') {
             const serviceName = services.find(s => s.id === selectedService)?.name;
             if (serviceName) res = res.filter(c => c.pathologie_principale?.categorie === serviceName);
        }
        if (searchQuery.trim()) {
            const lowerQ = searchQuery.toLowerCase();
            res = res.filter(c => 
                (c.pathologie_principale?.nom_fr?.toLowerCase().includes(lowerQ)) || 
                c.code_fultang?.toLowerCase().includes(lowerQ)
            );
        }
        return res;
    }, [casesList, selectedService, searchQuery]);

    const sidebarCases = useMemo(() => filteredCases.filter(c => !selectedCaseFull || c.id !== selectedCaseFull.id), [filteredCases, selectedCaseFull]);

    // ============================================
    // RENDU : VUE DÉTAIL / ZOOM ("YouTube Layout")
    // ============================================
    if (isDetailView) {
        // --- PREPARATION DES DONNEES PARTIELLES ---
        
        // Pathologies Secondaires
        const secPathos = selectedCaseFull?.pathologies_secondaires || [];
        const hasMorePathos = secPathos.length > 2;
        const visiblePathos = secPathos.slice(0, 2);

        // Médicaments
        const meds = selectedCaseFull?.medicaments_prescrits || [];
        const hasMoreMeds = meds.length > 2;
        const visibleMeds = meds.slice(0, 2);

        // Titre Fallback (Le JSON montre pathologie_principale: null, donc on use history ou ID)
        const mainTitle = selectedCaseFull 
            ? (selectedCaseFull.pathologie_principale?.nom_fr || selectedCaseFull.presentation_clinique?.histoire_maladie?.split(':')[1]?.trim() || "Détail du cas clinique")
            : "";

        return (
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-500 min-h-screen pb-20">
                
                {/* 
                   ================================================================
                   GAUCHE (65%): CONTEXTE, HISTOIRE, SYMPTOMES, PATHOLOGIES 
                   ================================================================
                */}
                <div className="flex-1 lg:max-w-[65%] flex flex-col gap-6">
                    
                    <Button onClick={handleBack} variant="ghost" className="self-start pl-0 text-slate-500 hover:text-slate-800 -ml-2 mb-2 hover:bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour bibliothèque
                    </Button>

                    {isLoadingDetail || !selectedCaseFull ? (
                        <div className="space-y-6 animate-pulse">
                             <div className="h-64 w-full bg-slate-200 rounded-2xl" />
                             <div className="h-8 w-1/2 bg-slate-200 rounded" />
                             <div className="h-40 w-full bg-slate-200 rounded" />
                        </div>
                    ) : (
                        <div className="space-y-8">
                             
                             {/* BANNIÈRE HÉROS */}
                             <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#052648] to-[#0a4d8f] opacity-100"></div>
                                <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-repeat"></div>
                                
                                <div className="relative z-10 p-8 md:p-10 text-white">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-white/20 shadow-sm backdrop-blur-md bg-white/10`}>
                                            <Activity size={14}/> {mapDifficulty(selectedCaseFull.niveau_difficulte)}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-white/80 backdrop-blur-md">
                                            <Calendar size={14}/> {new Date(selectedCaseFull.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight tracking-tight line-clamp-2">
                                        {mainTitle}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100 font-medium font-mono bg-blue-900/30 w-fit px-4 py-2 rounded-lg backdrop-blur-sm border border-blue-500/30">
                                        <div className="flex items-center gap-2">
                                            <FileDigit size={18} className="text-cyan-400"/> 
                                            FULTANG_ID: <span className="text-white select-all">{selectedCaseFull.code_fultang}</span>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {/* CONTENEUR CARTE 1: HISTOIRE MALADIE */}
                             <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 relative overflow-hidden">
                                 <div className="absolute top-0 left-0 w-1.5 h-full bg-[#052648]"></div>
                                 <h3 className="text-lg font-bold text-[#052648] flex items-center gap-2 mb-4">
                                     <BookOpen className="text-blue-600" size={20}/> Histoire & Contexte Clinique
                                 </h3>
                                 <div className="text-slate-700 leading-relaxed text-sm md:text-base bg-slate-50 p-4 rounded-xl border border-slate-100">
                                     {selectedCaseFull.presentation_clinique.histoire_maladie}
                                 </div>
                             </div>

                             {/* CONTENEUR CARTE 2: COMORBIDITES (Limit 2 + Modal) */}
                             <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                     <span className="flex items-center gap-2"><Activity className="text-slate-400" size={16}/> Comorbidités Associées</span>
                                     <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{secPathos.length}</span>
                                 </h3>
                                 
                                 {secPathos.length > 0 ? (
                                     <div className="flex flex-wrap gap-3">
                                         {visiblePathos.map((p, idx) => (
                                             <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-800 border border-orange-100 rounded-lg text-sm font-medium">
                                                 <AlertCircle size={14} className="opacity-60" />
                                                 {p.nom_fr || `Pathologie Secondaire ${idx + 1}`}
                                             </div>
                                         ))}
                                         
                                         {/* BOUTON VOIR PLUS (...) */}
                                         {hasMorePathos && (
                                             <button 
                                                onClick={() => setModalConfig({isOpen: true, type: 'patho'})}
                                                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-dashed border-slate-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                             >
                                                 + {secPathos.length - 2} autres <Eye size={14}/>
                                             </button>
                                         )}
                                     </div>
                                 ) : (
                                     <div className="text-slate-400 italic text-sm py-2">Aucune comorbidité significative renseignée.</div>
                                 )}
                             </div>

                             {/* CONTENEUR CARTE 3: SYMPTÔMES */}
                             <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                                     <Tags className="text-slate-400" size={16}/> Symptomatologie Relevée
                                 </h3>
                                 <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                                     {Array.isArray(selectedCaseFull.presentation_clinique.symptomes_patient) && selectedCaseFull.presentation_clinique.symptomes_patient.length > 0 ? 
                                      selectedCaseFull.presentation_clinique.symptomes_patient.map((sym: any, i: number) => (
                                         <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                                             {typeof sym === 'string' ? sym : (sym.nom || `Symptôme ${i+1}`)}
                                         </span>
                                     )) : (
                                         <span className="text-slate-400 italic">Données symptomatiques non structurées.</span>
                                     )}
                                 </div>
                             </div>

                             {/* Bouton d'action flottant en bas de zone gauche (Desktop only logic) */}
                             <div className="sticky bottom-4 z-20 pt-4 bg-gradient-to-t from-white via-white to-transparent">
                                 <Button 
                                     size="lg" 
                                     className="w-full h-14 text-lg bg-[#052648] hover:bg-[#031a31] shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 rounded-xl border border-white/10"
                                     onClick={() => router.push(`/simulation?caseId=${selectedCaseFull.id}`)}
                                 >
                                     <Play className="mr-3 h-6 w-6 fill-current" /> Démarrer la Simulation
                                 </Button>
                             </div>
                        </div>
                    )}
                </div>

                {/* 
                   ================================================================
                   DROITE (35%) - STICKY : TRAITEMENTS & LABO (DÉFILABLE)
                   ================================================================
                */}
                <div className="w-full lg:w-[35%] lg:h-[calc(100vh-40px)] lg:sticky lg:top-6 flex flex-col gap-6">
                    
                    {selectedCaseFull && (
                        <>
                            {/* BLOCK 1: PRESCRIPTIONS (Limit 2 + Modal) */}
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col shrink-0">
                                <div className="bg-emerald-600/5 px-5 py-4 border-b border-emerald-100 flex justify-between items-center">
                                    <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                                        <Pill size={18} className="text-emerald-600" /> 
                                        Traitements
                                    </h3>
                                    <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-emerald-700 shadow-sm border border-emerald-100">
                                        {meds.length} molécules
                                    </span>
                                </div>
                                
                                <div className="p-4 space-y-3 bg-white">
                                    {/* Affiche seulement les 2 premiers */}
                                    {visibleMeds.length > 0 ? visibleMeds.map((med, idx) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                                <Syringe size={16}/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate" title={med.nom}>
                                                    {med.nom}
                                                </p>
                                                <p className="text-xs text-slate-500 font-mono bg-white inline-block px-1.5 rounded border border-slate-100 mt-1">
                                                    {med.dose}
                                                </p>
                                            </div>
                                        </div>
                                    )) : <div className="text-slate-400 italic text-center text-sm py-4">Aucun traitement listé</div>}

                                    {/* Bouton pour ouvrir la modale Médicaments */}
                                    {hasMoreMeds && (
                                        <button 
                                            onClick={() => setModalConfig({isOpen: true, type: 'meds'})}
                                            className="w-full py-2.5 mt-2 text-sm text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100 dashed flex items-center justify-center gap-2"
                                        >
                                            <ListPlus size={16}/> Voir les {meds.length - 2} autres médicaments
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* BLOCK 2: DONNÉES LABO (Défilable verticalement) */}
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-0">
                                <div className="bg-indigo-600/5 px-5 py-4 border-b border-indigo-100 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                        <Microscope size={18} className="text-indigo-600" /> 
                                        Données Labo
                                    </h3>
                                    <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-indigo-700 shadow-sm border border-indigo-100">
                                        {selectedCaseFull.donnees_paracliniques?.lab_results?.length || 0}
                                    </span>
                                </div>
                                
                                <div className="overflow-y-auto p-0 custom-scrollbar flex-1">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0 z-10 border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold w-1/2">Examen</th>
                                                <th className="px-4 py-3 font-semibold text-right w-1/2">Valeur</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedCaseFull.donnees_paracliniques?.lab_results?.map((lab, i) => (
                                                <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-4 py-2.5 font-medium text-slate-700 truncate max-w-[120px]" title={lab.label ? String(lab.label) : ''}>
                                                        {lab.label || lab.itemid || `Test #${i}`}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <span className={`font-mono text-xs px-2 py-1 rounded-md ${lab.flag ? 'bg-red-50 text-red-600 border border-red-100 font-bold' : 'bg-slate-50 text-slate-600'}`}>
                                                            {String(lab.value)} {lab.flag && '⚠️'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!selectedCaseFull.donnees_paracliniques?.lab_results || selectedCaseFull.donnees_paracliniques.lab_results.length === 0) && (
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">
                                                        Aucune donnée biologique disponible
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ======================= MODALES POPUP ======================= */}
                
                {/* 1. Modale Médicaments Complets */}
                {selectedCaseFull && (
                    <FullListModal 
                        isOpen={modalConfig.isOpen && modalConfig.type === 'meds'} 
                        onClose={() => setModalConfig({...modalConfig, isOpen: false})} 
                        title="Traitement Complet" 
                        items={selectedCaseFull.medicaments_prescrits || []}
                        renderItem={(med, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{med.nom}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-sm font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200">
                                        {med.dose}
                                    </span>
                                </div>
                            </div>
                        )}
                    />
                )}

                {/* 2. Modale Pathologies Complètes */}
                {selectedCaseFull && (
                    <FullListModal 
                        isOpen={modalConfig.isOpen && modalConfig.type === 'patho'} 
                        onClose={() => setModalConfig({...modalConfig, isOpen: false})} 
                        title="Toutes les Comorbidités" 
                        items={selectedCaseFull.pathologies_secondaires || []}
                        renderItem={(patho, idx) => (
                            <div key={idx} className="flex items-start p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-colors">
                                <Activity className="text-orange-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
                                <div>
                                    <p className="font-bold text-slate-800">{patho.nom_fr || `Pathologie Secondaire #${idx+1}`}</p>
                                    {patho.code_icd10 && (
                                        <p className="text-xs text-slate-500 font-mono mt-1">ICD-10: {patho.code_icd10}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    />
                )}

            </div>
        );
    }

    // ============================================
    // VUE GRILLE (PAR DÉFAUT)
    // ============================================
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
             {/* En-tête Filtres et Recherche */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-[#052648]">Bibliothèque Clinique</h1>
                    <p className="text-slate-600 max-w-2xl">
                        Base de connaissance experte : explorez les cas réels issus de MIMIC-III enrichis.
                    </p>
                </div>
                
                <div className="relative group w-full md:w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-[#052648]" />
                     <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648]"
                     />
                </div>
             </div>

             {/* Onglets Filtres Services */}
             <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <Button onClick={() => setSelectedService('all')} variant={selectedService === 'all' ? "default" : "outline"} className="rounded-full shadow-sm">
                    Tous les cas
                </Button>
                {services.map(s => (
                    <Button key={s.id} onClick={() => setSelectedService(s.id)} variant={selectedService === s.id ? "default" : "outline"} className="rounded-full shadow-sm whitespace-nowrap">
                       <s.icon className="w-3.5 h-3.5 mr-2 opacity-70" /> {s.name}
                    </Button>
                ))}
             </div>

             {/* Grille de cartes */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingList ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) : 
                filteredCases.length > 0 ? filteredCases.map(c => {
                    const feCase = mapBackendToFrontend(c);
                    const serviceInfo = services.find(s => s.name === c.pathologie_principale?.categorie) || services[0];
                    
                    return (
                        <div key={c.id} onClick={() => handleCardClick(c.id)} className="cursor-pointer transition-transform hover:-translate-y-1">
                            <CaseCard useCase={feCase} service={serviceInfo} />
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">Aucun cas ne correspond à vos critères.</p>
                    </div>
                )}
             </div>
        </div>
    );
}