// components/expert/Drug.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Pill, Search, Plus, Filter, Syringe, Tablets, 
  Euro, Info, AlertTriangle, MoreVertical, Edit2, Trash2, 
  MapPin, FlaskConical, Stethoscope,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllMedications, deleteMedication, getMedicationById } from '@/services/expertService';
import type { BackendMedication } from '@/types/backend';
import MedicationModal from './medication/MedicationModal';

// --- CONFIG STYLES ---
const styles = `
  .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
`;

export default function DrugLibrary() {
    // États Données
    const [medications, setMedications] = useState<BackendMedication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMed, setSelectedMed] = useState<BackendMedication | null>(null);

    // États UI
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create'|'edit'>('create');
    const [contextMenuId, setContextMenuId] = useState<number | null>(null); // ID pour afficher le menu "3 points"

    // Chargement
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
            toast.error("Impossible de charger les traitements");
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleDelete = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce médicament du référentiel ?")) return;
        
        const tid = toast.loading("Suppression...");
        try {
            await deleteMedication(id);
            if(selectedMed?.id === id) setSelectedMed(null);
            loadMeds();
            toast.success("Supprimé", {id: tid});
        } catch(e) {
            toast.error("Erreur suppression", {id: tid});
        }
    };

    const handleEdit = (med: BackendMedication) => {
        setSelectedMed(med); // Met le détail à jour
        setModalMode('edit');
        setShowModal(true);
        setContextMenuId(null);
    };

    const openDetails = (med: BackendMedication) => {
        setSelectedMed(med);
        // Si besoin de fetch des détails profonds JSON, le faire ici. Pour l'instant, l'objet liste suffit.
    };

    // Filtrage
    const filteredMeds = useMemo(() => {
        return medications.filter(m => 
            m.nom_commercial.toLowerCase().includes(search.toLowerCase()) || 
            m.dci.toLowerCase().includes(search.toLowerCase()) ||
            m.classe_therapeutique.toLowerCase().includes(search.toLowerCase())
        );
    }, [medications, search]);

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden text-slate-800">
            <style>{styles}</style>

            {/* --- COLONNE PRINCIPALE (LISTE & STATS) --- */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedMed ? 'xl:mr-[400px]' : ''}`}>
                
                {/* Header Actions */}
                <div className="px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 bg-slate-50 z-20">
                    <div>
                        <h1 className="text-2xl font-bold text-[#052648] flex items-center gap-2">
                            <FlaskConical className="text-blue-600"/> Pharmacopée
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Gérez le référentiel thérapeutique et les stocks.</p>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4"/>
                            <input 
                                type="text" 
                                placeholder="Chercher DCI, Nom, Classe..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#052648]/20 focus:border-[#052648] outline-none shadow-sm transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => { setModalMode('create'); setShowModal(true); }}
                            className="bg-[#052648] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Plus size={18}/> <span className="hidden md:inline">Ajouter</span>
                        </button>
                    </div>
                </div>

                {/* Table Header (Like Image) */}
                <div className="flex-1 overflow-y-auto px-8 pb-20 custom-scrollbar">
                     <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                         
                         {/* En-tête Tableau */}
                         <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                             <div className="col-span-4 md:col-span-5 pl-2">Médicament / Produit</div>
                             <div className="col-span-3 md:col-span-2">Disponibilité</div>
                             <div className="col-span-3 md:col-span-2">Prix Moyen</div>
                             <div className="col-span-2 md:col-span-3 text-right pr-4">Action</div>
                         </div>

                         {/* Liste */}
                         <div className="divide-y divide-slate-100">
                             {loading ? (
                                <div className="p-12 text-center text-slate-400">Chargement de la pharmacie...</div>
                             ) : filteredMeds.map((med) => (
                                 <div 
                                    key={med.id} 
                                    onClick={() => openDetails(med)}
                                    className={`
                                        grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-colors
                                        ${selectedMed?.id === med.id ? 'bg-blue-50/50 border-l-4 border-blue-500 pl-[20px]' : 'hover:bg-slate-50 border-l-4 border-transparent'}
                                    `}
                                 >
                                     {/* Col 1: Infos Produit */}
                                     <div className="col-span-4 md:col-span-5 flex items-center gap-4 overflow-hidden">
                                         <div className="w-10 h-10 rounded-lg bg-blue-100/50 text-blue-700 flex items-center justify-center shrink-0">
                                            {med.forme_galenique?.toLowerCase().includes('inj') ? <Syringe size={18}/> : <Tablets size={18}/>}
                                         </div>
                                         <div className="min-w-0">
                                             <p className="text-sm font-bold text-[#052648] truncate" title={med.nom_commercial}>{med.nom_commercial}</p>
                                             <p className="text-xs text-slate-500 font-mono truncate">{med.dci} • {med.dosage}</p>
                                         </div>
                                     </div>

                                     {/* Col 2: Stock / Dispo (Badge) */}
                                     <div className="col-span-3 md:col-span-2">
                                         {med.disponibilite_cameroun?.includes('Indisponible') ? (
                                             <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Rupture</span>
                                         ) : med.disponibilite_cameroun?.includes('Rare') ? (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">Faible</span>
                                         ) : (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">En Stock</span>
                                         )}
                                     </div>

                                     {/* Col 3: Prix */}
                                     <div className="col-span-3 md:col-span-2 text-sm font-semibold text-slate-700">
                                         {med.cout_moyen_fcfa ? med.cout_moyen_fcfa.toLocaleString() : '-'} <span className="text-[10px] text-slate-400">FCFA</span>
                                     </div>

                                     {/* Col 4: Actions (Menu) */}
                                     <div className="col-span-2 md:col-span-3 flex justify-end relative">
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setContextMenuId(contextMenuId === med.id ? null : med.id);
                                            }}
                                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-800"
                                         >
                                             <MoreVertical size={16}/>
                                         </button>
                                         
                                         {/* Menu Action Absolu */}
                                         {contextMenuId === med.id && (
                                             <div className="absolute top-8 right-0 bg-white border border-slate-200 shadow-xl rounded-xl w-32 py-1 z-30 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                                                 <button onClick={() => handleEdit(med)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 flex items-center gap-2">
                                                     <Edit2 size={14} className="text-blue-500"/> Modifier
                                                 </button>
                                                 <div className="h-px bg-slate-100 my-1"/>
                                                 <button onClick={() => handleDelete(med.id)} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                     <Trash2 size={14}/> Supprimer
                                                 </button>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             ))}
                             {filteredMeds.length === 0 && !loading && (
                                 <div className="p-8 text-center text-slate-500 text-sm">Aucun médicament trouvé.</div>
                             )}
                         </div>
                     </div>
                </div>
            </div>

            {/* --- PANEL LATÉRAL DETAILS (Sticky Right) --- */}
            {selectedMed && (
                <aside className="fixed top-[80px] right-0 h-[calc(100vh-80px)] w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-40 animate-in slide-in-from-right-10 duration-300">
                    {/* Panel Header */}
                    <div className="p-6 border-b border-slate-100 bg-[#052648] text-white">
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-0.5 bg-white/20 text-[10px] rounded uppercase font-bold tracking-wider">{selectedMed.classe_therapeutique}</span>
                            <button onClick={() => setSelectedMed(null)} className="text-white/60 hover:text-white"><X size={18}/></button>
                        </div>
                        <h2 className="text-2xl font-bold leading-tight">{selectedMed.nom_commercial}</h2>
                        <p className="text-blue-200 text-sm font-mono mt-1 opacity-90">{selectedMed.dci}</p>
                    </div>

                    {/* Panel Content Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                        
                        {/* Status Card */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                 <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Prescription</p>
                                 <p className="font-semibold text-slate-800 text-sm flex items-center gap-1"><FileText size={14} className="text-purple-500"/> {selectedMed.statut_prescription || 'Libre'}</p>
                             </div>
                             <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                 <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Cameroun</p>
                                 <p className="font-semibold text-slate-800 text-sm flex items-center gap-1"><MapPin size={14} className="text-green-600"/> {selectedMed.disponibilite_cameroun || 'N/A'}</p>
                             </div>
                        </div>

                        {/* Specs */}
                        <div>
                             <h4 className="text-xs font-bold text-[#052648] uppercase tracking-wide mb-3 flex items-center gap-2"><Filter size={14}/> Caractéristiques</h4>
                             <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
                                 <div className="flex justify-between p-3">
                                     <span className="text-slate-500">Dosage</span>
                                     <span className="font-medium">{selectedMed.dosage}</span>
                                 </div>
                                 <div className="flex justify-between p-3">
                                     <span className="text-slate-500">Forme</span>
                                     <span className="font-medium">{selectedMed.forme_galenique}</span>
                                 </div>
                                 <div className="flex justify-between p-3">
                                     <span className="text-slate-500">Voie d'admin</span>
                                     <span className="font-medium">{selectedMed.voie_administration}</span>
                                 </div>
                                  <div className="flex justify-between p-3">
                                     <span className="text-slate-500">Coût estimatif</span>
                                     <span className="font-medium text-emerald-700">{selectedMed.cout_moyen_fcfa?.toLocaleString() || '-'} FCFA</span>
                                 </div>
                             </div>
                        </div>

                        {/* Text Infos */}
                        <div>
                             <h4 className="text-xs font-bold text-[#052648] uppercase tracking-wide mb-3 flex items-center gap-2"><Info size={14}/> Indications & Précautions</h4>
                             <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-slate-700 border border-blue-100 leading-relaxed">
                                {typeof selectedMed.precautions_emploi === 'string' && selectedMed.precautions_emploi ? selectedMed.precautions_emploi : <em className="text-slate-400">Aucune précaution spécifique renseignée.</em>}
                             </div>
                        </div>
                        
                        {/* Example Indications Tag */}
                        {selectedMed.indications && (
                            <div>
                                <h4 className="text-xs font-bold text-[#052648] uppercase tracking-wide mb-3 flex items-center gap-2"><Stethoscope size={14}/> Indications</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium">Traitement général</span>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions Panel */}
                    <div className="p-4 border-t border-slate-200 bg-white flex justify-between gap-3">
                        <button onClick={() => handleDelete(selectedMed.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition">
                            <Trash2 size={18}/>
                        </button>
                        <button onClick={() => handleEdit(selectedMed)} className="flex-1 bg-[#052648] text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-900 transition py-3">
                            Modifier la fiche
                        </button>
                    </div>
                </aside>
            )}

            {/* FOND DE CLIC POUR FERMER LE MENU CONTEXTUEL SI OUVERT */}
            {contextMenuId !== null && (
                <div className="fixed inset-0 z-10" onClick={() => setContextMenuId(null)}></div>
            )}

            {/* --- MODAL --- */}
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

// Icon X (close) non importée plus haut mais nécessaire
const X = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);