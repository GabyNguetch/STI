// components/expert/disease/DiseaseModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Bug, AlertTriangle, Hash, Globe, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { createDisease, updateDisease } from '@/services/expertService';
import type { BackendDisease, BackendDiseaseCreate } from '@/types/backend';
import { services } from '@/types/simulation/constant'; // Pour récupérer les catégories/services existants

type Mode = 'create' | 'edit';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: Mode;
    initialData?: BackendDisease | null;
    onSuccess: () => void;
}

// Initialisation propre
const INITIAL_STATE: BackendDiseaseCreate = {
    nom_fr: '',
    code_icd10: '',
    categorie: 'Médecine Générale',
    niveau_gravite: 3, // Par défaut "Modéré"
    description: '',
    physiopathologie: '',
    prevalence_cameroun: '',
    nom_local: ''
};

export default function DiseaseModal({ isOpen, onClose, mode, initialData, onSuccess }: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<BackendDiseaseCreate>(INITIAL_STATE);

    // Categories issues des services + 'Autres'
    const categories = Array.from(new Set([...services.map(s => s.name), 'Infectiologie', 'Tropicale', 'Autre']));

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData(initialData); 
        } else {
            setFormData(INITIAL_STATE);
        }
    }, [isOpen, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if(!formData.nom_fr || !formData.code_icd10) {
            return toast.error("Le Nom et le Code CIM-10 sont obligatoires");
        }

        setIsLoading(true);
        try {
            if (mode === 'create') {
                await createDisease(formData);
                toast.success("Pathologie ajoutée au référentiel");
            } else if (initialData?.id) {
                await updateDisease(initialData.id, formData);
                toast.success("Pathologie mise à jour");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error("Erreur opération : " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#052648]/50 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-[#052648] flex items-center gap-2">
                        {mode === 'create' ? <Bug className="text-blue-500"/> : <Save className="text-orange-500"/>}
                        {mode === 'create' ? "Ajouter une Pathologie" : `Éditer : ${initialData?.nom_fr}`}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-slate-200 transition">
                        <X size={20}/>
                    </button>
                </div>

                {/* Form Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-6">
                        
                        {/* IDENTIFICATION */}
                        <section className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-4">Identification CIM-10</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Nom Pathologie (FR)</label>
                                    <input type="text" required value={formData.nom_fr} onChange={e => setFormData({...formData, nom_fr: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="ex: Paludisme Simple"/>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Code CIM-10 (Unique)</label>
                                    <div className="relative">
                                        <Hash size={16} className="absolute left-3 top-3 text-slate-400"/>
                                        <input type="text" required value={formData.code_icd10} onChange={e => setFormData({...formData, code_icd10: e.target.value})} className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono" placeholder="ex: B50.9"/>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Nom Local / Argot</label>
                                    <input type="text" value={formData.nom_local || ''} onChange={e => setFormData({...formData, nom_local: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white" placeholder="ex: Palu"/>
                                </div>
                            </div>
                        </section>

                        {/* CLASSIFICATION */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Catégorie Médicale</label>
                                <select value={formData.categorie || 'Autre'} onChange={e => setFormData({...formData, categorie: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white outline-none">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Niveau de Gravité (1-5)</label>
                                <div className="relative">
                                    <Activity size={16} className="absolute left-3 top-3 text-slate-400"/>
                                    <select value={formData.niveau_gravite || 1} onChange={e => setFormData({...formData, niveau_gravite: Number(e.target.value)})} className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg bg-white outline-none">
                                        <option value={1}>1 - Bénin</option>
                                        <option value={2}>2 - Modéré</option>
                                        <option value={3}>3 - Sérieux</option>
                                        <option value={4}>4 - Grave (Urgence)</option>
                                        <option value={5}>5 - Vital (Critique)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* CONTEXTE & PREVALENCE */}
                        <section className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                             <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-4 flex items-center gap-2"><Globe size={16}/> Contexte local</h3>
                             <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Prévalence au Cameroun</label>
                                <input type="text" value={String(formData.prevalence_cameroun || '')} onChange={e => setFormData({...formData, prevalence_cameroun: e.target.value})} className="w-full p-2.5 border border-emerald-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ex: Endémique en zone forestière, 45% des consultations..."/>
                             </div>
                        </section>

                        {/* DESCRIPTIONS */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Description & Clinique</label>
                                <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm" placeholder="Signes cliniques principaux..."></textarea>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Physiopathologie (Moteur Expert)</label>
                                <textarea rows={3} value={formData.physiopathologie || ''} onChange={e => setFormData({...formData, physiopathologie: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono bg-slate-50" placeholder="Mécanisme explicatif pour le tuteur..."></textarea>
                            </div>
                        </div>

                    </div>
                    {/* Fake Submit pour valider avec entrée */}
                    <button type="submit" className="hidden"></button>
                </form>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Annuler</Button>
                    <Button 
                        onClick={handleSubmit as any} 
                        className={`text-white shadow-lg min-w-[150px] ${mode === 'create' ? 'bg-[#052648] hover:bg-blue-900' : 'bg-orange-500 hover:bg-orange-600'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Enregistrement..." : mode === 'create' ? "Ajouter Pathologie" : "Sauvegarder"}
                    </Button>
                </div>
            </div>
        </div>
    );
}