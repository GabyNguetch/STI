import { Heart, Baby, Ear, Brain, Eye, Bone, Wind, Activity, Droplet, Shield, Microscope, TestTube, Users, Thermometer, Syringe, CloudDrizzle } from 'lucide-react';
import { Service, PatientsData, UseCase, ClinicalExam } from '@/types/simulation/types';
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

// Base de données statique riche
export const patientsData: PatientsData = {
  'cardio': {
    nom: 'M. Kamdem Jean',
    age: 58,
    sexe: 'Masculin',
    motif: 'Douleur thoracique constrictive',
    antecedents: 'HTA mal suivie, Tabagisme actif (20 PA)',
    modeDeVie: 'Sédentaire, alimentation riche en sel',
    histoireMaladie: 'Douleur apparue brutalement au repos il y a 2h, irradiant dans la mâchoire.',
    symptomes: 'Douleur rétro-sternale, angoisse, sueurs froides, légère nausée.',
    signesVitaux: 'TA: 160/95 mmHg, FC: 110 bpm, SpO2: 96% AA',
    temperature: '37.1°C',
    pressionArterielle: '160/95 mmHg',
    saturationOxygene: '96%',
    examenClinique: 'Bruits du cœur réguliers, pas de souffle. Poumons libres. Pas d\'OMI.',
    analyseBiologique: 'ECG: Sus-décalage ST en DII, DIII, aVF (Territoire inférieur). Troponines positives.',
    diagnostic: 'Infarctus du Myocarde (SCA ST+ inférieur)',
    traitementAttendu: 'Aspirine, Clopidogrel/Ticagrelor, Héparine, Appel cardiologie interventionnelle (Coronarographie).'
  },
  'pneumo': {
    nom: 'Mme. Sarah Nguemo',
    age: 34,
    sexe: 'Féminin',
    motif: 'Essoufflement et toux sèche persistante',
    antecedents: 'Rhinite allergique',
    modeDeVie: 'Non fumeuse, travaille dans une boulangerie (exposition farine)',
    histoireMaladie: 'Toux nocturne depuis 3 semaines. Crises de dyspnée sifflante à l\'effort.',
    symptomes: 'Dyspnée expiratoire, sensation d\'oppression thoracique, réveils nocturnes.',
    signesVitaux: 'TA: 120/70, FC: 88, SpO2: 97%, FR: 22/min',
    temperature: '37.0°C',
    pressionArterielle: '120/70 mmHg',
    saturationOxygene: '97%',
    examenClinique: 'Sibilants expiratoires bilatéraux diffus. Temps expiratoire allongé.',
    analyseBiologique: 'EFR: Syndrome obstructif réversible sous Beta-2. NFS: Hyperéosinophilie modérée.',
    diagnostic: 'Asthme Bronchique',
    traitementAttendu: 'Bronchodilatateurs courte action (Ventoline) si crise + Corticostéroïdes inhalés de fond.'
  },
  // On peut ajouter un "FallBack" case générique
  'fallback': {
    nom: 'Patient Standard', age: 30, sexe: 'Masculin', motif: 'Fièvre', antecedents: 'Rien',
    symptomes: 'Mal de tête, fièvre', signesVitaux: 'Normal', temperature: '38',
    pressionArterielle: '120/80', saturationOxygene: '99', examenClinique: 'Normal',
    analyseBiologique: 'Normale', diagnostic: 'Grippe', traitementAttendu: 'Repos, paracétamol'
  }
};

// ----- DANS LA SECTION OÙ VOUS PRÉPAREZ VOS DONNÉES (POUR L'EXEMPLE) -----
// Voici une liste d'exemple des 7 examens cliniques fréquents au Cameroun
export const exampleExams: ClinicalExam[] = [
  { name: "Goutte épaisse (Paludisme)", icon: Syringe, resultat: "Positive ++" },
  { name: "Test rapide VIH", icon: Shield, resultat: "Négatif" },
  { name: "Examen des crachats (Tuberculose)", icon: Microscope, resultat: "BAAR Négatif" },
  { name: "Glycémie à jeun", icon: TestTube, resultat: "0.95 g/L" },
  { name: "Tension Artérielle", icon: Activity, resultat: "125/80 mmHg" },
  { name: "Examen des selles", icon: CloudDrizzle, resultat: "Kystes d'amibes" },
  { name: "NFS (Numération Formule Sanguine)", icon: Thermometer, resultat: "Anémie légère" }
];


