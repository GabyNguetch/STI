// components/expert/medication/MedicationModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Pill, Syringe, Banknote, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { createMedication, updateMedication } from '@/services/expertService';
import type { BackendMedication, BackendMedicationCreate } from '@/types/backend';

type Mode = 'create' | 'edit';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: Mode;
    initialData?: BackendMedication | null;
    onSuccess: () => void;
}

const INITIAL_STATE: BackendMedicationCreate = {
    dci: '', nom_commercial: '', classe_therapeutique: 'Antibiotique', 
    forme_galenique: 'Comprimé', dosage: '', voie_administration: 'Orale',
    cout_moyen_fcfa: 0, disponibilite_cameroun: 'Disponible',
    statut_prescription: 'List I',
    precautions_emploi: '', mecanisme_action: ''
    // JSON fields laissés vides pour simplification
};

export default function MedicationModal({ isOpen, onClose, mode, initialData, onSuccess }: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<BackendMedicationCreate>(INITIAL_STATE);

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData(initialData); // Cast implicite
        } else {
            setFormData(INITIAL_STATE);
        }
    }, [isOpen, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (mode === 'create') {
                await createMedication(formData);
                toast.success("Médicament ajouté !");
            } else if (initialData?.id) {
                await updateMedication(initialData.id, formData);
                toast.success("Médicament mis à jour !");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#052648]/40 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-[#052648] flex items-center gap-2">
                        {mode === 'create' ? <Pill className="text-blue-500"/> : <Save className="text-orange-500"/>}
                        {mode === 'create' ? "Ajouter au Livret Thérapeutique" : `Éditer : ${initialData?.nom_commercial}`}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-slate-200 transition">
                        <X size={20}/>
                    </button>
                </div>

                {/* Form Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-6">
                        
                        {/* IDENTITÉ */}
                        <section className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 uppercase mb-4">Identité du produit</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">DCI (Substance)</label>
                                    <input type="text" required value={formData.dci} onChange={e => setFormData({...formData, dci: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="ex: Paracétamol"/>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Nom Commercial</label>
                                    <input type="text" value={formData.nom_commercial} onChange={e => setFormData({...formData, nom_commercial: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="ex: Doliprane"/>
                                </div>
                            </div>
                        </section>

                        {/* CARACTÉRISTIQUES */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Classe Thérapeutique</label>
                                <select value={formData.classe_therapeutique} onChange={e => setFormData({...formData, classe_therapeutique: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white outline-none">
                                    <option>Antibiotique</option>
                                    <option>Antalgique</option>
                                    <option>Cardiologie</option>
                                    <option>Psychiatrie</option>
                                    <option>Anti-inflammatoire</option>
                                    <option>Autre</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Voie d'administration</label>
                                <div className="relative">
                                    <Syringe size={16} className="absolute left-3 top-3 text-slate-400"/>
                                    <select value={formData.voie_administration} onChange={e => setFormData({...formData, voie_administration: e.target.value})} className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg bg-white outline-none">
                                        <option>Orale</option>
                                        <option>Intraveineuse (IV)</option>
                                        <option>Intramusculaire (IM)</option>
                                        <option>Cutanée</option>
                                        <option>Inhalée</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Forme Galénique</label>
                                <input type="text" value={formData.forme_galenique} onChange={e => setFormData({...formData, forme_galenique: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="Comprimé, Sirop..."/>
                            </div>
                             <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Dosage</label>
                                <input type="text" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="500mg"/>
                            </div>
                        </div>

                        {/* ÉCONOMIE */}
                        <section className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                             <h3 className="text-sm font-bold text-emerald-800 uppercase mb-4 flex items-center gap-2"><Banknote size={16}/> Données Locales</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Coût Moyen (FCFA)</label>
                                    <input type="number" value={formData.cout_moyen_fcfa} onChange={e => setFormData({...formData, cout_moyen_fcfa: parseInt(e.target.value)})} className="w-full p-2 border border-emerald-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0"/>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Disponibilité Cameroun</label>
                                    <select value={formData.disponibilite_cameroun} onChange={e => setFormData({...formData, disponibilite_cameroun: e.target.value})} className="w-full p-2 border border-emerald-200 rounded-lg bg-white">
                                        <option>Disponible</option>
                                        <option>Rare / Pénurie</option>
                                        <option>Indisponible</option>
                                        <option>Sur commande</option>
                                    </select>
                                </div>
                             </div>
                        </section>

                        {/* DESCRIPTIF LIBRE (SIMPLIFIÉ POUR JSON) */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 block mb-1">Précautions & Mécanisme</label>
                            <textarea rows={4} value={formData.precautions_emploi} onChange={e => setFormData({...formData, precautions_emploi: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm" placeholder="Renseignez ici les précautions particulières ou détails cliniques importants..."></textarea>
                        </div>

                    </div>
                    {/* Fake Submit pour enter */}
                    <button type="submit" className="hidden"></button>
                </form>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Annuler</Button>
                    <Button 
                        onClick={handleSubmit as any} 
                        className={`text-white shadow-lg ${mode === 'create' ? 'bg-[#052648]' : 'bg-orange-500 hover:bg-orange-600'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Traitement..." : mode === 'create' ? "Enregistrer" : "Mettre à jour"}
                    </Button>
                </div>
            </div>
        </div>
    );
}