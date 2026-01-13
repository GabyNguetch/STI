export type UserLevel = 'student' | 'intern' | 'resident' | 'doctor' | 'specialist';
export type PracticeFrequency = 'daily' | 'weekly' | 'occasional';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  // Identité
  id?: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  
  // Académique
  level: UserLevel;
  yearOfStudy?: number;
  university?: string;
  
  // Spécialisation
  specialty?: string;
  areasOfInterest: string[];
  
  // Objectifs
  learningGoals: string[];
  targetExam?: string;
  practiceFrequency: PracticeFrequency;
  
  // Préférences
  difficultyPreference: DifficultyLevel;
  preferredCaseTypes: string[];
  
  // Statistiques
  totalCasesCompleted?: number;
  averageScore?: number;
  currentStreak?: number;
  joinedDate?: Date;
}

export const SPECIALTIES = [
  'Cardiologie',
  'Pédiatrie',
  'Chirurgie',
  'Médecine Interne',
  'Neurologie',
  'Psychiatrie',
  'Gynécologie-Obstétrique',
  'Dermatologie',
  'Ophtalmologie',
  'ORL',
  'Radiologie',
  'Anesthésie-Réanimation',
  'Médecine d\'Urgence',
  'Autre'
];

export const LEARNING_GOALS = [
  'Préparation aux examens',
  'Perfectionnement clinique',
  'Découverte de nouvelles spécialités',
  'Révision des connaissances',
  'Formation continue',
  'Préparation aux concours'
];

export const CASE_TYPES = [
  'Cas cliniques standards',
  'Cas d\'urgence',
  'Cas complexes',
  'Cas pédiatriques',
  'Cas gériatriques',
  'Cas chirurgicaux',
  'Imagerie médicale'
];
