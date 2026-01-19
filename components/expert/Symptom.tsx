'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, AlertTriangle, Search, Plus, Trash2, Edit2, 
  HelpCircle, Thermometer, Brain, Stethoscope, ChevronRight, X, Pill, Link2, ListPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { 
    getAllSymptoms, getDiseasesForSymptom, getTreatmentsForSymptom
} from '@/services/expertService';
// Import correct des types mis à jour
import { BackendSymptom, DiseaseForSymptom, TreatmentForSymptom } from '@/types/backend';
import SymptomManagerModal, { ManagerMode } from './SymptomModal';


const CATEGORY_COLORS: Record<string, string> = {
    'Signe Vital': 'bg-blue-100 text-blue-700 border-blue-200',
    'Douleur': 'bg-red-50 text-red-700 border-red-100',
    'Respiratoire': 'bg-cyan-50 text-cyan-700 border-cyan-100',
    'Digestif': 'bg-orange-50 text-orange-700 border-orange-100',
    'Neurologique': 'bg-purple-50 text-purple-700 border-purple-100',
    'Autre': 'bg-slate-100 text-slate-700 border-slate-200',
};

// Utilitaire de formatage %
const formatProb = (val: string | number) => {
    const num = Number(val);
    return isNaN(num) ? '?' : `${Math.round(num * 100)}%`;
};

