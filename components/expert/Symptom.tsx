'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, AlertTriangle, Search, Plus, Trash2, Edit2, 
  HelpCircle, Thermometer, Brain, Stethoscope, ChevronRight, X, Pill, Link2, ListPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { 
    getAllSymptoms, getDiseasesForSymptom, getTreatmentsForSymptom, deleteSymptom 
} from '@/services/expertService';
import { BackendSymptom, DiseaseForSymptom, TreatmentForSymptom } from '@/types/backend';
// Assure-toi que le chemin d'import est correct par rapport à ton architecture de dossiers
import SymptomManagerModal, { ManagerMode } from './SymptomModal';


// Couleurs thématiques par catégorie pour l'UI
const CATEGORY_COLORS: Record<string, string> = {
    'Signe Vital': 'bg-blue-100 text-blue-700 border-blue-200',
    'Douleur': 'bg-red-50 text-red-700 border-red-100',
    'Respiratoire': 'bg-cyan-50 text-cyan-700 border-cyan-100',
    'Digestif': 'bg-orange-50 text-orange-700 border-orange-100',
    'Neurologique': 'bg-purple-50 text-purple-700 border-purple-100',
    'Autre': 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function SymptomLibrary() {
    // --- ÉTATS ---
    const [symptoms, setSymptoms] = useState<BackendSymptom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // États pour le Panel Latéral (Détails)
    const [selectedSymptom, setSelectedSymptom] = useState<BackendSymptom | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [relatedDiseases, setRelatedDiseases] = useState<DiseaseForSymptom[]>([]);
    const [symptomaticTreatments, setSymptomaticTreatments] = useState<TreatmentForSymptom[]>([]);

    // Filtres
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("Tous");

    // État pour la Modale Manager
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
            toast.error("Impossible de charger les symptômes");
        } finally {
            setIsLoading(false);
        }
    };

    // Charger les détails relationnels quand un symptôme est cliqué
    const handleSymptomClick = async (sym: BackendSymptom) => {
        setSelectedSymptom(sym);
        setDetailLoading(true);
        // Reset des datas relationnelles pour effet visuel clean
        setRelatedDiseases([]);
        setSymptomaticTreatments([]);

        try {
            // Appels parallèles pour vitesse optimale
            const [diseases, treatments] = await Promise.all([
                getDiseasesForSymptom(sym.id),
                getTreatmentsForSymptom(sym.id)
            ]);
            setRelatedDiseases(diseases || []);
            setSymptomaticTreatments(treatments || []);
        } catch (e) {
            console.error("Erreur détails relations", e);
            // On ne toast pas forcément ici, pour ne pas spammer si une relation est vide/404
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); 
        // Ici on utilise la modale 'delete' plutôt que le confirm natif js pour la cohérence UI, 
        // ou on appelle directement l'API comme dans ton code initial, au choix.
        // Je réimplémente ici la logique API directe si c'était ton choix initial,
        // mais via 'openManager' c'est plus joli. 
        // Je vais rediriger vers openManager('delete')
        const sym = symptoms.find(s => s.id === id);
        if(sym) openManager('delete', sym);
    };

    // --- FILTRAGE & MEMO ---
    const categories = useMemo(() => ["Tous", ...Array.from(new Set(symptoms.map(s => s.categorie || "Autre")))], [symptoms]);
    
    const filteredSymptoms = useMemo(() => {
        return symptoms.filter(s => {
            const matchSearch = s.nom.toLowerCase().includes(search.toLowerCase()) || 
                              s.description?.toLowerCase().includes(search.toLowerCase());
            const matchCat = filterCategory === "Tous" || (s.categorie || "Autre") === filterCategory;
            return matchSearch && matchCat;
        });
    }, [symptoms, search, filterCategory]);

    // --- RENDER HELPERS ---
    const getBadgeStyle = (cat?: string) => CATEGORY_COLORS[cat || ''] || CATEGORY_COLORS['Autre'];

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 relative">
            
            {/* 1. SECTION PRINCIPALE (LISTE) */}
            <div className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${selectedSymptom ? 'w-2/3' : 'w-full'}`}>
                
                {/* Header : Titre + Filtres */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#052648] flex items-center gap-2">
                            <Activity className="text-blue-500" /> Séméiologie & Symptômes
                        </h2>
                        <p className="text-slate-500 text-sm">{filteredSymptoms.length} éléments répertoriés</p>
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

                {/* Barre de Catégories (Chips) */}
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

                {/* Liste Scrolable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-slate-400">Chargement du lexique...</div>
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
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold ${selectedSymptom?.id === sym.id ? 'text-blue-800' : 'text-slate-800'}`}>
                                                {sym.nom}
                                            </h3>
                                            {sym.nom_local && (
                                                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                                    aka "{sym.nom_local}"
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBadgeStyle(sym.categorie)}`}>
                                                {sym.categorie || "Général"}
                                            </span>
                                            {sym.type_symptome && <span className="text-xs text-slate-400">• {sym.type_symptome}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button  onClick={(e) => { e.stopPropagation(); openManager('edit', sym); }}  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                        <Edit2 size={16}/>
                                    </button>
                                    <button onClick={(e) => handleDelete(sym.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                        <Trash2 size={16}/>
                                    </button>
                                    <ChevronRight size={20} className="text-slate-300"/>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2. SIDEBAR DE DÉTAIL FIXE (Affichee si un item est selectionné) */}
            {selectedSymptom && (
                <div className="w-[400px] xl:w-[450px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right-10 duration-300">
                    
                    {/* Toolbar de fermeture */}
                    <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/80 backdrop-blur-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Détail Fiche</span>
                        <button onClick={() => setSelectedSymptom(null)} className="text-slate-400 hover:text-slate-800 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Contenu Défilable */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        
                        {/* En-tête Symptome */}
                        <div className="mb-6">
                             <div className="flex justify-between items-start">
                                <h1 className="text-2xl font-bold text-[#052648] leading-tight mb-2">
                                    {selectedSymptom.nom}
                                </h1>
                                {selectedSymptom.signes_alarme && (
                                    <div className="flex flex-col items-center justify-center p-2 bg-red-50 border border-red-100 rounded-lg text-red-600 shrink-0 animate-pulse">
                                        <AlertTriangle size={24}/>
                                        <span className="text-[10px] font-bold uppercase mt-1">Alarme</span>
                                    </div>
                                )}
                             </div>
                             
                             <div className="prose prose-sm text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-50 leading-relaxed">
                                {selectedSymptom.description || "Aucune description clinique fournie."}
                             </div>
                        </div>

                        {/* Bloc 1: Anamnèse */}
                        <div className="mb-8">
                             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3 border-b pb-2">
                                 <HelpCircle className="text-teal-500" size={16}/> Guide d'Anamnèse (IA)
                             </h3>
                             <div className="space-y-2">
                                {selectedSymptom.questions_anamnese && Object.keys(selectedSymptom.questions_anamnese).length > 0 ? (
                                    // Affichage des clés-valeurs si c'est un objet, ou simple liste
                                    Object.entries(selectedSymptom.questions_anamnese).map(([key, val], idx) => (
                                        <div key={idx} className="flex gap-3 text-sm group">
                                            <span className="font-bold text-teal-700 min-w-[20px]">Q{idx+1}.</span>
                                            <span className="text-slate-700">{String(val || key)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-slate-400 text-xs italic">Aucune question type définie pour le système expert.</span>
                                )}
                             </div>
                        </div>

                        {/* Bloc 2: Diagnostic Différentiel (Lié aux Maladies) */}
                        <div className="mb-8">
                             <div className="flex items-center justify-between mb-3 border-b pb-2">
                                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                     <Brain className="text-indigo-500" size={16}/> Évocateur de
                                 </h3>
                                 <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{relatedDiseases.length}</span>
                             </div>
                             
                             {detailLoading ? (
                                 <div className="space-y-2 animate-pulse">
                                     <div className="h-8 bg-slate-100 rounded w-full"/>
                                     <div className="h-8 bg-slate-100 rounded w-2/3"/>
                                 </div>
                             ) : (
                                 <div className="space-y-2">
                                     {relatedDiseases.length > 0 ? relatedDiseases.map((dis, idx) => (
                                         <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 hover:bg-indigo-100 border border-transparent hover:border-indigo-200 transition-colors">
                                             <div className="flex items-center gap-2 overflow-hidden">
                                                <Link2 size={12} className="text-indigo-400"/>
                                                <span className="text-sm font-semibold text-slate-700 truncate" title={`ID Patho: ${dis.pathologie_id}`}>
                                                    Maladie #{dis.pathologie_id}
                                                </span>
                                             </div>
                                             {/* Badge Probabilité */}
                                             <span className="text-xs font-mono bg-white text-indigo-600 px-2 py-0.5 rounded shadow-sm border border-indigo-100">
                                                {dis.probabilite ? Number(dis.probabilite).toLocaleString(undefined,{style:'percent'}) : '?'}
                                             </span>
                                         </div>
                                     )) : (
                                         <p className="text-xs text-slate-400 italic">Ce symptôme n'est lié à aucune pathologie spécifique dans la base.</p>
                                     )}
                                 </div>
                             )}
                        </div>

                         {/* Bloc 3: Traitement Symptomatique */}
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
                                                <span className="font-bold text-slate-800 text-sm">Médicament #{treat.medicament_id}</span>
                                                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Rang {treat.rang_preference}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">Efficacité attendue: {treat.efficacite || "Standard"}</p>
                                        </div>
                                    )) : (
                                        <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
                                            <Stethoscope className="mx-auto text-slate-300 mb-1" size={24} />
                                            <p className="text-xs text-slate-400">Aucun traitement symptomatique défini.</p>
                                            <Button variant="link" className="text-xs h-auto p-0 mt-1">Ajouter un lien</Button>
                                        </div>
                                    )}
                                </div>
                             )}
                             
                             <button onClick={() => selectedSymptom && openManager('add_treatment', selectedSymptom)} className="w-full mt-3 text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition">
                                 <Plus size={14}/> Ajouter un Traitement
                             </button>
                         </div>

                    </div>
                    
                    {/* Footer Actions */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                        <Button variant="outline" className="text-xs border-slate-300" onClick={() => openManager('edit', selectedSymptom)}>
                             Modifier Métadonnées
                        </Button>
                        <Button className="text-xs bg-[#052648] hover:bg-blue-800 text-white shadow-lg">
                             Analyse IA
                        </Button>
                    </div>
                </div>
            )}

            {/* --- LA MODALE EST APPELÉE ICI EN DEHORS DE LA BOUCLE --- */}
            <SymptomManagerModal 
                isOpen={managerConfig.isOpen}
                onClose={() => setManagerConfig({...managerConfig, isOpen: false})}
                mode={managerConfig.mode}
                initialData={managerConfig.data}
                onSuccess={() => {
                    loadData(); // Rafraîchir la liste complète des symptômes
                    
                    // CORRECTION: Syntaxe JS correcte ici
                    if(selectedSymptom && managerConfig.mode === 'edit') {
                        // Si le symptôme sélectionné a été modifié, on recharge ses données et relations
                        handleSymptomClick(selectedSymptom);
                    }
                    if(selectedSymptom && managerConfig.mode === 'add_treatment') {
                        // Si on a ajouté un traitement au symptôme courant, on recharge ses relations
                        handleSymptomClick(selectedSymptom); 
                    }
                    if(managerConfig.mode === 'delete' && selectedSymptom?.id === managerConfig.data?.id) {
                        setSelectedSymptom(null); // Si l'élément ouvert est supprimé, on ferme le volet détail
                    }
                }}
            />
        </div>
    );
}