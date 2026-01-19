'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Pill, Search, Plus, Filter, Syringe, Tablets, 
  Info, AlertTriangle, MoreVertical, Edit2, Trash2, 
  MapPin, FlaskConical, Stethoscope, FileText, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllMedications, deleteMedication } from '@/services/expertService';
import type { BackendMedication } from '@/types/backend';
import MedicationModal from './medication/MedicationModal';
import { Button } from '@/components/ui/Button'; // Utilisation cohérente de vos composants UI

// --- CONFIG STYLES ---
const styles = `
  .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
`;

// Helper pour badges de disponibilité
const AvailabilityBadge = ({ status }: { status?: string }) => {
    if (!status || status === 'Disponible') {
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">Disponible</span>;
    }
    if (status.includes('Indisponible') || status.includes('Rupture')) {
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 whitespace-nowrap">Rupture</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 whitespace-nowrap">{status}</span>;
};

export default function DrugLibrary() {
    // États Données
    const [medications, setMedications] = useState<BackendMedication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMed, setSelectedMed] = useState<BackendMedication | null>(null);

    // États UI
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create'|'edit'>('create');
    const [contextMenuId, setContextMenuId] = useState<number | null>(null); 

    // Chargement initial
    useEffect(() => {
        loadMeds();
    }, []);

    const loadMeds = async () => {
        setLoading(true);
        try {
            const data = await getAllMedications();
            setMedications(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error("Erreur de chargement du référentiel");
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleDelete = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce médicament du référentiel ?")) return;
        const tid = toast.loading("Suppression...");
        try {
            await deleteMedication(id);
            if(selectedMed?.id === id) setSelectedMed(null);
            loadMeds();
            toast.success("Médicament supprimé", {id: tid});
        } catch(e) {
            toast.error("Erreur technique", {id: tid});
        }
    };

    const handleEdit = (med: BackendMedication) => {
        setSelectedMed(med);
        setModalMode('edit');
        setShowModal(true);
        setContextMenuId(null);
    };

    // Filtrage
    const filteredMeds = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return medications.filter(m => 
            (m.nom_commercial && m.nom_commercial.toLowerCase().includes(lowerSearch)) || 
            (m.dci && m.dci.toLowerCase().includes(lowerSearch)) ||
            (m.classe_therapeutique && m.classe_therapeutique.toLowerCase().includes(lowerSearch))
        );
    }, [medications, search]);

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden text-slate-800">
            <style>{styles}</style>
            
            {/* Overlay pour fermer le menu contextuel si clic extérieur */}
            {contextMenuId !== null && <div className="fixed inset-0 z-20" onClick={() => setContextMenuId(null)}></div>}

            {/* --- COLONNE PRINCIPALE (TABLEAU) --- */}
            {/* Si un médicament est sélectionné, on réduit la largeur sur grand écran pour laisser place au panel */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedMed ? 'xl:mr-[400px]' : ''}`}>
                
                {/* Header Page */}
                <div className="px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 bg-slate-50 z-10 border-b border-slate-200/50">
                    <div>
                        <h1 className="text-2xl font-bold text-[#052648] flex items-center gap-2">
                            <FlaskConical className="text-blue-600" strokeWidth={2.5}/> Pharmacopée
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">{filteredMeds.length} références disponibles.</p>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4"/>
                            <input 
                                type="text" 
                                placeholder="Rechercher par DCI, Nom ou Classe..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648] outline-none shadow-sm transition-all"
                            />
                        </div>
                        <Button 
                            onClick={() => { setSelectedMed(null); setModalMode('create'); setShowModal(true); }}
                            className="bg-[#052648] hover:bg-blue-900 text-white shadow-md gap-2"
                        >
                            <Plus size={18}/> <span className="hidden md:inline">Ajouter</span>
                        </Button>
                    </div>
                </div>

                {/* Table Header Row (Desktop Only) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                     <div className="col-span-4 pl-2">Médicament</div>
                     <div className="col-span-2">DCI</div>
                     <div className="col-span-2">Classe</div>
                     <div className="col-span-2">Dosage</div>
                     <div className="col-span-2 text-right pr-4">Action</div>
                </div>

                {/* Liste des Médicaments */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 custom-scrollbar pt-2 space-y-2">
                     {loading ? (
                        <div className="space-y-3 p-4">
                            {[1,2,3,4,5].map(i => <div key={i} className="h-16 w-full bg-slate-200 rounded-xl animate-pulse"/>)}
                        </div>
                     ) : filteredMeds.length > 0 ? (
                         filteredMeds.map((med) => {
                             // Déterminer l'icone selon la forme galénique
                             const isInjection = med.forme_galenique?.toLowerCase().includes('inj') || med.forme_galenique?.toLowerCase().includes('vial') || med.forme_galenique?.toLowerCase().includes('syringe');
                             
                             return (
                                 <div 
                                    key={med.id} 
                                    onClick={() => setSelectedMed(med)}
                                    className={`
                                        group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 md:py-3 bg-white rounded-xl border cursor-pointer transition-all shadow-sm
                                        ${selectedMed?.id === med.id ? 'border-blue-500 ring-1 ring-blue-500/20 bg-blue-50/10' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
                                    `}
                                 >
                                     {/* 1. Nom & Icone */}
                                     <div className="col-span-12 md:col-span-4 flex items-center gap-3 overflow-hidden">
                                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isInjection ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {isInjection ? <Syringe size={18}/> : <Tablets size={18}/>}
                                         </div>
                                         <div className="min-w-0">
                                             <p className="font-bold text-[#052648] text-sm truncate" title={med.nom_commercial}>{med.nom_commercial}</p>
                                             {/* Affichage conditionnel mobile : le DCI passe sous le nom en petit */}
                                             <p className="text-[10px] text-slate-500 md:hidden font-mono truncate">{med.dci}</p>
                                         </div>
                                     </div>

                                     {/* 2. DCI (Substance) */}
                                     <div className="hidden md:flex col-span-2 items-center">
                                        <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate" title={med.dci}>
                                            {med.dci}
                                        </span>
                                     </div>

                                     {/* 3. Classe Thérapeutique */}
                                     <div className="col-span-6 md:col-span-2 flex items-center md:items-center">
                                         {med.classe_therapeutique ? (
                                            <span className="text-xs font-semibold text-slate-500 truncate bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                                {med.classe_therapeutique}
                                            </span>
                                         ) : <span className="text-xs text-slate-300">-</span>}
                                     </div>

                                     {/* 4. Dosage */}
                                     <div className="col-span-6 md:col-span-2 flex items-center justify-end md:justify-start">
                                         <span className="text-sm font-medium text-slate-700">{med.dosage || "N/A"}</span>
                                     </div>

                                     {/* 5. Actions */}
                                     <div className="col-span-12 md:col-span-2 flex items-center justify-end relative pt-2 md:pt-0 border-t md:border-0 border-slate-100 mt-2 md:mt-0">
                                         <div className="md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                             <button onClick={(e) => { e.stopPropagation(); handleEdit(med); }} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition">
                                                 <Edit2 size={16}/>
                                             </button>
                                             <button onClick={(e) => { e.stopPropagation(); handleDelete(med.id); }} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition">
                                                 <Trash2 size={16}/>
                                             </button>
                                         </div>
                                         <button className="md:hidden ml-auto" onClick={(e) => {e.stopPropagation(); setContextMenuId(med.id);}}>
                                             <MoreVertical size={16} className="text-slate-400"/>
                                         </button>
                                         
                                          {/* Menu Mobile Only */}
                                          {contextMenuId === med.id && (
                                             <div className="absolute top-8 right-0 z-30 bg-white shadow-xl rounded-lg border border-slate-200 p-1 min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                                                 <button onClick={() => handleEdit(med)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded"><Edit2 size={12}/> Editer</button>
                                                 <button onClick={() => handleDelete(med.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded"><Trash2 size={12}/> Supprimer</button>
                                             </div>
                                          )}
                                     </div>

                                 </div>
                             );
                         })
                     ) : (
                         <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                             <Pill size={48} className="opacity-20 mb-3"/>
                             <p>Aucun médicament trouvé pour cette recherche.</p>
                         </div>
                     )}
                </div>
            </div>

            {/* --- PANEL DÉTAIL --- */}
            {selectedMed && (
                <aside className="fixed top-[80px] right-0 h-[calc(100vh-80px)] w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-40 animate-in slide-in-from-right-10 duration-300">
                    
                    {/* Header Panel */}
                    <div className="p-6 border-b border-slate-100 bg-[#052648] text-white">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm">
                                {selectedMed.classe_therapeutique || 'Non Classé'}
                            </span>
                            <button onClick={() => setSelectedMed(null)} className="text-white/60 hover:text-white transition bg-white/10 p-1 rounded-full">
                                <X size={16}/>
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold leading-tight break-words">{selectedMed.nom_commercial}</h2>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="font-mono text-sm text-blue-200 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/30">
                                 {selectedMed.dci}
                             </span>
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                        
                        {/* Disponibilité & Prix */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                                 <p className="text-[10px] uppercase text-slate-400 font-bold mb-2">État du stock</p>
                                 <AvailabilityBadge status={selectedMed.disponibilite_cameroun} />
                             </div>
                             <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center flex flex-col justify-center">
                                 <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Coût Estimatif</p>
                                 <p className="font-bold text-slate-800 text-lg">
                                     {selectedMed.cout_moyen_fcfa ? selectedMed.cout_moyen_fcfa.toLocaleString() : '-'} 
                                     <span className="text-xs font-normal text-slate-400 ml-1">FCFA</span>
                                 </p>
                             </div>
                        </div>

                        {/* Caractéristiques Techniques */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 font-bold text-xs text-[#052648] uppercase tracking-wide">
                                Spécifications
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                                    <span className="text-slate-500">Dosage</span>
                                    <span className="font-medium text-slate-800">{selectedMed.dosage}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                                    <span className="text-slate-500">Forme Galénique</span>
                                    <span className="font-medium text-slate-800">{selectedMed.forme_galenique || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                                    <span className="text-slate-500">Voie d'administration</span>
                                    <span className="font-medium text-slate-800">{selectedMed.voie_administration || 'Orale'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Prescription</span>
                                    <span className="font-medium text-slate-800">{selectedMed.statut_prescription || 'Libre accès'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Note Clinique */}
                        <div className="space-y-2">
                             <h3 className="font-bold text-sm text-[#052648] flex items-center gap-2">
                                 <Info size={16}/> Informations Cliniques
                             </h3>
                             <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 leading-relaxed text-justify">
                                {selectedMed.precautions_emploi 
                                    ? selectedMed.precautions_emploi 
                                    : <span className="italic text-amber-700/60">Aucune précaution spécifique enregistrée pour ce produit.</span>
                                }
                             </div>
                        </div>

                        {/* Méta-données JSON si existantes */}
                        {/* Affiche si le backend envoie du JSON pour effets secondaires par exemple */}
                        {(selectedMed.effets_secondaires || selectedMed.contre_indications) && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <h4 className="font-bold text-red-700 text-xs uppercase mb-2 flex items-center gap-1"><AlertTriangle size={14}/> Points de Vigilance</h4>
                                <ul className="text-xs text-red-800 list-disc pl-4 space-y-1">
                                    {/* Ceci est un affichage simplifié, ajustez selon le format JSON réel */}
                                    {typeof selectedMed.contre_indications === 'string' && <li>CI: {selectedMed.contre_indications}</li>}
                                    {typeof selectedMed.effets_secondaires === 'string' && <li>EI: {selectedMed.effets_secondaires}</li>}
                                </ul>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 border-t border-slate-200 bg-white flex gap-3">
                         <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(selectedMed.id)}>
                             <Trash2 size={18}/>
                         </Button>
                         <Button className="flex-1 bg-[#052648] hover:bg-blue-900 text-white font-bold shadow-md" onClick={() => handleEdit(selectedMed)}>
                             Modifier la fiche
                         </Button>
                    </div>
                </aside>
            )}

            {/* Modal de Création / Edition */}
            <MedicationModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                mode={modalMode}
                initialData={selectedMed}
                onSuccess={loadMeds}
            />

        </div>
    );
}