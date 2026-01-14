'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, User, HeartPulse, Stethoscope, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDiseases, getSymptoms, createClinicalCase } from '@/services/expertService';
import { BackendDisease, BackendSymptom, BackendClinicalCaseCreate } from '@/types/backend';

// Définition de difficulté simplifiée pour mapper avec le backend (entier ou string)
const DIFFICULTY_MAP = {
    'Profane': 1,
    'Débutant': 2,
    'Intermédiaire': 3,
    'Confirmé': 4,
    'Expert': 5
};

const FormField = ({ id, label, children }: { id: string, label: string, children: React.ReactNode }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
        {children}
    </div>
);

const CreateCase: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [diseases, setDiseases] = useState<BackendDisease[]>([]);
    const [symptomsList, setSymptomsList] = useState<BackendSymptom[]>([]);
    
    // Pour gérer la sélection multiple de symptômes (simple pour l'exemple)
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]); 

    // Chargement des données référentielles
    useEffect(() => {
        const loadRefs = async () => {
            try {
                // Requête GET parallèle vers le backend
                const [dData, sData] = await Promise.all([
                    getDiseases(),
                    getSymptoms()
                ]);
                setDiseases(dData);
                setSymptomsList(sData);
            } catch (err) {
                console.error(err);
                toast.error("Erreur de connexion au module Expert Backend");
            } finally {
                setIsLoading(false);
            }
        };
        loadRefs();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const form = e.currentTarget;
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());

        // Construction de l'objet conforme à 'BackendClinicalCaseCreate' (Schema OpenAPI)
        // Note: Le backend attend pathologie_principale_id (int)
        
        // Récupération des symptômes cochés (mock simplifié : on prend le champ texte pour l'histoire, et un tableau vide d'objets ID pour l'instant si pas de UI multiselect complexe)
        const formattedCase: BackendClinicalCaseCreate = {
            code_fultang: `CS-${Date.now()}`,
            pathologie_principale_id: parseInt(formValues.diseaseId as string), 
            niveau_difficulte: parseInt(formValues.difficulty as string),
            
            // Structure JSON complexe demandée par votre Backend
            presentation_clinique: {
                histoire_maladie: formValues.histoire as string,
                // Dans une vraie implém, on mapperait les IDs sélectionnés dans une liste déroulante multiple
                symptomes_patient: [], // On laisse vide pour ce test rapide, ou on ajouterait une UI de sélection multiple
                antecedents: {
                    details: formValues.antecedents
                }
            },
            
            // Stockage des infos patients brutes dans des champs JSON flexibles (si le backend le permet dans presentation_clinique) ou ignoré si schéma strict.
            // Vu le schéma strict OpenAPI, "nom", "age" n'apparaissent pas dans ClinicalCaseCreate racine. 
            // On suppose qu'ils vont dans "presentation_clinique.antecedents" ou similaire.
            donnees_paracliniques: {
               examen_clinique: formValues.examenClinique,
               signes_vitaux: formValues.signesVitaux
            }
        };

        // Si le backend nécessite "symptomes_patient" obligatoirement non vide :
        // formattedCase.presentation_clinique.symptomes_patient = [{ symptome_id: 1, details: "Douleur simulée" }];

        await toast.promise(
            createClinicalCase(formattedCase),
            {
                loading: 'Communication avec le Backend STI...',
                success: (data) => {
                    console.log("Success Data Backend:", data);
                    form.reset();
                    return "Cas clinique enregistré dans la base experte !";
                },
                error: (err) => `Erreur Backend: ${err.message}`,
            }
        );
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center text-primary"><Loader2 className="animate-spin mr-2"/> Chargement du référentiel médical...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-primary">Créer un Nouveau Cas (Connecté Backend)</h1>
                <p className="text-slate-600 mt-1">Créez un cas qui sera stocké dans l'encyclopédie du module expert.</p>
            </div>

            {/* Pathologie et Difficulté (REQUIS PAR SCHEMA) */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><FileText size={20}/> Référentiel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField id="diseaseId" label="Pathologie Principale (Base de Données)">
                        <select id="diseaseId" name="diseaseId" required className="w-full p-2 border rounded-md bg-slate-50">
                            <option value="">Sélectionnez une pathologie...</option>
                            {diseases.map(d => (
                                <option key={d.id} value={d.id}>{d.nom_fr} ({d.code_icd10})</option>
                            ))}
                        </select>
                        {diseases.length === 0 && <span className="text-xs text-red-500">Aucune maladie trouvée via GET /diseases</span>}
                    </FormField>
                    
                    <FormField id="difficulty" label="Niveau de Difficulté">
                        <select name="difficulty" id="difficulty" required className="w-full p-2 border rounded-md bg-slate-50">
                            {Object.entries(DIFFICULTY_MAP).map(([label, val]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </div>

            {/* Identité Simulée (Dans un vrai cas réel, le patient est une entité séparée, ici on le met dans le texte histoire) */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><User size={20}/> Contexte Clinique</h2>
                 <div className="space-y-4">
                    <FormField id="histoire" label="Histoire de la maladie & Patient (Description textuelle)">
                        <textarea id="histoire" name="histoire" rows={4} required 
                        placeholder="Ex: M. Dupont, 58 ans, consulte pour..." 
                        className="w-full p-2 border rounded-md bg-slate-50 focus:border-primary focus:ring-primary"></textarea>
                    </FormField>
                    <FormField id="antecedents" label="Antécédents">
                        <textarea id="antecedents" name="antecedents" rows={2} required className="w-full p-2 border rounded-md bg-slate-50"></textarea>
                    </FormField>
                 </div>
            </div>

            {/* Paraclinique */}
             <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Stethoscope size={20}/> Données Paracliniques (Stockage JSONB)</h2>
                 <div className="space-y-4">
                    <FormField id="signesVitaux" label="Signes Vitaux">
                        <input type="text" name="signesVitaux" id="signesVitaux" placeholder="TA, FC, SpO2..." className="w-full p-2 border rounded-md bg-slate-50" />
                    </FormField>
                     <FormField id="examenClinique" label="Examen Clinique Détaillé">
                        <textarea name="examenClinique" id="examenClinique" rows={2} className="w-full p-2 border rounded-md bg-slate-50"></textarea>
                    </FormField>
                 </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-3 bg-[#052648] text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg flex items-center gap-2">
                    <PlusCircle size={20}/> Créer Cas dans Backend
                </button>
            </div>
        </form>
    );
}

export default CreateCase;