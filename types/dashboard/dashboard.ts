// types/dashboard.ts
import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: 'Masculin' | 'Féminin' | 'Autre';
  profilePictureUrl: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  specialty: string;
  dateCompleted: string;
  score: number; // Score de 0 à 100
  status: 'réussi' | 'échec';
}

export interface Stats {
  casesCompleted: number;
  successRate: number;
  currentLevel: string;
}

export interface DashboardData {
  user: User;
  stats: Stats;
  cases: ClinicalCase[];
}

export interface NavItem {
  id: 'overview' | 'journey' | 'redo' | 'settings'| 'lib';
  label: string;
  icon: LucideIcon;
}

// types/dashboard.ts (à ajouter)

export interface Milestone {
  id: number;
  level: number;
  title: string;
  status: 'completed' | 'current' | 'locked';
  score: number | null; // Score sur 20
  position: {
    x: string; // En pourcentage pour le positionnement responsive
    y: string;
  };
}