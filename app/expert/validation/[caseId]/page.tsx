// app/expert/validation/[caseId]/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, X, User, Tag, ShieldCheck, Plus, Trash2, AlertCircle, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCases } from '@/contexts/CaseContext';
import { services } from '@/types/simulation/constant';
import { GoldenPathItem, PatientPersona } from '@/types/expert/types';
import toast from 'react-hot-toast';

// Sous-composant pour un item du "Golden Path"
const GoldenPathEditor = ({ item, onDelete }: { item: GoldenPathItem, onDelete: (id: string) => void }) => (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
        <select defaultValue={item.type} className="p-1 border rounded-md bg-white text-xs">
            <option value="question">Question</option>
            <option value="examen">Examen</option>
            <option value="action">Action</option>
        </select>
        <input type="text" defaultValue={item.description} placeholder="Description de l'étape..." className="flex-grow p-1 border rounded-md text-sm"/>
        <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" defaultChecked={item.isCritical} /> Critique
        </label>
        <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
    </div>
);

// Composant pour la modale de confirmation
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, color = 'primary' }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, color?: string }) => {
    if (!isOpen) return null;
    const buttonColor = color === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-800';
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in-up">
                <h2 className={`text-lg font-bold ${color === 'danger' ? 'text-red-600' : 'text-primary'}`}>{title}</h2>
                <p className="text-sm text-slate-600 mt-2 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold text-white ${buttonColor} rounded-lg`}>{title}</button>
                </div>
            </div>
        </div>
    );
};