export default function SymptomLibrary() {
    // --- ÉTATS ---
    const [symptoms, setSymptoms] = useState<BackendSymptom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Panel Latéral
    const [selectedSymptom, setSelectedSymptom] = useState<BackendSymptom | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [relatedDiseases, setRelatedDiseases] = useState<DiseaseForSymptom[]>([]);
    const [symptomaticTreatments, setSymptomaticTreatments] = useState<TreatmentForSymptom[]>([]);

    // Filtres
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("Tous");

    // Modale Manager
    const [managerConfig, setManagerConfig] = useState<{isOpen: boolean, mode: ManagerMode, data: BackendSymptom | null}>({
        isOpen: false,
        mode: 'create',
        data: null
    });

    const openManager = (mode: ManagerMode, data: BackendSymptom | null = null) => {
        setManagerConfig({ isOpen: true, mode, data });
    };

    // --- CHARGEMENT ---
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getAllSymptoms();
            setSymptoms(data);
        } catch (e) {
            toast.error("Erreur chargement symptômes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSymptomClick = async (sym: BackendSymptom) => {
        setSelectedSymptom(sym);
        setDetailLoading(true);
        setRelatedDiseases([]);
        setSymptomaticTreatments([]);

        try {
            // Requêtes parallèles
            const [diseases, treatments] = await Promise.all([
                getDiseasesForSymptom(sym.id),
                getTreatmentsForSymptom(sym.id)
            ]);
            
            // Pas de transformation complexe ici, on passe les données brutes typées
            setRelatedDiseases(diseases || []);
            setSymptomaticTreatments(treatments || []);

        } catch (e) {
            console.error("Erreur détails:", e);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); 
        const sym = symptoms.find(s => s.id === id);
        if(sym) openManager('delete', sym);
    };

    // --- FILTRAGE ---
    const categories = useMemo(() => ["Tous", ...Array.from(new Set(symptoms.map(s => s.categorie || "Autre")))], [symptoms]);
    
    const filteredSymptoms = useMemo(() => {
        return symptoms.filter(s => {
            const matchSearch = s.nom.toLowerCase().includes(search.toLowerCase()) || 
                              s.description?.toLowerCase().includes(search.toLowerCase());
            const matchCat = filterCategory === "Tous" || (s.categorie || "Autre") === filterCategory;
            return matchSearch && matchCat;
        });
    }, [symptoms, search, filterCategory]);

    const getBadgeStyle = (cat?: string) => CATEGORY_COLORS[cat || ''] || CATEGORY_COLORS['Autre'];

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 relative">
            
            {/* 1. LISTE GAUCHE (Inchangée visuellement) */}
            <div className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${selectedSymptom ? 'w-2/3' : 'w-full'}`}>
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#052648] flex items-center gap-2">
                            <Activity className="text-blue-500" /> Séméiologie & Symptômes
                        </h2>
                        <p className="text-slate-500 text-sm">{filteredSymptoms.length} éléments</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                         <div className="relative group flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input 
                                type="text" placeholder="Rechercher..." 
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                         </div>
                         <Button onClick={() => openManager('create')} className="bg-[#052648] text-white">
                             <Plus size={16} className="mr-2"/> Nouveau
                         </Button>
                    </div>
                </div>

                {/* Filtres Catégories */}
                <div className="px-5 py-3 border-b border-slate-50 flex gap-2 overflow-x-auto scrollbar-hide">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                filterCategory === cat 
                                ? 'bg-[#052648] text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ScrollView Liste */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-slate-400">Chargement...</div>
                    ) : (
                        filteredSymptoms.map((sym) => (
                            <div 
                                key={sym.id} 
                                onClick={() => handleSymptomClick(sym)}
                                className={`
                                    group flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer transition-all duration-200
                                    ${selectedSymptom?.id === sym.id 
                                        ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20 bg-blue-50/10' 
                                        : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                        ${sym.signes_alarme ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        {sym.signes_alarme ? <AlertTriangle size={20}/> : <Thermometer size={20}/>}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${selectedSymptom?.id === sym.id ? 'text-blue-800' : 'text-slate-800'}`}>
                                            {sym.nom}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBadgeStyle(sym.categorie)}`}>
                                                {sym.categorie || "Général"}
                                            </span>
                                            {sym.type_symptome && <span className="text-xs text-slate-400">• {sym.type_symptome}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={20} className="text-slate-300"/>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2. SIDEBAR DETAIL FIXE */}
            {selectedSymptom && (
                <div className="w-[400px] xl:w-[450px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right-10 duration-300">
                    
                    {/* Toolbar */}
                    <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/80 backdrop-blur-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Détail Fiche</span>
                        <button onClick={() => setSelectedSymptom(null)} className="text-slate-400 hover:text-slate-800 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {/* En-tête */}
                        <div className="mb-6">
                             <div className="flex justify-between items-start">
                                <h1 className="text-2xl font-bold text-[#052648] leading-tight mb-2">
                                    {selectedSymptom.nom}
                                </h1>
                                {selectedSymptom.signes_alarme && (
                                    <div className="flex flex-col items-center justify-center p-2 bg-red-50 border border-red-100 rounded-lg text-red-600 shrink-0">
                                        <AlertTriangle size={24}/>
                                        <span className="text-[9px] font-bold uppercase mt-1">Alarme</span>
                                    </div>
                                )}
                             </div>
                             
                             <div className="prose prose-sm text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-50 leading-relaxed mt-2">
                                {selectedSymptom.description || "Aucune description clinique."}
                             </div>
                        </div>

                        {/* Relations Maladies */}
                        <div className="mb-8">
                             <div className="flex items-center justify-between mb-3 border-b pb-2">
                                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                     <Brain className="text-indigo-500" size={16}/> Évocateur de
                                 </h3>
                                 <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                     {relatedDiseases.length}
                                 </span>
                             </div>
                             
                             {detailLoading ? (
                                 <div className="space-y-2 animate-pulse">
                                     <div className="h-8 bg-slate-100 rounded w-full"/>
                                     <div className="h-8 bg-slate-100 rounded w-2/3"/>
                                 </div>
                             ) : (
                                 <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                     {relatedDiseases.length > 0 ? relatedDiseases.map((rel, idx) => (
                                         <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/30 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors">
                                             <div className="flex items-center gap-2 min-w-0">
                                                <Link2 size={12} className="text-indigo-400 shrink-0"/>
                                                <div className="flex flex-col min-w-0">
                                                    {/* ACCES CORRECT : rel.pathologie.nom_fr */}
                                                    <span className="text-sm font-semibold text-slate-800 truncate" title={rel.pathologie?.nom_fr}>
                                                        {rel.pathologie?.nom_fr || "Pathologie Inconnue"}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-mono">
                                                        CIM-10: {rel.pathologie?.code_icd10 || "?"}
                                                    </span>
                                                </div>
                                             </div>
                                             <span className={`text-xs font-bold px-2 py-1 rounded ${Number(rel.probabilite) > 0.5 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {formatProb(rel.probabilite)}
                                             </span>
                                         </div>
                                     )) : (
                                         <p className="text-xs text-slate-400 italic">Aucune association trouvée.</p>
                                     )}
                                 </div>
                             )}
                        </div>

                         {/* Traitements */}
                         <div className="mb-6">
                             <div className="flex items-center justify-between mb-3 border-b pb-2">
                                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                     <Pill className="text-emerald-500" size={16}/> Traitement Symptomatique
                                 </h3>
                             </div>

                             {detailLoading ? (
                                <div className="h-12 bg-slate-100 rounded w-full animate-pulse"/>
                             ) : (
                                <div className="space-y-3">
                                    {symptomaticTreatments.length > 0 ? symptomaticTreatments.map((treat, idx) => (
                                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {treat.medicament_nom || `Médicament #${treat.medicament_id}`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">Efficacité: {treat.efficacite || "Non spécifiée"}</p>
                                        </div>
                                    )) : (
                                        <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
                                            <Stethoscope className="mx-auto text-slate-300 mb-1" size={24} />
                                            <p className="text-xs text-slate-400">Aucun traitement direct associé.</p>
                                        </div>
                                    )}
                                </div>
                             )}
                         </div>

                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
                         <Button variant="destructive" onClick={(e: any) => handleDelete(selectedSymptom.id, e)} className="text-xs">
                             <Trash2 size={16}/>
                         </Button>
                         <div className="flex gap-2">
                            <Button variant="outline" className="text-xs" onClick={() => openManager('edit', selectedSymptom)}>
                                 Modifier
                            </Button>
                            <Button className="text-xs bg-[#052648] hover:bg-blue-800">
                                 + Traitement
                            </Button>
                         </div>
                    </div>
                </div>
            )}

            {/* Modale Manager inchangée, elle est réutilisée telle quelle */}
            <SymptomManagerModal 
                isOpen={managerConfig.isOpen}
                onClose={() => setManagerConfig({...managerConfig, isOpen: false})}
                mode={managerConfig.mode}
                initialData={managerConfig.data}
                onSuccess={() => {
                    loadData();
                    if(selectedSymptom && managerConfig.mode !== 'delete') handleSymptomClick(selectedSymptom);
                    if(managerConfig.mode === 'delete') setSelectedSymptom(null);
                }}
            />
        </div>
    );
}