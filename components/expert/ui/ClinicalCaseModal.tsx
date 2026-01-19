'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Save, FileText, Activity, Brain, Microscope, 
  Stethoscope, Plus, Trash2, Clock, Zap, Target,
  ChevronRight, ChevronLeft, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  createClinicalCase, 
  updateClinicalCase, 
  getDiseases, 
  getSymptoms 
} from '@/services/expertService';
import { BackendDisease, BackendSymptom, BackendClinicalCaseCreate } from '@/types/backend';
import { Button } from '@/components/ui/Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    caseId?: number;
    initialData?: any;
    onSuccess: () => void;
}

export default function ClinicalCaseModal({ isOpen, onClose, mode, initialData, onSuccess, caseId }: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'clinique' | 'paraclinique'>('info');
    
    // Référentiels pour les listes déroulantes
    const [diseases, setDiseases] = useState<BackendDisease[]>([]);
    const [symptomsRefs, setSymptomsRefs] = useState<BackendSymptom[]>([]);

    // État du formulaire complet
    const [formData, setFormData] = useState<BackendClinicalCaseCreate>({
        code_fultang: '',
        pathologie_principale_id: 0,
        pathologies_secondaires_ids: [],
        presentation_clinique: {
            histoire_maladie: '',
            symptomes_patient: [],
            antecedents: { personnels: "", chirurgicaux: "" }
        },
        donnees_paracliniques: { constantes: "", labo: "" },
        evolution_patient: '',
        images_associees_ids: [],
        sons_associes_ids: [],
        medicaments_prescrits: [],
        niveau_difficulte: 3,
        duree_estimee_resolution_min: 15,
        objectifs_apprentissage: [],
        competences_requises: {}
    });

    // Charger les référentiels
    useEffect(() => {
        if (isOpen) {
            Promise.all([getDiseases(), getSymptoms()]).then(([d, s]) => {
                setDiseases(d);
                setSymptomsRefs(s);
            });
        }
    }, [isOpen]);

    // Pré-remplissage pour le mode EDITION
    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData({
                ...initialData,
                pathologie_principale_id: initialData.pathologie_principale?.id || 0,
                // On s'assure que les objets imbriqués existent
                presentation_clinique: initialData.presentation_clinique || { histoire_maladie: '', symptomes_patient: [], antecedents: {} }
            });
        } else if (isOpen && mode === 'create') {
            setFormData(prev => ({ ...prev, code_fultang: `CAS-${Date.now().toString().slice(-6)}` }));
        }
    }, [isOpen, mode, initialData]);

    const handleSave = async () => {
        if (!formData.pathologie_principale_id || !formData.presentation_clinique.histoire_maladie) {
            toast.error("Veuillez remplir les informations obligatoires.");
            return;
        }

        setIsLoading(true);
        const tId = toast.loading(mode === 'create' ? "Création..." : "Mise à jour...");
        try {
            if (mode === 'create') await createClinicalCase(formData);
            else await updateClinicalCase(caseId!, formData);
            
            toast.success("Succès !", { id: tId });
            onSuccess();
            onClose();
        } catch (e) {
            toast.error("Erreur serveur backend.", { id: tId });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Helpers pour les listes dynamiques (Symptômes) ---
    const addSymptomRow = () => {
        setFormData({
            ...formData,
            presentation_clinique: {
                ...formData.presentation_clinique,
                symptomes_patient: [...formData.presentation_clinique.symptomes_patient, { symptome_id: 0, details: "" }]
            }
        });
    };

    const updateSymptomRow = (index: number, field: 'symptome_id' | 'details', value: any) => {
        const newList = [...formData.presentation_clinique.symptomes_patient];
        newList[index] = { ...newList[index], [field]: value };
        setFormData({
            ...formData,
            presentation_clinique: { ...formData.presentation_clinique, symptomes_patient: newList }
        });
    };

    const removeSymptomRow = (index: number) => {
        const newList = formData.presentation_clinique.symptomes_patient.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            presentation_clinique: { ...formData.presentation_clinique, symptomes_patient: newList }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#052648]/60 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                
                {/* HEADER SECTION */}
                <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#052648] text-white rounded-2xl flex items-center justify-center">
                            {mode === 'create' ? <Plus size={24}/> : <FileText size={24}/>}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#052648]">
                                {mode === 'create' ? "Nouveau Scénario" : "Édition du Cas"}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Référentiel Expert v2 • Structure Standardisée</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={24}/></button>
                </div>

                {/* TAB NAVIGATION */}
                <div className="flex px-8 border-b bg-white text-sm font-bold uppercase tracking-wider text-slate-400">
                    {[
                        { id: 'info', label: '1. Identification', icon: Tag },
                        { id: 'clinique', label: '2. Clinique & Symptômes', icon: Stethoscope },
                        { id: 'paraclinique', label: '3. Paraclinique & Fin', icon: Microscope }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${activeTab === tab.id ? 'border-[#052648] text-[#052648]' : 'border-transparent hover:text-slate-600'}`}
                        >
                            <tab.icon size={16}/> {tab.label}
                        </button>
                    ))}
                </div>

                {/* FORM CONTENT (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">
                        
                        {/* TAB 1: IDENTIFICATION */}
                        {activeTab === 'info' && (
                            <div className="space-y-6 animate-in slide-in-from-left-2">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Code Fultang (ID)</label>
                                        <input 
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                            value={formData.code_fultang}
                                            onChange={e => setFormData({...formData, code_fultang: e.target.value})}
                                            placeholder="Ex: CARDIO-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Difficulté (1-5)</label>
                                        <select 
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                                            value={formData.niveau_difficulte}
                                            onChange={e => setFormData({...formData, niveau_difficulte: parseInt(e.target.value)})}
                                        >
                                            <option value={1}>1 - Débutant</option>
                                            <option value={2}>2 - Junior</option>
                                            <option value={3}>3 - Confirmé</option>
                                            <option value={4}>4 - Senior</option>
                                            <option value={5}>5 - Expert</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Pathologie Principale (Référentiel)</label>
                                    <select 
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                                        value={formData.pathologie_principale_id}
                                        onChange={e => setFormData({...formData, pathologie_principale_id: parseInt(e.target.value)})}
                                    >
                                        <option value={0}>Sélectionnez une maladie...</option>
                                        {diseases.map(d => (
                                            <option key={d.id} value={d.id}>{d.nom_fr} ({d.code_icd10})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Temps de résolution estimé (min)</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3 top-3.5 text-slate-400"/>
                                        <input 
                                            type="number" 
                                            className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl"
                                            value={formData.duree_estimee_resolution_min}
                                            onChange={e => setFormData({...formData, duree_estimee_resolution_min: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: CLINIQUE & SYMPTOMES */}
                        {activeTab === 'clinique' && (
                            <div className="space-y-8 animate-in slide-in-from-left-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Histoire de la maladie</label>
                                    <textarea 
                                        rows={4} 
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                                        placeholder="Arrivée du patient, plainte principale, contexte..."
                                        value={formData.presentation_clinique.histoire_maladie}
                                        onChange={e => setFormData({
                                            ...formData, 
                                            presentation_clinique: { ...formData.presentation_clinique, histoire_maladie: e.target.value }
                                        })}
                                    />
                                </div>

                                {/* LISTE DYNAMIQUE DES SYMPTOMES */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="text-sm font-bold text-[#052648] uppercase tracking-wide flex items-center gap-2">
                                            <Activity size={18} className="text-red-500"/> Signes & Symptômes Patient
                                        </h4>
                                        <Button size="sm" onClick={addSymptomRow} variant="outline" className="h-8 rounded-lg">
                                            <Plus size={14} className="mr-1"/> Ajouter un signe
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {formData.presentation_clinique.symptomes_patient.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95">
                                                <div className="flex-1 space-y-3">
                                                    <select 
                                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                                                        value={item.symptome_id}
                                                        onChange={e => updateSymptomRow(index, 'symptome_id', parseInt(e.target.value))}
                                                    >
                                                        <option value={0}>-- Choisir le symptôme --</option>
                                                        {symptomsRefs.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                                                    </select>
                                                    <input 
                                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                                        placeholder="Détails cliniques (ex: intensité 8/10, pulsatile...)"
                                                        value={item.details}
                                                        onChange={e => updateSymptomRow(index, 'details', e.target.value)}
                                                    />
                                                </div>
                                                <button onClick={() => removeSymptomRow(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={20}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PARACLINIQUE & AUTRES */}
                        {activeTab === 'paraclinique' && (
                            <div className="space-y-6 animate-in slide-in-from-left-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Évolution attendue / Finale</label>
                                    <textarea 
                                        rows={3} 
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl"
                                        placeholder="Comment l'état du patient évolue sous traitement ?"
                                        value={formData.evolution_patient}
                                        onChange={e => setFormData({...formData, evolution_patient: e.target.value})}
                                    />
                                </div>

                                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                    <h5 className="text-xs font-bold text-amber-800 uppercase flex items-center gap-2 mb-2">
                                        <Info size={14}/> Note Technique
                                    </h5>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Les champs <strong>donnees_paracliniques</strong> (Labo, constantes) et <strong>competences_requises</strong> (Q-Matrix) acceptent du format JSON brut. Ils sont actuellement stockés avec les valeurs par défaut de la structure backend pour garantir l'intégrité du système expert.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="px-8 py-5 border-t bg-white flex justify-between items-center">
                    <div className="flex gap-2">
                        {activeTab !== 'info' && (
                            <Button variant="outline" onClick={() => setActiveTab(activeTab === 'paraclinique' ? 'clinique' : 'info')}>
                                <ChevronLeft size={18}/> Précédent
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={onClose}>Annuler</Button>
                        {activeTab === 'paraclinique' ? (
                            <Button onClick={handleSave} disabled={isLoading} className="bg-[#052648] text-white px-8">
                                {isLoading ? "Patientez..." : "Enregistrer le Cas"} <Save size={18} className="ml-2"/>
                            </Button>
                        ) : (
                            <Button onClick={() => setActiveTab(activeTab === 'info' ? 'clinique' : 'paraclinique')}>
                                Suivant <ChevronRight size={18}/>
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Composant Helper icône simple
const Tag = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="m7 7-.01.01"/></svg>
);