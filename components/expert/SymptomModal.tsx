'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Syringe, Plus, Activity, Tag, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { createSymptom, updateSymptom, deleteSymptom, addTreatmentToSymptom } from '@/services/expertService';
import { BackendSymptom, BackendSymptomCreate } from '@/types/backend';

export type ManagerMode = 'create' | 'edit' | 'delete' | 'add_treatment';

interface SymptomManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: ManagerMode;
    initialData?: BackendSymptom | null; // Pour edit/delete/add_treatment
    onSuccess: () => void; // Pour rafraichir la liste parente
}

const CATEGORIES = ["Signe Vital", "Douleur", "Respiratoire", "Digestif", "Neurologique", "Autre"];

export default function SymptomManagerModal({ 
    isOpen, onClose, mode, initialData, onSuccess 
}: SymptomManagerModalProps) {
    
    const [isLoading, setIsLoading] = useState(false);
    
    // État du formulaire Symptôme (Create/Edit)
    const [formData, setFormData] = useState<Partial<BackendSymptomCreate>>({
        nom: '',
        nom_local: '',
        categorie: 'Autre',
        type_symptome: 'Subjectif',
        description: '',
        signes_alarme: false
    });

    // État du formulaire Traitement (Add Treatment)
    const [treatmentData, setTreatmentData] = useState({
        medicament_id: '',
        efficacite: 'Forte', // Par défaut
        rang_preference: 1
    });

    // Reset à l'ouverture
    useEffect(() => {
        if (isOpen && initialData && (mode === 'edit' || mode === 'create')) {
            setFormData({
                nom: initialData.nom || '',
                nom_local: initialData.nom_local || '',
                categorie: initialData.categorie || 'Autre',
                type_symptome: initialData.type_symptome || 'Subjectif',
                description: initialData.description || '',
                signes_alarme: initialData.signes_alarme || false
            });
        } else if (mode === 'create') {
            setFormData({
                nom: '', nom_local: '', categorie: 'Autre', 
                type_symptome: 'Subjectif', description: '', signes_alarme: false
            });
        }
        
        // Reset traitement
        setTreatmentData({ medicament_id: '', efficacite: 'Forte', rang_preference: 1 });
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    // --- TITRES ET STYLES DYNAMIQUES ---
    const config = {
        create: { title: "Nouveau Symptôme", icon: Plus, color: "text-[#052648]" },
        edit: { title: "Modifier le Symptôme", icon: FileText, color: "text-blue-600" },
        delete: { title: "Supprimer le Symptôme", icon: AlertTriangle, color: "text-red-600" },
        add_treatment: { title: "Prescrire un Traitement", icon: Syringe, color: "text-emerald-600" }
    }[mode];

    const Icon = config.icon;

    // --- LOGIQUE DE SOUMISSION ---
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (mode === 'create') {
                await createSymptom(formData as BackendSymptomCreate);
                toast.success("Symptôme créé avec succès");
            } 
            else if (mode === 'edit' && initialData) {
                await updateSymptom(initialData.id, formData);
                toast.success("Mise à jour réussie");
            } 
            else if (mode === 'delete' && initialData) {
                await deleteSymptom(initialData.id);
                toast.success("Symptôme supprimé");
            } 
            else if (mode === 'add_treatment' && initialData) {
                if(!treatmentData.medicament_id) throw new Error("ID Médicament requis");
                
                await addTreatmentToSymptom(initialData.id, {
                    medicament_id: parseInt(treatmentData.medicament_id),
                    efficacite: treatmentData.efficacite
                });
                toast.success("Traitement associé !");
            }

            onSuccess(); // Recharge la liste
            onClose();   // Ferme la modale
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    // ================== RENDU FORMULAIRES ==================

    const renderSymptomForm = () => (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nom Scientifique</label>
                    <input 
                        type="text" required 
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none bg-slate-50 font-medium text-slate-800"
                        placeholder="Ex: Céphalée de tension"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Appellation Locale (Argot)</label>
                    <input 
                        type="text" 
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                        placeholder="Ex: Mal de tête"
                        value={formData.nom_local}
                        onChange={(e) => setFormData({...formData, nom_local: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Catégorie</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg outline-none appearance-none bg-white cursor-pointer"
                            value={formData.categorie}
                            onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
                    <div className="relative">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg outline-none appearance-none bg-white cursor-pointer"
                            value={formData.type_symptome}
                            onChange={(e) => setFormData({...formData, type_symptome: e.target.value})}
                        >
                            <option value="Subjectif">Subjectif (Senti)</option>
                            <option value="Objectif">Objectif (Observé/Mesuré)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description Clinique</label>
                <textarea 
                    rows={4}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm leading-relaxed"
                    placeholder="Décrivez les caractéristiques du symptôme pour le système expert..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                 onClick={() => setFormData({...formData, signes_alarme: !formData.signes_alarme})}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.signes_alarme ? 'bg-red-500 border-red-600' : 'bg-white border-slate-300'}`}>
                    {formData.signes_alarme && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                    <span className="text-sm font-bold text-red-700">Marquer comme Signe d'Alarme (Red Flag)</span>
                    <p className="text-xs text-red-500">Ce symptôme nécessite une attention urgente s'il est détecté.</p>
                </div>
            </div>
        </div>
    );

    const renderDeleteConfirm = () => (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-8 h-8 text-red-600" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-800">Êtes-vous absolument sûr ?</h3>
                <p className="text-sm text-slate-500 mt-2">
                    Vous êtes sur le point de supprimer le symptôme <span className="font-bold text-red-600">"{initialData?.nom}"</span>.
                    Cette action est irréversible et pourrait impacter les cas cliniques liés.
                </p>
             </div>
        </div>
    );

    const renderTreatmentForm = () => (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
             <div className="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-lg border border-emerald-100 mb-4">
                 Associer un traitement symptomatique à : <strong>{initialData?.nom}</strong>
             </div>
             
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">ID Médicament (Backend)</label>
                <div className="relative">
                    <input 
                        type="number" autoFocus
                        className="w-full pl-3 pr-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                        placeholder="Ex: 1045"
                        value={treatmentData.medicament_id}
                        onChange={(e) => setTreatmentData({...treatmentData, medicament_id: e.target.value})}
                    />
                    <Syringe className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">Entrez l'ID unique du médicament (table `medicaments`)</p>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Niveau d'Efficacité attendue</label>
                <select 
                     className="w-full p-3 border border-slate-200 rounded-lg outline-none bg-white"
                     value={treatmentData.efficacite}
                     onChange={(e) => setTreatmentData({...treatmentData, efficacite: e.target.value})}
                >
                    <option value="Faible">Faible / Adjuvant</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Forte">Forte / 1ère Intention</option>
                    <option value="Curatif">Spécifique (Curatif)</option>
                </select>
            </div>
        </div>
    );

    // ================== RENDU PRINCIPAL ==================

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#052648]/40 backdrop-blur-sm p-4 animate-fade-in">
             <div className={`relative bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${mode === 'delete' ? 'max-w-md' : 'max-w-xl'}`}>
                
                {/* Header */}
                <div className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white`}>
                     <h2 className={`text-lg font-bold flex items-center gap-2 ${config.color}`}>
                         <Icon size={20} /> {config.title}
                     </h2>
                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition">
                        <X size={20}/>
                     </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                     {mode === 'delete' ? renderDeleteConfirm() : 
                      mode === 'add_treatment' ? renderTreatmentForm() :
                      renderSymptomForm()
                     }
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                     <Button variant="outline" onClick={onClose} disabled={isLoading}>
                         Annuler
                     </Button>
                     
                     <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className={`shadow-lg text-white font-medium
                             ${mode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 
                               mode === 'add_treatment' ? 'bg-emerald-600 hover:bg-emerald-700' :
                               'bg-[#052648] hover:bg-blue-900'}
                        `}
                    >
                         {isLoading ? 'Traitement...' : 
                          mode === 'create' ? 'Créer le symptôme' : 
                          mode === 'delete' ? 'Confirmer suppression' :
                          'Sauvegarder'}
                     </Button>
                </div>

             </div>
        </div>
    );
}