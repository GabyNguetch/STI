import { Heart, Baby, Ear, Brain, Eye, Bone, Wind, Activity } from 'lucide-react';
import { Service, PatientsData } from './types';

export const MAIN_COLOR = '#052648';

export const services: Service[] = [
  { id: 'cardio', name: 'Cardiologie', icon: Heart, bgImage: '/images/services/cardiologie.jpeg' },
  { id: 'pediatrie', name: 'Pédiatrie', icon: Baby, bgImage: '/images/services/pediatrie.jpeg' },
  { id: 'orl', name: 'ORL', icon: Ear, bgImage: '/images/services/orl.jpeg' },
  { id: 'neuro', name: 'Neurologie', icon: Brain, bgImage: '/images/services/neuro.jpeg' },
  { id: 'ophtalmo', name: 'Ophtalmologie', icon: Eye, bgImage: '/images/services/ophtalmo.jpeg' },
  { id: 'ortho', name: 'Orthopédie', icon: Bone, bgImage: '/images/services/ortho.jpeg' },
  { id: 'pneumo', name: 'Pneumologie', icon: Wind, bgImage: '/images/services/pneumo.jpeg' },
  { id: 'urgence', name: 'Urgences', icon: Activity, bgImage: '/images/services/urgences.jpeg' },
];

export const difficultyLevels = ['Profane', 'Débutant', 'Intermédiaire', 'Confirmé', 'Expert'];

export const patientsData: PatientsData = {
  cardio: {
    nom: 'M. Kamdem Jean', age: 58, sexe: 'Masculin', motif: 'Douleur thoracique et essoufflement', antecedents: 'Hypertension artérielle, tabagisme', symptomes: 'Douleur oppressive rétrosternale irradiant vers le bras gauche, dyspnée, sueurs',
    signesVitaux: 'TA: 160/95 mmHg, FC: 98 bpm, FR: 22/min, SpO2: 94%',
    temperature: '37.1°C', pressionArterielle: '160/95 mmHg', saturationOxygene: '94%', examenClinique: 'Ausculation cardiaque: Bruits du cœur réguliers, pas de souffle. Auscultation pulmonaire: murmure vésiculaire conservé.', analyseBiologique: 'Troponine élevée.',
    diagnostic: 'Syndrome coronarien aigu'
  },
  pediatrie: {
    nom: 'Bébé Ngo\'o Marie', age: 2, sexe: 'Féminin', motif: 'Fièvre et difficultés respiratoires', antecedents: 'Prématurée, vaccination à jour', symptomes: 'Fièvre 39.5°C, toux productive, geignement expiratoire, tirage intercostal',
    signesVitaux: 'T: 39.5°C, FC: 145 bpm, FR: 55/min, SpO2: 89%',
    temperature: '39.5°C', pressionArterielle: '90/60 mmHg', saturationOxygene: '89%', examenClinique: 'Râles crépitants à l\'auscultation du poumon droit.', analyseBiologique: 'Hyperleucocytose à polynucléaires neutrophiles.',
    diagnostic: 'Pneumonie aiguë'
  },
  // ... autres patients
};