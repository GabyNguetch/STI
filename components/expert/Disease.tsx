// components/expert/Disease.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bug, Search, Plus, Filter, Activity, 
  MoreVertical, Edit2, Trash2, MapPin, Globe, BookOpen, Layers,
  X, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllDiseases, deleteDisease } from '@/services/expertService';
import type { BackendDisease } from '@/types/backend';
import DiseaseModal from './disease/DiseaseModal'; 
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

// --- STYLES & HELPERS ---
const styles = `
  .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  
  @supports(padding: max(0px)) {
    .safe-area-bottom {
      padding-bottom: max(1rem, env(safe-area-inset-bottom));
    }
  }
`;

// Helper couleur sévérité
const getSeverityBadge = (level?: number) => {
    switch (level) {
        case 1: return { label: 'Bénin', class: 'bg-green-100 text-green-700 border-green-200' };
        case 2: return { label: 'Modéré', class: 'bg-blue-100 text-blue-700 border-blue-200' };
        case 3: return { label: 'Sérieux', class: 'bg-amber-100 text-amber-700 border-amber-200' };
        case 4: return { label: 'Grave', class: 'bg-orange-100 text-orange-700 border-orange-200' };
        case 5: return { label: 'Critique', class: 'bg-red-100 text-red-700 border-red-200' };
        default: return { label: 'Inconnu', class: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
};

export default function DiseaseLibrary() {
    // -- ETATS DONNÉES --
    const [diseases, setDiseases] = useState<BackendDisease[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Selection & UI
    const [selectedDisease, setSelectedDisease] = useState<BackendDisease | null>(null);
    const [contextMenuId, setContextMenuId] = useState<number | null>(null);
    
    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create'|'edit'>('create');

    // -- CHARGEMENT --
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllDiseases();
            setDiseases(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error("Impossible de charger le référentiel pathologies");
        } finally {
            setLoading(false);
        }
    };

    // -- HANDLERS --
    const handleDelete = async (id: number) => {
        if (!confirm("Attention : supprimer une pathologie peut casser les cas cliniques associés. Continuer ?")) return;
        
        const tid = toast.loading("Suppression du registre...");
        try {
            await deleteDisease(id);
            if(selectedDisease?.id === id) setSelectedDisease(null);
            loadData();
            toast.success("Pathologie retirée", {id: tid});
        } catch(e) {
            toast.error("Erreur technique suppression", {id: tid});
        }
    };

    const handleEdit = (d: BackendDisease) => {
        setSelectedDisease(d); 
        setModalMode('edit');
        setShowModal(true);
        setContextMenuId(null);
    };

    const handleCreate = () => {
        setModalMode('create');
        setShowModal(true);
    };

    // -- FILTER --
    const filteredDiseases = useMemo(() => {
        const lowerS = search.toLowerCase();
        return diseases.filter(d => 
            d.nom_fr.toLowerCase().includes(lowerS) || 
            d.code_icd10.toLowerCase().includes(lowerS) ||
            d.categorie?.toLowerCase().includes(lowerS)
        );
    }, [diseases, search]);

    // -- PAGINATION LOGIC --
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const totalPages = Math.ceil(filteredDiseases.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDiseases = filteredDiseases.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden text-slate-800 relative w-full">
            <style>{styles}</style>

            {/* FOND DE CLIC POUR FERMER MENU CONTEXTUEL */}
            {contextMenuId !== null && <div className="fixed inset-0 z-20" onClick={() => setContextMenuId(null)}></div>}

            {/* === COLONNE GAUCHE (LISTE PRINCIPALE) === */}
            <div className={`
                flex flex-col h-full bg-slate-50 w-full transition-all duration-300
                ${selectedDisease ? 'hidden lg:flex lg:flex-1' : 'flex'} 
            `}>
                
                {/* Header Actions - Optimisé mobile */}
                <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex flex-col gap-3 sticky top-0 bg-slate-50 z-10 border-b border-slate-200/50">
                    {/* Titre */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#052648] flex items-center gap-1.5 sm:gap-2">
                                <Bug className="text-red-500 shrink-0 w-5 h-5 sm:w-6 sm:h-6"/> 
                                <span className="truncate">Référentiel Pathologies</span>
                            </h1>
                            <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 line-clamp-1">
                                Gérez les maladies et codes CIM-10.
                            </p>
                        </div>
                        
                        {/* Bouton Add - Mobile compact */}
                        <Button 
                            onClick={handleCreate} 
                            className="bg-[#052648] hover:bg-blue-900 text-white rounded-lg sm:rounded-xl shadow-md flex items-center gap-1 sm:gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 md:px-4 shrink-0"
                        >
                            <Plus size={16} className="sm:w-[18px] sm:h-[18px]"/>
                            <span className="text-xs sm:text-sm font-medium">Ajouter</span>
                        </Button>
                    </div>
                    
                    {/* Barre de recherche */}
                    <div className="relative group w-full">
                        <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                        <input 
                            type="text" 
                            placeholder="Rechercher pathologie, code CIM-10..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648] outline-none shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Table Header Row - Adaptatif */}
                <div className="hidden sm:flex px-3 sm:px-4 md:px-6 lg:px-8 py-2 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider items-center gap-2 md:gap-4 bg-slate-50 shrink-0">
                    <div className="w-[15%] sm:w-[12%] pl-1">Code</div>
                    <div className="flex-1 sm:w-[35%] md:w-[30%]">Pathologie</div>
                    <div className="hidden md:block w-[18%]">Catégorie</div>
                    <div className="w-[18%] md:w-[15%] text-center">Gravité</div>
                    <div className="hidden lg:block w-[15%] text-center">Prévalence</div>
                    <div className="w-6 sm:w-8 ml-auto"></div>
                </div>

                {/* LISTE DÉFILABLE - Optimisée mobile */}
                <div className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-6 lg:px-8 custom-scrollbar space-y-1.5 sm:space-y-2 pt-1 pb-2">
                     {loading ? (
                         [1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-16 sm:h-14 w-full rounded-lg sm:rounded-xl bg-white mb-2"/>)
                     ) : paginatedDiseases.length > 0 ? (
                         paginatedDiseases.map((d) => {
                             const severity = getSeverityBadge(d.niveau_gravite);
                             
                             return (
                                 <div 
                                    key={d.id}
                                    onClick={() => setSelectedDisease(d)}
                                    className={`
                                        flex items-center gap-2 sm:gap-3 md:gap-4 px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 bg-white border rounded-lg sm:rounded-xl cursor-pointer transition-all shadow-sm active:scale-[0.98]
                                        ${selectedDisease?.id === d.id 
                                            ? 'border-l-4 border-l-[#052648] border-y-slate-200 border-r-slate-200 bg-slate-50 ring-1 ring-[#052648]/10' 
                                            : 'border-slate-200 border-l-transparent hover:border-blue-300'
                                        }
                                    `}
                                 >
                                    {/* Code CIM-10 */}
                                    <div className="w-[18%] sm:w-[15%] md:w-[12%] font-mono font-bold text-[#052648] bg-slate-100/80 rounded px-1 sm:px-1.5 py-1 text-[9px] sm:text-[10px] md:text-xs text-center shrink-0">
                                        {d.code_icd10}
                                    </div>
                                    
                                    {/* Nom Pathologie */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate" title={d.nom_fr}>
                                            {d.nom_fr}
                                        </div>
                                        {/* Mobile: infos sous le nom */}
                                        <div className="sm:hidden flex flex-wrap gap-1.5 mt-1">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-bold ${severity.class}`}>
                                                {severity.label}
                                            </span>
                                            {d.categorie && (
                                                <span className="text-[8px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                                                    {d.categorie}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Categorie (Tablette+) */}
                                    <div className="hidden md:flex w-[18%] items-center gap-1.5 min-w-0">
                                        <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0">
                                            <Activity size={12}/>
                                        </span>
                                        <span className="text-xs text-slate-600 truncate">{d.categorie || "Général"}</span>
                                    </div>

                                    {/* Gravité (Tablette+) */}
                                    <div className="hidden sm:flex w-[18%] md:w-[15%] justify-center">
                                        <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border uppercase tracking-wide whitespace-nowrap ${severity.class}`}>
                                            {severity.label}
                                        </span>
                                    </div>

                                    {/* Prévalence (Desktop) */}
                                    <div className="hidden lg:flex w-[15%] justify-center text-xs text-slate-500 truncate px-2">
                                        {d.prevalence_cameroun ? (
                                            <span className="flex items-center gap-1 truncate" title={String(d.prevalence_cameroun)}>
                                                <MapPin size={12} className="shrink-0"/> 
                                                <span className="truncate">{d.prevalence_cameroun}</span>
                                            </span>
                                        ) : <span className="text-slate-300">-</span>}
                                    </div>

                                    {/* Actions */}
                                    <div className="ml-auto w-6 sm:w-8 flex justify-end relative shrink-0">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setContextMenuId(contextMenuId === d.id ? null : d.id); }}
                                            className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
                                         >
                                             <MoreVertical size={14} className="sm:w-4 sm:h-4"/>
                                         </button>
                                         
                                         {/* Menu Contextuel */}
                                         {contextMenuId === d.id && (
                                            <div className="absolute top-8 right-0 w-32 sm:w-36 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 origin-top-right">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-blue-50 flex items-center gap-2">
                                                    <Edit2 size={12} className="sm:w-[14px] sm:h-[14px] text-blue-500"/> Éditer
                                                </button>
                                                <div className="h-px bg-slate-100 my-1"/>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                    <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]"/> Supprimer
                                                </button>
                                            </div>
                                         )}
                                    </div>
                                 </div>
                             );
                         })
                     ) : (
                         <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-400 px-4">
                             <Search size={32} className="sm:w-10 sm:h-10 mb-3 sm:mb-4 opacity-50"/>
                             <p className="text-sm sm:text-base text-center">Aucune pathologie trouvée.</p>
                             {search && (
                                 <button 
                                    onClick={() => setSearch('')}
                                    className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
                                 >
                                    Réinitialiser la recherche
                                 </button>
                             )}
                         </div>
                     )}
                </div>

                {/* PAGINATION - Responsive */}
                {!loading && filteredDiseases.length > itemsPerPage && (
                    <div className="border-t border-slate-200 p-2 sm:p-3 md:p-4 bg-white/50 flex justify-center items-center gap-1 sm:gap-2 shrink-0 z-10 sticky bottom-0">
                        <button 
                            onClick={() => goToPage(1)} 
                            disabled={currentPage === 1}
                            className="p-1.5 sm:p-2 text-slate-500 hover:text-[#052648] hover:bg-slate-100 rounded-md sm:rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            aria-label="Première page"
                        >
                            <ChevronFirst size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button 
                            onClick={() => goToPage(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="p-1.5 sm:p-2 text-slate-500 hover:text-[#052648] hover:bg-slate-100 rounded-md sm:rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            aria-label="Page précédente"
                        >
                            <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        
                        <span className="text-[11px] sm:text-sm text-slate-600 font-medium px-1.5 sm:px-2 min-w-[100px] sm:min-w-[120px] text-center">
                           Page {currentPage} / {totalPages}
                        </span>

                        <button 
                            onClick={() => goToPage(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            className="p-1.5 sm:p-2 text-slate-500 hover:text-[#052648] hover:bg-slate-100 rounded-md sm:rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            aria-label="Page suivante"
                        >
                            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button 
                            onClick={() => goToPage(totalPages)} 
                            disabled={currentPage === totalPages}
                            className="p-1.5 sm:p-2 text-slate-500 hover:text-[#052648] hover:bg-slate-100 rounded-md sm:rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            aria-label="Dernière page"
                        >
                            <ChevronLast size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* === PANEL DETAIL (RESPONSIVE) === */}
            {selectedDisease && (
                <aside className={`
                    fixed inset-0 z-40 bg-white flex flex-col
                    lg:static lg:w-[380px] xl:w-[420px] lg:border-l lg:border-slate-200 lg:shadow-xl
                    animate-in slide-in-from-right duration-300
                `}>
                    
                    {/* Panel Header */}
                    <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 bg-[#052648] text-white shrink-0">
                         <div className="flex justify-between items-start mb-3 sm:mb-4">
                             {/* Bouton retour Mobile */}
                             <button 
                                onClick={() => setSelectedDisease(null)} 
                                className="flex items-center gap-1 text-white/80 hover:text-white lg:hidden transition-colors active:scale-95"
                             >
                                 <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]"/>
                                 <span className="text-xs sm:text-sm font-bold">Retour</span>
                             </button>
                             
                             {/* Badge catégorie Desktop */}
                             <span className="hidden lg:block bg-white/20 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-widest">
                                {selectedDisease.categorie || "GENERAL"}
                             </span>
                             
                             {/* Bouton fermer Desktop */}
                             <button 
                                onClick={() => setSelectedDisease(null)} 
                                className="hidden lg:block text-white/70 hover:text-white transition bg-white/10 hover:bg-white/20 p-1.5 rounded-full active:scale-95"
                                aria-label="Fermer"
                             >
                                <X size={16} />
                             </button>
                         </div>

                         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mt-2 break-words">
                            {selectedDisease.nom_fr}
                         </h2>
                         
                         <div className="flex flex-wrap gap-2 mt-3">
                            {selectedDisease.nom_en && (
                                <span className="text-[10px] sm:text-xs text-blue-200 italic px-2 py-0.5 sm:py-1 bg-blue-900/30 rounded border border-blue-500/30 truncate max-w-full">
                                    En: {selectedDisease.nom_en}
                                </span>
                            )}
                            {selectedDisease.nom_local && (
                                <span className="text-[10px] sm:text-xs text-emerald-300 bg-emerald-900/40 px-2 py-0.5 sm:py-1 rounded-full border border-emerald-500/30 truncate max-w-full">
                                    Loc: {selectedDisease.nom_local}
                                </span>
                            )}
                         </div>
                    </div>

                    {/* Panel Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 custom-scrollbar bg-slate-50/30">
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                             <div className="p-3 sm:p-3.5 md:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm text-center">
                                 <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block mb-1">Code CIM-10</span>
                                 <p className="text-base sm:text-lg md:text-xl font-mono font-bold text-[#052648] break-all">
                                    {selectedDisease.code_icd10}
                                 </p>
                             </div>
                             <div className="p-3 sm:p-3.5 md:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm text-center flex flex-col items-center justify-center">
                                 <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block mb-1">Gravité</span>
                                 {(() => {
                                     const badge = getSeverityBadge(selectedDisease.niveau_gravite);
                                     return (
                                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded font-bold uppercase inline-block ${badge.class}`}>
                                            {badge.label}
                                        </span>
                                     )
                                 })()}
                             </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                             <h3 className="text-xs sm:text-sm font-bold text-[#052648] uppercase mb-2 flex items-center gap-2">
                                <BookOpen size={14} className="sm:w-4 sm:h-4"/> Description
                             </h3>
                             <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                                 {selectedDisease.description || (
                                    <span className="italic text-slate-400">Aucune description disponible.</span>
                                 )}
                             </p>
                        </div>

                        {/* Physiopathologie */}
                        <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                             <h3 className="text-xs sm:text-sm font-bold text-[#052648] uppercase mb-2 flex items-center gap-2">
                                <Layers size={14} className="sm:w-4 sm:h-4"/> Physiopathologie
                             </h3>
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                 <p className="text-[11px] sm:text-xs text-slate-600 font-mono leading-relaxed break-words">
                                     {selectedDisease.physiopathologie || "Donnée manquante pour le moteur expert."}
                                 </p>
                             </div>
                        </div>
                        
                        {/* Contexte Local */}
                        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-orange-100 flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3">
                             <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                                <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className="text-[10px] sm:text-xs font-bold text-orange-800 uppercase mb-1">
                                    Contexte Cameroun
                                 </h4>
                                 <p className="text-[11px] sm:text-xs text-orange-900 leading-relaxed">
                                     {selectedDisease.prevalence_cameroun || "Données épidémiologiques non renseignées pour cette région."}
                                 </p>
                             </div>
                        </div>
                    </div>
                    
                    {/* Panel Footer */}
                    <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex justify-between gap-2 sm:gap-3 shrink-0 safe-area-bottom">
                         <Button 
                            variant="outline" 
                            onClick={() => handleDelete(selectedDisease.id)} 
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-100 px-3 sm:px-4 h-10 sm:h-11"
                         >
                             <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]"/>
                         </Button>
                         <Button 
                            onClick={() => handleEdit(selectedDisease)} 
                            className="flex-1 bg-[#052648] hover:bg-blue-900 text-white font-bold">
                             Modifier la fiche
                         </Button>
                    </div>

                </aside>
            )}

            {/* --- MODAL FORM --- */}
            <DiseaseModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                mode={modalMode}
                initialData={selectedDisease}
                onSuccess={() => { loadData(); if(selectedDisease) setSelectedDisease(null); }} 
            />
            
        </div>
    );
}