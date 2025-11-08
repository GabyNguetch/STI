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
  symptomes: string;
  signesVitaux: string;
  temperature: string;
  pressionArterielle: string;
  saturationOxygene: string;
  examenClinique: string;
  analyseBiologique: string;
  diagnostic: string;
}

export type PatientsData = Record<string, Patient>;

export interface Message {
  sender: 'doctor' | 'patient' | 'system';
  text: string;
  time: string;
  icon?: Icon;
}

export interface DiagnosticTool {
    name: string;
    icon: Icon;
    key: keyof Patient; // Assure que la clé existe dans l'objet Patient
    patientValue: string | number | undefined;
}

export interface ClinicalExam {
  name: string;
  icon: React.ElementType; // Ou JSX.Element, selon votre configuration
  resultat: string; // Le résultat de l'examen à afficher
}


// NOUVEAU TYPE : Représente un cas clinique complet et structuré
export interface UseCase {
  id: string;
  serviceId: string;
  difficulty: 'Profane' | 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Expert';
  patient: Patient;
}
