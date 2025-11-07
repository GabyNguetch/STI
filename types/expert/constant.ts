// types/expert/constant.ts
import { ExpertUseCase } from './types';

export const pendingCases: ExpertUseCase[] = [
  {
    id: 'neuro-001',
    serviceId: 'neuro',
    difficulty: 'Expert',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    submittedBy: "IA Générative",
    patient: {
      nom: 'Mme. Fotso Aline', age: 67, sexe: 'Féminin', motif: 'Apparition brutale d\'une faiblesse du côté droit du corps', antecedents: 'Fibrillation auriculaire, Diabète de type 2', symptomes: 'Hémiplégie droite, aphasie d\'expression, paralysie faciale droite.',
      signesVitaux: 'TA: 175/100 mmHg, FC: 110 bpm (irrégulier), FR: 18/min, SpO2: 97%',
      temperature: '37.0°C', pressionArterielle: '175/100 mmHg', saturationOxygene: '97%', examenClinique: 'Score de Glasgow à 13. NIHSS élevé. Souffle carotidien gauche.', analyseBiologique: 'Glycémie élevée.',
      diagnostic: 'Accident Vasculaire Cérébral (AVC) ischémique'
    }
  },
  {
    id: 'cardio-002',
    serviceId: 'cardio',
    difficulty: 'Intermédiaire',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2 heures
    submittedBy: "IA Générative",
    patient: {
      nom: 'M. Onana Paul', age: 45, sexe: 'Masculin', motif: 'Palpitations et vertiges', antecedents: 'Aucun notable', symptomes: 'Sensation de cœur qui bat très vite et de manière irrégulière, survenant par épisodes.',
      signesVitaux: 'TA: 120/80 mmHg, FC: 150 bpm (pendant la crise), FR: 18/min, SpO2: 99%',
      temperature: '37.2°C', pressionArterielle: '120/80 mmHg', saturationOxygene: '99%', examenClinique: 'ECG montre une tachycardie supraventriculaire.', analyseBiologique: 'Bilan thyroïdien normal.',
      diagnostic: 'Tachycardie de Bouveret'
    }
  }
];