export default function ValidateCasePage() {
    const router = useRouter();
    const params = useParams();
    const { getCaseById, approveCase, rejectCase } = useCases();
    
    const caseId = Array.isArray(params.caseId) ? params.caseId[0] : params.caseId;
    const useCase = getCaseById(caseId);

    const [activeTab, setActiveTab] = useState<'dossier' | 'pedagogie' | 'historique'>('dossier');
    const [isModalOpen, setModalOpen] = useState<'approve' | 'reject' | null>(null);
    const [feedback, setFeedback] = useState(useCase?.feedback || '');
    const [annotations, setAnnotations] = useState(useCase?.annotations || '');
    const [persona, setPersona] = useState<PatientPersona>(useCase?.persona || 'standard');
    const [goldenPath, setGoldenPath] = useState<GoldenPathItem[]>(useCase?.goldenPath || []);

    const addGoldenPathItem = () => setGoldenPath([...goldenPath, { id: Date.now().toString(), type: 'action', description: '', isCritical: false }]);
    const deleteGoldenPathItem = (id: string) => setGoldenPath(goldenPath.filter(item => item.id !== id));

    if (!useCase) {
        return (
            <div className="text-center bg-white p-12 rounded-xl shadow-md">
                <AlertCircle className="mx-auto w-12 h-12 text-red-500" />
                <h1 className="mt-4 text-xl font-bold text-primary">Cas non trouvé ou déjà traité</h1>
                <p className="text-slate-600">Le cas avec l'ID "{caseId}" n'est plus dans la file d'attente.</p>
                <Link href="/expert/validation" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-blue-700">Retour à la liste de validation</Link>
            </div>
        );
    }
    
    const service = services.find(s => s.id === useCase.serviceId);

    const handleApprove = () => {
        approveCase(useCase.id);
        setModalOpen(null);
        toast.success(`Cas "${useCase.patient.nom}" approuvé !`);
        router.push('/expert/validation');
    };
    const handleReject = () => {
        if (!feedback.trim()) { return toast.error("Le feedback est obligatoire pour un rejet."); }
        rejectCase(useCase.id, feedback);
        setModalOpen(null);
        toast.error(`Cas "${useCase.patient.nom}" rejeté.`);
        router.push('/expert/validation');
    };

    const TABS = [
        { id: 'dossier', label: 'Dossier Clinique', icon: BookOpen },
        { id: 'pedagogie', label: 'Enrichissement Pédagogique', icon: ShieldCheck },
        { id: 'historique', label: 'Historique', icon: Clock },
    ];
    
    return (
        <>
            <ConfirmationModal isOpen={isModalOpen === 'approve'} onClose={() => setModalOpen(null)} onConfirm={handleApprove} title="Approuver le Cas" message="Voulez-vous vraiment approuver ce cas et le rendre disponible pour les apprenants ?"/>
            <ConfirmationModal isOpen={isModalOpen === 'reject'} onClose={() => setModalOpen(null)} onConfirm={handleReject} title="Rejeter le Cas" message="Êtes-vous sûr de vouloir rejeter ce cas ? Il sera retourné pour révision." color="danger"/>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center gap-4">
                            {service && <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center"><service.icon className="w-6 h-6 text-white"/></div>}
                            <div>
                                <h1 className="text-2xl font-bold text-primary">{useCase.patient.nom}, {useCase.patient.age} ans</h1>
                                <p className="text-slate-500">{service?.name} - {useCase.difficulty}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md">
                        <div className="border-b border-slate-200">
                            <nav className="flex gap-4 px-6">
                                {TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 py-3 font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}>
                                        <tab.icon size={16}/> {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="p-6">
                            {activeTab === 'dossier' && (
                                <div className="space-y-3 text-sm text-slate-700 animate-fade-in">
                                    <p><strong>Motif:</strong> {useCase.patient.motif}</p>
                                    <p><strong>Antécédents:</strong> {useCase.patient.antecedents}</p>
                                    <p><strong>Symptômes:</strong> {useCase.patient.symptomes}</p>
                                    <p><strong>Signes Vitaux:</strong> {useCase.patient.signesVitaux}</p>
                                    <p><strong>Examen Clinique:</strong> {useCase.patient.examenClinique}</p>
                                    <p><strong>Analyse Biologique:</strong> {useCase.patient.analyseBiologique}</p>
                                    <p className="font-bold pt-2 text-base text-primary"><strong>Diagnostic Proposé par l'IA:</strong> {useCase.patient.diagnostic}</p>
                                </div>
                            )}
                            {activeTab === 'pedagogie' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <label className="font-semibold text-slate-700 flex items-center gap-2"><Tag size={16}/> Annotation & Curation</label>
                                        <p className="text-xs text-slate-500 mb-1">Ajoutez des notes, des pièges à éviter ou des points clés pour ce cas.</p>
                                        <textarea value={annotations} onChange={e => setAnnotations(e.target.value)} rows={3} placeholder="Ex: Attention à ne pas confondre avec une embolie pulmonaire..." className="w-full p-2 border rounded-md text-sm bg-slate-50"/>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-slate-700 flex items-center gap-2"><User size={16}/> Persona du Patient</label>
                                        <p className="text-xs text-slate-500 mb-1">Définissez le comportement du patient pour la simulation.</p>
                                        <select value={persona} onChange={e => setPersona(e.target.value as PatientPersona)} className="w-full p-2 border rounded-md text-sm bg-slate-50">
                                            <option value="standard">Standard</option><option value="anxieux">Anxieux</option><option value="coopératif">Coopératif</option><option value="pressé">Pressé</option><option value="silencieux">Silencieux</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-slate-700 flex items-center gap-2"><ShieldCheck size={16}/> Critères d'Évaluation (Golden Path)</label>
                                        <p className="text-xs text-slate-500 mb-1">Définissez les étapes clés que l'étudiant doit réaliser pour réussir.</p>
                                        <div className="space-y-2">{goldenPath.map(item => <GoldenPathEditor key={item.id} item={item} onDelete={deleteGoldenPathItem} />)}</div>
                                        <button onClick={addGoldenPathItem} className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:text-blue-700"><Plus size={14}/> Ajouter une étape</button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'historique' && (
                                <div className="animate-fade-in text-sm text-slate-500">
                                    <p>Historique des actions sur ce cas...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-md sticky top-8">
                        <h2 className="text-xl font-bold text-primary mb-4">Actions de Validation</h2>
                        <div className="space-y-4">
                            <button onClick={() => setModalOpen('approve')} disabled={useCase.status !== 'pending'} className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"><Check /> Approuver le Cas</button>
                            <button onClick={() => setModalOpen('reject')} disabled={useCase.status !== 'pending'} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"><X /> Rejeter le Cas</button>
                            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="En cas de rejet, veuillez fournir un feedback..." className="w-full p-2 border rounded-md text-sm bg-slate-50" disabled={useCase.status !== 'pending'}/>
                            {useCase.status !== 'pending' && (<p className="text-xs text-center text-blue-600 bg-blue-50 p-2 rounded-md">Ce cas a déjà été traité (statut: {useCase.status}).</p>)}
                        </div>
                        <hr className="my-6"/>
                        <h3 className="font-semibold text-primary mb-2">Scénarios Complexes</h3>
                        <div className="space-y-2">
                            <button className="w-full text-sm text-left p-2 bg-slate-100 hover:bg-slate-200 rounded-md">Créer une variante...</button>
                            <button className="w-full text-sm text-left p-2 bg-slate-100 hover:bg-slate-200 rounded-md">Ajouter une complication...</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}