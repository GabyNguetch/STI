// app/expert/creer/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, User, HeartPulse, Stethoscope, Beaker } from 'lucide-react';
import toast from 'react-hot-toast';
import { services, difficultyLevels } from '@/types/simulation/constant';
import { createCase } from '@/services/caseService'; // <-- AJOUT

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
const CreateCase: React.FC = () => {
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const form = e.currentTarget;
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());

        // --- CORRECTION MAJEURE ICI ---
        // Construire l'objet avec des noms de colonnes en snake_case pour correspondre à Supabase
        const newCaseForDB = {
            id: `${formValues.service}-${Date.now()}`,
            service_id: formValues.service as string,      // MODIFIÉ : serviceId -> service_id
            difficulty: formValues.difficulty as string,
            patient: { // L'objet `patient` reste en camelCase car il est stocké dans une seule colonne JSONB
                nom: formValues.nom as string,
                age: Number(formValues.age),
                sexe: formValues.sexe as string,
                motif: formValues.motif as string,
                antecedents: formValues.antecedents as string, // MODIFIÉ : Correction du `name`
                symptomes: formValues.symptomes as string,       // MODIFIÉ : Correction du `name`
                signesVitaux: formValues.signesVitaux as string,   // MODIFIÉ : Correction du `name`
                examenClinique: formValues.examenClinique as string, // MODIFIÉ : Correction du `name`
                analyseBiologique: formValues.analyseBiologique as string, // MODIFIÉ : Correction du `name`
                diagnostic: formValues.diagnostic as string        // MODIFIÉ : Correction du `name`
            }
        };

        // Utilisation du service avec react-hot-toast
        await toast.promise(
            createCase(newCaseForDB as any),
            {
                loading: 'Enregistrement du cas...',
                success: () => {
                    form.reset();
                    // Vous pouvez décommenter la ligne suivante si vous voulez rediriger l'expert après la création
                    // router.push('/expert/validation'); 
                    return "Nouveau cas soumis avec succès !";
                },
                error: (err) => `Échec de la création: ${err.message}`,
            }
        );
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
                        <select id="service" name="service" required className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary">
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </FormField>
                    <FormField id="difficulty" label="Niveau de Difficulté">
                        <select name="dif" id="difficulty" required className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary">
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
                        <input type="text" name="nom" id="nom" required placeholder="Ex: M. Dupont" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary" />
                    </FormField>
                     <FormField id="age" label="Âge">
                        <input type="number" name="age" id="age" required placeholder="Ex: 58" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary" />
                    </FormField>
                     <FormField id="sexe" label="Sexe">
                        <select id="sexe" name="sexe" required className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary">
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
                        <textarea id="motif" name="motif" rows={2} required placeholder="Ex: Douleur thoracique et essoufflement" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                    <FormField id="antecedents" label="Antécédents">
                        <textarea id="antecedents" name="antecedent" rows={2} required placeholder="Ex: Hypertension artérielle, tabagisme" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                    <FormField id="symptomes" label="Symptômes Rapportés">
                        <textarea id="symptomes" name="ymptom" rows={3} required placeholder="Ex: Douleur oppressive rétrosternale irradiant vers le bras gauche..." className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                 </div>
            </div>

            {/* Section 4: Données Cliniques & Diagnostic */}
             <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Stethoscope size={20}/> Données Cliniques & Diagnostic</h2>
                 <div className="space-y-4">
                    <FormField id="signesVitaux" label="Signes Vitaux">
                        <input type="text" name="sv" id="signesVitaux" required placeholder="Ex: TA: 160/95 mmHg, FC: 98 bpm, FR: 22/min, SpO2: 94%" className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary" />
                    </FormField>
                     <FormField id="examenClinique" label="Examen Clinique">
                        <textarea name="cliex" id="examenClinique" rows={2} required placeholder="Ex: Ausculation cardiaque: Bruits du cœur réguliers..." className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                     <FormField id="analyseBiologique" label="Analyse Biologique">
                        <textarea name="ab" id="analyseBiologique" rows={2} required placeholder="Ex: Troponine élevée." className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                     <FormField id="diagnostic" label="Diagnostic Final Attendu">
                        <input type="text" name="diag" id="diagnostic" required placeholder="Ex: Syndrome coronarien aigu" className="w-full p-2 border rounded-md bg-slate-50 font-semibold focus:border-primary focus:ring-primary" />
                    </FormField>
                 </div>
            </div>

            {/* Bouton de soumission */}
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-3 bg-[#052648] text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg flex items-center gap-2">
                    <PlusCircle size={20}/> Soumettre le Cas
                </button>
            </div>
        </form>
    );
}

export default CreateCase ;