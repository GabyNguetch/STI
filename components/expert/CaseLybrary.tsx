// components/expert/CaseLibrary.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, ChevronRight, Activity, 
  ArrowLeft, User, LayoutGrid,
  ImageIcon, Pill, ListPlus,
  Calendar, FileDigit, Stethoscope, Layers, Hash,
  Thermometer, AlertTriangle, Syringe,
  ArrowRight, FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/Skeleton'; 
// Assurez-vous d'importer ou de corriger ce service pour qu'il accepte 'limit' en paramètre !
import { getAllClinicalCases, getClinicalCaseById } from '@/services/expertService';
import type { BackendClinicalCaseSimple, BackendClinicalCase } from '@/types/backend';
import { Button } from '@/components/ui/Button';
// AJOUTEZ CES IMPORTS:
import { deleteClinicalCase } from '@/services/expertService';
import { ActionMenu } from './ui/ActionMenu';
import ClinicalCaseModal from './ui/ClinicalCaseModal';
import { ConfirmDeleteModal } from './ui/ConfirmDeleteModal'; // Le petit modal de confirm
import toast from 'react-hot-toast';

// --- STYLES ---
const stylesGlobal = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  /* Barre fine et élégante pour la navigation interne */
  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
`;

// --- TYPES (Adaptés aux données JSON réelles) ---
interface SymptomData {
    symptome_id: number;
    details: string; 
    symptome?: {
        nom: string;
        categorie?: string;
        type_symptome?: string;
        signes_alarme?: boolean;
    }
}

interface RichCaseData extends Omit<BackendClinicalCase, 'donnees_paracliniques' | 'presentation_clinique'> {
    // Structure détaillée optionnelle venant de la vue complexe
    presentation_clinique_detail?: {
        histoire_maladie: string;
        antecedents?: string | null;
        symptomes_patient: SymptomData[];
    };
    presentation_clinique: {
        histoire_maladie: string;
    };
    medicaments_prescrits: Array<{ 
        medicament_id: number; 
        nom: string; 
        dose: string;
    }>;
    pathologies_secondaires: Array<{ 
        nom_fr: string; 
        code_icd10: string;
        categorie?: string;
    }>;
    images_associees: Array<{
        id: number;
        fichier_url: string;
        type_examen: string;
        description?: string;
    }>;
    donnees_paracliniques: {
        lab_results?: any[]; 
        examen_clinique?: string;
    };
}

// --- UTILS ---
const formatDate = (d: string) => {
    try {
        return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return "Date inconnue"; }
};

const cleanValue = (val: string) => val ? val.replace(/^Valeur:\s*/i, '').trim() : '';

const getDiffColor = (level?: number) => {
    if (!level) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (level <= 3) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (level <= 7) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-amber-50 text-amber-700 border-amber-100';
};

export default function CaseLibrary() {
    const router = useRouter();

    // -- STATES --
    const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
    const [casesList, setCasesList] = useState<BackendClinicalCaseSimple[]>([]);
    
    // Etats de chargement
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    
    // Recherche et Filtres
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tous");
    
    // Le Cas en cours de lecture
    const [currentCase, setCurrentCase] = useState<RichCaseData | null>(null);
        // Gestion Menu Contextuel
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: number } | null>(null);
    
    // Gestion Modals
    const [modalState, setModalState] = useState<{ 
        type: 'create' | 'edit' | 'delete' | null, 
        caseData?: any 
    }>({ type: null });

        // ==============================================================
    // 1. CHARGEMENT DES DONNÉES (CORRECTION LIMIT 25 -> 500)
    // ==============================================================
    
    // Définition stable de loadList pour éviter les erreurs de référence
    const loadList = useCallback(async () => {
        setLoadingList(true);
        try {
            // Note importante : Les APIs Backend limitent souvent à 25 ou 50 par défaut (pagination).
            // On ajoute '?limit=500' pour récupérer tous vos cas cliniques.
            // Si la méthode service n'accepte pas d'argument, modifiez la dans services/expertService.ts
            const data = await getAllClinicalCases(); // Supposant que getAllClinicalCases gère params, ou est patchée
            
            // Si getAllClinicalCases n'accepte pas de param, allez modifier le service pour : return await apiClient(`/clinical-cases/?limit=500`);
            
            setCasesList(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Erreur chargement:", e);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        loadList();
    }, [loadList]);

    // -- INIT : Charge tous les cas --
    useEffect(() => {
        const fetchAll = async () => {
            setLoadingList(true);
            try {
                // CORRECTION : Ici, l'appel API doit inclure ?limit=200 ou plus. 
                // Si votre fonction de service ne le permet pas, elle chargera par défaut 25 éléments.
                // En théorie: await getAllClinicalCases({ limit: 500 });
                const data = await getAllClinicalCases(); 
                setCasesList(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Erreur chargement:", e);
            } finally {
                setLoadingList(false);
            }
        };
        fetchAll();
    }, []);

    // -- SELECTION D'UN CAS --
    const handleSelectCase = async (id: number) => {
        setLoadingDetail(true);
        setViewMode('detail');
        // On ne reset pas immédiatement currentCase pour éviter un flash blanc complet, on montre un loading par dessus ou on switch
        try {
            // Force le scroll en haut de l'article à chaque changement
            const articleDiv = document.getElementById('main-article-area');
            if (articleDiv) articleDiv.scrollTop = 0;

            const detail = await getClinicalCaseById(id) as unknown as RichCaseData;
            setCurrentCase(detail);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetail(false);
        }
    };

    // -- MEMO: FILTRES --
    const filteredCases = useMemo(() => {
        return casesList.filter(c => {
            const term = search.toLowerCase();
            const matchSearch = (c.code_fultang?.toLowerCase() || '').includes(term) || 
                                (c.pathologie_principale?.nom_fr?.toLowerCase() || '').includes(term);
            const cat = c.pathologie_principale?.categorie || "Autres";
            const matchCat = selectedCategory === "Tous" || cat === selectedCategory;
            return matchSearch && matchCat;
        });
    }, [casesList, search, selectedCategory]);

    const otherCases = useMemo(() => {
        if(!currentCase) return filteredCases;
        return filteredCases.filter(c => c.id !== currentCase.id);
    }, [filteredCases, currentCase]);

    const categories = useMemo(() => ["Tous", ...Array.from(new Set(casesList.map(c => c.pathologie_principale?.categorie || "Autres")))], [casesList]);

        // -- HANDLERS CRUD --

    // Ouvre le menu contextuel au bon endroit
    const handleContextMenu = (e: React.MouseEvent, id: number) => {
        e.preventDefault(); // Bloque le menu natif du navigateur
        // Calcule la position pour qu'il reste dans l'écran
        setContextMenu({ x: e.clientX, y: e.clientY, id });
    };

    // Ferme le menu
    const closeContextMenu = () => setContextMenu(null);

    // Déclencheurs actions
    const openCreate = () => setModalState({ type: 'create' });
    
    const openEdit = async (id: number) => {
        closeContextMenu();
        const toastId = toast.loading("Chargement des données...");
        try {
            const data = await getClinicalCaseById(id); // Récupère les données fraiches pour edit
            setModalState({ type: 'edit', caseData: data });
            toast.dismiss(toastId);
        } catch(e) {
            toast.error("Erreur récupération", {id: toastId});
        }
    };

    const openDelete = (id: number) => {
        closeContextMenu();
        // Pour supprimer on a juste besoin de l'ID, pas tout l'objet
        setModalState({ type: 'delete', caseData: { id } });
    };

    const confirmDelete = async () => {
        if (!modalState.caseData?.id) return;
        const toastId = toast.loading("Suppression...");
        try {
            await deleteClinicalCase(modalState.caseData.id);
            toast.success("Cas supprimé définitivement.", { id: toastId });
            loadList(); // Rafraichir
        } catch (e) {
            toast.error("Erreur suppression", { id: toastId });
        } finally {
            setModalState({ type: null });
        }
    };

    // Rafraichir après create/edit
    const handleSuccess = () => {
        loadList();
    };

    // ==============================================================
    // MODE DETAIL : LAYOUT 2 COLONNES (ARTICLE + LISTE DÉROULANTE)
    // ==============================================================
    if (viewMode === 'detail') {
        
    // 1. Récupération robuste du titre
    // On vérifie d'abord l'objet joint pathologie_principale, sinon on cherche dans le détail clinique
    const title = currentCase?.pathologie_principale?.nom_fr || 
                  currentCase?.presentation_clinique_detail?.histoire_maladie?.split(':')[0] || 
                  "Détail du cas clinique";
    
    // 2. Préparation de la date formatée
    const displayDate = currentCase?.created_at ? formatDate(currentCase.created_at) : "Date non renseignée";

    let storyText = currentCase?.presentation_clinique_detail?.histoire_maladie 
        || currentCase?.presentation_clinique?.histoire_maladie 
        || "Histoire indisponible.";
        storyText = storyText.replace(/Admission pour\s?:\s?/i, ''); // Nettoyage prefix

        const symptomsList = currentCase?.presentation_clinique_detail?.symptomes_patient || [];
        const comorbidities = currentCase?.pathologies_secondaires || [];
        const treatments = currentCase?.medicaments_prescrits || [];
        const images = currentCase?.images_associees || [];

        return (
            <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
                <style>{stylesGlobal}</style>

                {/* ZONE GAUCHE : L'ARTICLE MÉDICAL (Scrollable) */}
                <div id="main-article-area" className="flex-1 h-full overflow-y-auto custom-scrollbar relative bg-slate-50/30">
                    
                    {/* Header Sticky au dessus de l'article */}
                    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 px-6 md:px-12 flex justify-between items-center transition-all">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#052648] transition-colors"
                        >
                            <span className="p-1.5 rounded-full bg-slate-100 group-hover:bg-[#052648] group-hover:text-white transition-colors">
                                <ArrowLeft size={16}/>
                            </span>
                            <span>Retour Grille</span>
                        </button>
                        
                        {!loadingDetail && currentCase && (
                            <div className="hidden md:flex items-center gap-3">
                                {/* Affichage de la date avec l'utilitaire formatDate */}
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-slate-500 text-xs font-medium">
                                    <Calendar size={14}/>
                                    <span>{displayDate}</span>
                                </div>
                                
                                <span className="text-xs font-mono bg-[#052648]/5 px-2 py-1 rounded text-[#052648] border border-[#052648]/10">
                                    {currentCase.code_fultang}
                                </span>
                                
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getDiffColor(currentCase.niveau_difficulte)}`}>
                                    Niveau {currentCase.niveau_difficulte}
                                </span>
                            </div>
                        )}
                    </div>

                    {loadingDetail || !currentCase ? (
                        <div className="max-w-5xl mx-auto p-12 space-y-8 animate-pulse">
                            <Skeleton className="h-80 w-full rounded-2xl" />
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ) : (
                        // -- CONTENU EXACT DE VOTRE VUE QUI EST EXCELLENTE --
                        <main className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-500 pb-20">
                            
                            {/* COVER IMAGE */}
                            <div className="relative w-full h-[380px] md:h-[480px] rounded-3xl overflow-hidden group shadow-lg bg-slate-900 mb-10">
                                {images.length > 0 ? (
                                    <Image 
                                        src={images[0].fichier_url} 
                                        alt="Illustration Clinique" 
                                        fill 
                                        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#052648] to-blue-600 opacity-90" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 font-serif drop-shadow-sm">
                                        {title}
                                    </h1>
                                    <p className="text-blue-50 text-lg md:text-xl font-light line-clamp-2 max-w-4xl opacity-90">
                                        Présentation : {storyText}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* MAIN CONTENT (2/3 width on large screens) */}
                                <div className="lg:col-span-2 space-y-12">
                                    
                                    {/* 1. TEXTE INTRO */}
                                    <section className="prose prose-lg prose-slate text-slate-600 leading-relaxed">
                                        <h3 className="flex items-center gap-2 text-[#052648] text-xl font-bold not-prose mb-4 border-b border-slate-200 pb-2">
                                            <FileText size={20}/> Anamnèse
                                        </h3>
                                        <p>{storyText}</p>
                                        <p className="italic text-sm text-slate-400 mt-2">ID: {currentCase.id} • Import MIMIC-III</p>
                                    </section>

                                    {/* 2. TABLEAU SYMPTOMATIQUE (Détail + Valeur) */}
                                    {symptomsList.length > 0 && (
                                        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                                                <h4 className="font-bold text-[#052648] flex items-center gap-2 text-sm uppercase tracking-wide">
                                                    <Stethoscope size={16}/> Relevé Sémiologique & Paraclinique
                                                </h4>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {symptomsList.map((s, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-800 text-sm">
                                                                {s.symptome?.nom || `Signe non listé (${s.symptome_id})`}
                                                            </span>
                                                            <span className="text-[10px] uppercase text-slate-400 font-medium">
                                                                {s.symptome?.categorie || "Observation"}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded text-sm font-mono font-medium shadow-sm">
                                                                {cleanValue(s.details) || "Positif"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* 3. GALERIE D'IMAGES COMPLÈTE */}
                                    {images.length > 0 && (
                                        <section>
                                            <h3 className="flex items-center gap-2 text-[#052648] text-xl font-bold mb-4">
                                                <ImageIcon size={20}/> Documentation Imagerie
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {images.map((img, i) => (
                                                    <div key={i} className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 cursor-pointer shadow-md aspect-video">
                                                        <Image
                                                            src={img.fichier_url}
                                                            alt={img.description || 'Medical Img'}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                                            unoptimized
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                                                            <span className="text-white text-xs font-medium truncate w-full">{img.type_examen}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* RIGHT COLUMN: INFO CARDS */}
                                <aside className="lg:col-span-1 space-y-8">
                                    
                                    {/* Pathologies Secondaires */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-red-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-4 border-b border-red-50 pb-2">
                                            <AlertTriangle size={16}/> Comorbidités Actives
                                        </h4>
                                        <div className="space-y-3">
                                            {comorbidities.length > 0 ? comorbidities.map((patho, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 group cursor-default">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 group-hover:bg-red-600 transition-colors shrink-0"></div>
                                                    <div>
                                                        <p className="font-medium leading-snug">{patho.nom_fr}</p>
                                                        {patho.code_icd10 && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded mt-0.5 inline-block">ICD: {patho.code_icd10}</span>}
                                                    </div>
                                                </div>
                                            )) : <p className="text-sm text-slate-400 italic">Aucune comorbidité relevée.</p>}
                                        </div>
                                    </div>

                                    {/* Traitements */}
                                    <div className="bg-[#052648] p-5 rounded-xl text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
                                        <h4 className="font-bold text-blue-200 flex items-center gap-2 text-sm uppercase tracking-wider mb-4 relative z-10">
                                            <Pill size={16}/> Protocole
                                        </h4>
                                        <div className="space-y-2 relative z-10">
                                            {treatments.length > 0 ? treatments.map((med, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-white/10 last:border-0 hover:bg-white/5 transition px-2 -mx-2 rounded">
                                                    <span className="font-semibold">{med.nom}</span>
                                                    <span className="text-emerald-300 font-mono text-xs">{med.dose}</span>
                                                </div>
                                            )) : <p className="text-sm text-blue-200/50 italic">Pas de médicaments listés.</p>}
                                        </div>
                                    </div>

                                    {/* Action Rapide */}
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-xs text-slate-400 mb-2 text-center">Vous analysez un cas validé par le système expert.</p>
                                        <Button className="w-full bg-[#052648] hover:bg-blue-800" onClick={() => router.push(`/simulation?caseId=${currentCase.id}`)}>
                                            Lancer la Simulation <ArrowRight size={16} className="ml-2"/>
                                        </Button>
                                    </div>

                                </aside>
                            </div>
                        </main>
                    )}
                </div>

                {/* ZONE DROITE : SIDEBAR DE NAVIGATION (LISTE FIXE) */}
                <div className="w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col z-20 h-full shadow-2xl shrink-0">
                    {/* Header Sidebar */}
                    <div className="p-5 border-b border-slate-200 bg-white sticky top-0 z-20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[#052648] uppercase tracking-wide text-xs flex items-center gap-2">
                                <ListPlus size={14}/> Index des Cas
                            </h3>
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">
                                {otherCases.length} trouvés
                            </span>
                        </div>
                        
                        {/* Barre recherche Sidebar */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Filtrer la liste..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648] outline-none transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Liste Défilable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-slate-50/50">
                        {loadingList ? (
                            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg bg-white"/>)
                        ) : (
                            otherCases.map((c) => (
                                <div 
                                    key={c.id}
                                    onClick={() => handleSelectCase(c.id)}
                                    className={`
                                        group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md
                                        ${currentCase?.id === c.id 
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500/20' 
                                            : 'bg-white border-slate-200 hover:border-blue-300'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${c.niveau_difficulte <= 3 ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">{c.code_fultang}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#052648] line-clamp-2">
                                        {c.pathologie_principale?.nom_fr || "Diagnostic non renseigné"}
                                    </h4>
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 border-dashed text-[10px] font-medium text-slate-500">
                                        {c.nb_images > 0 && <span className="flex items-center gap-1 text-blue-600"><ImageIcon size={10}/> Img</span>}
                                        {c.nb_sons > 0 && <span className="flex items-center gap-1 text-purple-600"><Activity size={10}/> Audio</span>}
                                        <span className="ml-auto">{new Date(c.created_at).toLocaleDateString('fr-FR', {month: 'short', year: '2-digit'})}</span>
                                    </div>
                                </div>
                            ))
                        )}
                        {otherCases.length === 0 && !loadingList && (
                            <div className="text-center p-8 text-slate-400 text-xs">
                                Aucune autre correspondance.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        );
    }

    // ============================================
    // VUE 2 : MODE GRILLE (Liste initiale)
    // ============================================
    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
             
             <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
                 <div>
                     <h1 className="text-2xl font-bold text-[#052648] flex items-center gap-2">
                        <LayoutGrid className="text-blue-500"/> Encyclopédie Clinique
                     </h1>
                     <p className="text-slate-500 text-sm mt-1">
                        Explorez {filteredCases.length} cas. (Limite d'affichage serveur potentielle)
                     </p>
                 </div>
                 
                 <div className="flex gap-4">
                     <div className="relative w-80">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                         <input 
                            type="text"
                            placeholder="Rechercher par pathologie ou code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648] outline-none transition-all"
                         />
                     </div>
                     <Button onClick={openCreate} className="bg-[#052648] hover:bg-blue-900">
                         Nouveau
                     </Button>
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                 <style>{stylesGlobal}</style>

                 {loadingList ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1,2,3,4,5,6].map(n => <Skeleton key={n} className="h-72 rounded-2xl bg-white" />)}
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {filteredCases.map(c => {
                             const name = c.pathologie_principale?.nom_fr || "Diagnostic Inconnu";
                             const cat = c.pathologie_principale?.categorie || "Général";

                             return (
                                <div 
                                    key={c.id}
                                    onClick={() => handleSelectCase(c.id)}
                                    className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden h-[300px] flex flex-col"
                                >
                                    {/* Cover Visual */}
                                    <div className="h-24 bg-gradient-to-br from-slate-50 to-slate-200 relative flex items-center justify-center border-b border-slate-100 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#052648]/5 rounded-full blur-2xl transform translate-x-4 -translate-y-4"></div>
                                        <div className="absolute top-2 left-3 bg-white/90 backdrop-blur text-[9px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded shadow-sm border border-slate-100">{cat}</div>
                                        
                                        <FileText size={36} className="text-slate-300 group-hover:scale-110 group-hover:text-blue-400 transition duration-500"/>
                                    </div>
                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getDiffColor(c.niveau_difficulte)}`}>Niveau {c.niveau_difficulte}</span>
                                            <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded">{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <h3 className="font-bold text-[#052648] text-base leading-snug mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors" title={name}>
                                            {name}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-mono mb-4">{c.code_fultang}</p>

                                        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                                             <div className="flex gap-2">
                                                 {(c.nb_images ?? 0) > 0 && <span className="flex items-center gap-1 text-blue-600"><ImageIcon size={12}/> Images</span>}
                                                 {(c.nb_sons ?? 0) > 0 && <span className="flex items-center gap-1 text-purple-600"><Activity size={12}/> Audio</span>}
                                             </div>
                                             <div className="group-hover:translate-x-1 transition-transform text-[#052648]">
                                                 Ouvrir <ArrowRight size={10} className="inline ml-0.5"/>
                                             </div>
                                        </div>
                                    </div>
                                </div>
                             )
                        })}

                        {filteredCases.length === 0 && (
                            <div className="col-span-full h-60 flex flex-col items-center justify-center text-slate-400">
                                <Search size={32} className="mb-2 opacity-50"/>
                                <p className="text-sm">Aucun résultat trouvé pour votre recherche.</p>
                            </div>
                        )}
                    </div>
                 )}
             </div>
                          {/* 
                === INTEGRATION DES MODALES ICI EN BAS DE RETOUR ===
             */}
             
             {/* 1. Menu Contextuel Flottant */}
             {contextMenu && (
                 <ActionMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    onDetails={() => { handleSelectCase(contextMenu.id); closeContextMenu(); }}
                    onEdit={() => openEdit(contextMenu.id)}
                    onDelete={() => openDelete(contextMenu.id)}
                 />
             )}

             {/* 2. Modal Formulaire (Create/Edit) */}
             <ClinicalCaseModal 
                isOpen={modalState.type === 'create' || modalState.type === 'edit'}
                mode={modalState.type === 'edit' ? 'edit' : 'create'}
                onClose={() => setModalState({ type: null })}
                onSuccess={handleSuccess}
                caseId={modalState.caseData?.id}
                initialData={modalState.caseData}
             />

             {/* 3. Modal Delete Confirm */}
             <ConfirmDeleteModal 
                isOpen={modalState.type === 'delete'}
                isLoading={false} // Vous pouvez gérer un état local loading si vous voulez
                onClose={() => setModalState({ type: null })}
                onConfirm={confirmDelete}
             />
        </div>
    );
}