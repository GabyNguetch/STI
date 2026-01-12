import { LucideProps } from 'lucide-react';
import React from 'react';

// Type pour une icône de lucide-react
export type Icon = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;

export interface Service {
  id: string;
  name: string;
  icon: Icon;
  bgImage: string;
}

export interface Patient {
  nom: string;
  age: number;
  sexe: 'Masculin' | 'Féminin';
  motif: string;
  antecedents: string;
  modeDeVie?: string; // Ajout pour le social (Tabac, alcool)
  histoireMaladie?: string; // Contexte pour l'IA
  symptomes: string;
  // Données physiologiques
  signesVitaux: string; // Utilisé par l'IA pour répondre aux questions simples
  temperature: string;
  pressionArterielle: string;
  saturationOxygene: string;
  // Résultats d'examens (cachés initialement)
  examenClinique: string;
  analyseBiologique: string;
  // La solution
  diagnostic: string;
  traitementAttendu: string; 
}

// Étapes logiques du jeu
export type GameState = 'asking' | 'diagnosing' | 'treating' | 'grading' | 'finished';

export type PatientsData = Record<string, Patient>;

export interface Message {
  sender: 'doctor' | 'patient' | 'system' | 'tutor';
  text: string;
  time: string;
  icon?: Icon;
  isAction?: boolean; // Pour différencier une question orale d'une action physique (auscultation)
    // Ajout pour le feedback immédiat du tuteur (rouge si mauvais)
  quality?: 'good' | 'bad' | 'neutral'; 
  feedback?: string; // Texte justificatif
}

export interface DiagnosticTool {
    name: string;
    icon: Icon;
    key: keyof Patient; 
    patientValue: string | number | undefined;
}

export interface ClinicalExam {
  name: string;
  icon: React.ElementType; 
  resultat: string;
}

export interface UseCase {
  id: string;
  serviceId: string;
  difficulty: 'Profane' | 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Expert';
  patient: Patient;
}

// Structure pour le retour de correction
export interface GameResult {
  score: number; // Sur 20
  feedback: string;
  missedSteps?: string[];
  diagnosisStatus: 'correct' | 'incorrect' | 'partial';
  finalGrade?: string; // ex: "A", "B"
}