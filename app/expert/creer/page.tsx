// app/expert/creer/page.tsx
'use client';

import React from 'react';
import { PlusCircle, FileText, User, HeartPulse, Stethoscope, Beaker } from 'lucide-react';
import { services, difficultyLevels } from '@/types/simulation/constant';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

/**
 * Composant de champ de formulaire réutilisable pour la cohérence.
 */
const FormField = ({ id, label, children }: { id: string, label: string, children: React.ReactNode }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
        {children}
    </div>
);

/**
 * La page permettant à un expert de créer un nouveau cas clinique manuellement.
 */
export default function CreateCasePage() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simule l'envoi des données à un backend
        const promise = new Promise((resolve) => setTimeout(resolve, 1000)); // Simule une latence réseau
        
        toast.promise(
            promise,
            {
                loading: 'Soumission du cas en cours...',
                success: () => {
                    // router.push('/expert/validation'); // Optionnel: rediriger après succès
                    return "Nouveau cas soumis pour validation !";
                },
                error: 'Échec de la soumission.',
            }
        );
        
        // Réinitialiser le formulaire après soumission
        (e.target as HTMLFormElement).reset();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* En-tête de la page */}
            <div>
                <h1 className="text-3xl font-bold text-primary">Créer un Nouveau Cas Clinique</h1>
                <p className="text-slate-600 mt-1">Remplissez ce formulaire pour construire un cas pédagogique personnalisé.</p>
            </div>

            {/* Section 1: Informations Générales */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><FileText size={20}/> Informations Générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField id="service" label="Service Médical">
                        <select id="service" required className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary">
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </FormField>
                    <FormField id="difficulty" label="Niveau de Difficulté">
                        <select id="difficulty" required className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary">
                            {difficultyLevels.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </FormField>
                </div>
            </div>

            {/* Section 2: Données du Patient */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><User size={20}/> Identité du Patient</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField id="nom" label="Nom du Patient">
                        <input type="text" id="nom" required placeholder="Ex: M. Dupont" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary" />
                    </FormField>
                     <FormField id="age" label="Âge">
                        <input type="number" id="age" required placeholder="Ex: 58" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary" />
                    </FormField>
                     <FormField id="sexe" label="Sexe">
                        <select id="sexe" required className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary">
                            <option value="Masculin">Masculin</option>
                            <option value="Féminin">Féminin</option>
                        </select>
                    </FormField>
                 </div>
            </div>

            {/* Section 3: Données de Consultation */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><HeartPulse size={20}/> Données de Consultation</h2>
                 <div className="space-y-4">
                    <FormField id="motif" label="Motif de Consultation">
                        <textarea id="motif" rows={2} required placeholder="Ex: Douleur thoracique et essoufflement" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                    <FormField id="antecedents" label="Antécédents">
                        <textarea id="antecedents" rows={2} required placeholder="Ex: Hypertension artérielle, tabagisme" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                    <FormField id="symptomes" label="Symptômes Rapportés">
                        <textarea id="symptomes" rows={3} required placeholder="Ex: Douleur oppressive rétrosternale irradiant vers le bras gauche..." className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                 </div>
            </div>

            {/* Section 4: Données Cliniques & Diagnostic */}
             <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Stethoscope size={20}/> Données Cliniques & Diagnostic</h2>
                 <div className="space-y-4">
                    <FormField id="signesVitaux" label="Signes Vitaux">
                        <input type="text" id="signesVitaux" required placeholder="Ex: TA: 160/95 mmHg, FC: 98 bpm, FR: 22/min, SpO2: 94%" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary" />
                    </FormField>
                     <FormField id="examenClinique" label="Examen Clinique">
                        <textarea id="examenClinique" rows={2} required placeholder="Ex: Ausculation cardiaque: Bruits du cœur réguliers..." className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                     <FormField id="analyseBiologique" label="Analyse Biologique">
                        <textarea id="analyseBiologique" rows={2} required placeholder="Ex: Troponine élevée." className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                     <FormField id="diagnostic" label="Diagnostic Final Attendu">
                        <input type="text" id="diagnostic" required placeholder="Ex: Syndrome coronarien aigu" className="w-full p-2 border rounded-md bg-slate-50 font-semibold focus:border-primary focus:ring-primary" />
                    </FormField>
                 </div>
            </div>

            {/* Bouton de soumission */}
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg flex items-center gap-2">
                    <PlusCircle size={20}/> Soumettre le Cas
                </button>
            </div>
        </form>
    );
}