// NOUVELLE STRUCTURE : Un tableau de cas cliniques (Use Cases)
// C'est la source de données principale pour l'application.
// À terme, ces données proviendront d'une API.
export const useCases: UseCase[] = [
  {
    id: 'cardio-001',
    serviceId: 'cardio', // Fait le lien avec le service 'Cardiologie'
    difficulty: 'Intermédiaire',
    patient: {
      nom: 'M. Kamdem Jean', age: 58, sexe: 'Masculin', motif: 'Douleur thoracique et essoufflement', antecedents: 'Hypertension artérielle, tabagisme', symptomes: 'Douleur oppressive rétrosternale irradiant vers le bras gauche, dyspnée, sueurs',
      signesVitaux: 'TA: 160/95 mmHg, FC: 98 bpm, FR: 22/min, SpO2: 94%',
      temperature: '37.1°C', pressionArterielle: '160/95 mmHg', saturationOxygene: '94%', examenClinique: 'Ausculation cardiaque: Bruits du cœur réguliers, pas de souffle. Auscultation pulmonaire: murmure vésiculaire conservé.', analyseBiologique: 'Troponine élevée.',
      diagnostic: 'Syndrome coronarien aigu'
    }
  },
  {
    id: 'pediatrie-001',
    serviceId: 'pediatrie',
    difficulty: 'Confirmé',
    patient: {
      nom: 'Bébé Ngo\'o Marie', age: 2, sexe: 'Féminin', motif: 'Fièvre et difficultés respiratoires', antecedents: 'Prématurée, vaccination à jour', symptomes: 'Fièvre 39.5°C, toux productive, geignement expiratoire, tirage intercostal',
      signesVitaux: 'T: 39.5°C, FC: 145 bpm, FR: 55/min, SpO2: 89%',
      temperature: '39.5°C', pressionArterielle: '90/60 mmHg', saturationOxygene: '89%', examenClinique: 'Râles crépitants à l\'auscultation du poumon droit.', analyseBiologique: 'Hyperleucocytose à polynucléaires neutrophiles.',
      diagnostic: 'Pneumonie aiguë'
    }
  },
  {
    id: 'neuro-001',
    serviceId: 'neuro',
    difficulty: 'Expert',
    patient: {
      nom: 'Mme. Fotso Aline', age: 67, sexe: 'Féminin', motif: 'Apparition brutale d\'une faiblesse du côté droit du corps', antecedents: 'Fibrillation auriculaire, Diabète de type 2', symptomes: 'Hémiplégie droite, aphasie d\'expression, paralysie faciale droite.',
      signesVitaux: 'TA: 175/100 mmHg, FC: 110 bpm (irrégulier), FR: 18/min, SpO2: 97%',
      temperature: '37.0°C', pressionArterielle: '175/100 mmHg', saturationOxygene: '97%', examenClinique: 'Score de Glasgow à 13. NIHSS élevé. Souffle carotidien gauche.', analyseBiologique: 'Glycémie élevée.',
      diagnostic: 'Accident Vasculaire Cérébral (AVC) ischémique'
    }
  },
  {
    id: 'pneumo-001',
    serviceId: 'pneumo',
    difficulty: 'Intermédiaire',
    patient: {
      nom: 'M. Abega Luc', age: 24, sexe: 'Masculin', motif: 'Toux sèche et essoufflement à l\'effort', antecedents: 'Asthme infantile', symptomes: 'Toux nocturne, sibilants à l\'expiration, oppression thoracique, surtout après un effort ou exposition à l\'air froid.',
      signesVitaux: 'TA: 120/80 mmHg, FC: 80 bpm, FR: 16/min, SpO2: 98%',
      temperature: '37.0°C', pressionArterielle: '120/80 mmHg', saturationOxygene: '98%', examenClinique: 'Présence de sibilants expiratoires bilatéraux à l\'auscultation pulmonaire.', analyseBiologique: 'Aucune anomalie significative.',
      diagnostic: 'Crise d\'asthme'
    }
  },
  {
    id: 'orl-001',
    serviceId: 'orl',
    difficulty: 'Débutant',
    patient: {
      nom: 'Enfant Mbida Pierre', age: 6, sexe: 'Masculin', motif: 'Douleur intense à l\'oreille droite', antecedents: 'Rhinopharyngites fréquentes', symptomes: 'Otalgie droite pulsatile, fièvre à 38.5°C, pleurs, irritabilité, légère baisse de l\'audition.',
      signesVitaux: 'T: 38.5°C, FC: 110 bpm, FR: 25/min, SpO2: 99%',
      temperature: '38.5°C', pressionArterielle: '100/65 mmHg', saturationOxygene: '99%', examenClinique: 'Otoscopie : tympan droit rouge, bombé, avec disparition des reliefs osseux.', analyseBiologique: 'Non requis pour le diagnostic initial.',
      diagnostic: 'Otite moyenne aiguë (OMA)'
    }
  }
];

export const hints = [
  "Avez-vous pensé à demander les antécédents cardiovasculaires ?",
  "Regardez bien les signes vitaux, une tachycardie est présente.",
  "La biologie montre une anomalie spécifique, comparez avec les symptômes.",
  "Ce type de douleur est caractéristique d'une urgence vitale."
];

