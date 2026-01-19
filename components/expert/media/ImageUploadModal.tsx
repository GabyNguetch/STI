'use client';
import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileImage, Tag, Activity, AlertCircle, Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '../ui/CustomSelect'; // Réutilisez votre composant si dispo, sinon select natif
import { BackendDisease } from '@/types/backend';
import { getDiseases } from '@/services/expertService'; // Pour lier à une patho
import toast from 'react-hot-toast';
import { uploadMedicalImage } from '@/services/expertService';

interface UploadProps {
    file: File | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const TYPES_EXAMEN = [
    { label: "Radiographie (RX)", value: "Radiographie" },
    { label: "Scanner (CT)", value: "Scanner" },
    { label: "IRM", value: "IRM" },
    { label: "Échographie", value: "Echographie" },
    { label: "Photo Dermatologique", value: "Dermato" },
    { label: "Autre", value: "Autre" }
];

export default function ImageUploadModal({ file, isOpen, onClose, onSuccess }: UploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [diseases, setDiseases] = useState<BackendDisease[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [type, setType] = useState("Radiographie");
    const [sousType, setSousType] = useState("");
    const [desc, setDesc] = useState("");
    const [pathoId, setPathoId] = useState<number | string>("");
    const [quality, setQuality] = useState(3);
    const [difficulty, setDifficulty] = useState(1);

    // Initialisation : Preview Image & Chargement Pathologies
    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            
            // Reset form
            setType("Radiographie");
            setSousType("");
            setDesc("");
            setQuality(3);
            setPathoId("");
            
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    useEffect(() => {
        if(isOpen) {
             getDiseases().then(setDiseases).catch(() => {});
        }
    }, [isOpen]);

    const handleUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        const toastId = toast.loading("Envoi de l'imagerie au PACS...");
        
        try {
            await uploadMedicalImage(file, {
                type_examen: type,
                sous_type: sousType,
                description: desc,
                pathologie_id: Number(pathoId) || undefined,
                niveau_difficulte: difficulty,
                qualite_image: quality
            });
            toast.success("Image archivée avec succès", { id: toastId });
            onSuccess();
            onClose();
        } catch (e: any) {
            console.error(e);
            toast.error("Erreur Upload : " + e.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#052648]/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto md:max-h-[800px]">
                
                {/* GAUCHE: Preview visuelle */}
                <div className="md:w-5/12 bg-slate-900 relative flex items-center justify-center p-6 border-r border-slate-700">
                     <div className="relative w-full h-full min-h-[300px] flex flex-col items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg border border-slate-600"/>
                        ) : (
                            <div className="text-slate-500 flex flex-col items-center">
                                <FileImage size={48} className="mb-2"/>
                                <span>Aperçu indisponible</span>
                            </div>
                        )}
                        <div className="mt-4 text-center">
                            <p className="text-white font-mono text-sm truncate w-64 mx-auto">{file.name}</p>
                            <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} Ko • {file.type}</p>
                        </div>
                     </div>
                </div>

                {/* DROITE: Formulaire de qualification */}
                <div className="md:w-7/12 flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h2 className="text-xl font-bold text-[#052648] flex items-center gap-2">
                                <UploadCloud className="text-blue-600"/> Qualification Médicale
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Renseignez les métadonnées pour l'indexation.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Type d'examen</label>
                                 <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 transition-all">
                                    {TYPES_EXAMEN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Sous-type (Région)</label>
                                 <input type="text" value={sousType} onChange={e => setSousType(e.target.value)} placeholder="ex: Thorax, Poignet" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"/>
                             </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Lien Pathologique</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                <select 
                                    value={pathoId} 
                                    onChange={e => setPathoId(e.target.value)} 
                                    className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 appearance-none"
                                >
                                    <option value="">-- Aucune pathologie liée (Image saine) --</option>
                                    {diseases.map(d => <option key={d.id} value={d.id}>{d.nom_fr} ({d.code_icd10})</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Qualité Image (1-5)</label>
                                <input type="range" min="1" max="5" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#052648]"/>
                                <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1"><span>Floue</span><span>Excellente</span></div>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Difficulté Interprétation</label>
                                <input type="range" min="1" max="5" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                                <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1"><span>Evident</span><span>Subtil</span></div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Description Radiologique</label>
                            <textarea 
                                rows={3} 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)} 
                                className="w-full p-3 border border-slate-200 rounded-xl text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                                placeholder="Décrivez les lésions observées : foyer de condensation, fracture..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-br-3xl">
                        <Button variant="ghost" onClick={onClose} disabled={isLoading}>Annuler</Button>
                        <Button onClick={handleUpload} disabled={isLoading} className="bg-[#052648] hover:bg-blue-900 text-white min-w-[150px]">
                            {isLoading ? 'Téléchargement...' : (
                                <>Valider & Upload <Check size={18} className="ml-2"/></>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}