// lib/mockData.ts
import { DashboardData } from "@/types/dashboard/dashboard";
import { Milestone } from "@/types/dashboard/dashboard";
export const MOCK_DASHBOARD_DATA: DashboardData = {
  user: {
    id: 'user_123',
    firstName: 'Alex',
    lastName: 'Morel',
    email: 'alex.morel@etudiant.med',
    dateOfBirth: '1998-07-22',
    gender: 'Masculin',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  },
  stats: {
    casesCompleted: 24,
    successRate: 75, // en pourcentage
    currentLevel: 'Interne Débutant',
  },
  cases: [
    { id: 'case_01', title: 'Syndrome coronarien aigu', specialty: 'Cardiologie', dateCompleted: '2023-10-15', score: 92, status: 'réussi' },
    { id: 'case_02', title: 'Pneumonie aiguë chez l\'enfant', specialty: 'Pédiatrie', dateCompleted: '2023-10-12', score: 45, status: 'échec' },
    { id: 'case_03', title: 'Gestion d\'une crise d\'asthme', specialty: 'Pneumologie', dateCompleted: '2023-10-10', score: 85, status: 'réussi' },
    { id: 'case_04', title: 'Otite moyenne aiguë', specialty: 'ORL', dateCompleted: '2023-10-08', score: 78, status: 'réussi' },
    { id: 'case_05', title: 'Diagnostic de la méningite', specialty: 'Neurologie', dateCompleted: '2023-10-05', score: 55, status: 'échec' },
  ],
};

export const milestones: Milestone[] = [
  { id: 0, level: 0, title: 'Début de l\'aventure', status: 'completed', score: 20, position: { x: '5%', y: '85%' } },
  // Segment 1
  { id: 1, level: 1, title: 'Introduction à la Cardiologie', status: 'completed', score: 18, position: { x: '5%', y: '15%' } },
  { id: 2, level: 2, title: 'Anatomie du Cœur', status: 'completed', score: 15, position: { x: '18%', y: '25%' } },
  { id: 3, level: 3, title: 'ECG : Les Bases', status: 'completed', score: 19, position: { x: '10%', y: '40%' } },
  { id: 4, level: 4, title: 'Valvulopathies', status: 'completed', score: 14, position: { x: '22%', y: '55%' } },
  { id: 5, level: 5, title: 'Insuffisance Cardiaque', status: 'current', score: null, position: { x: '12%', y: '70%' } },
  // Segment 2
  { id: 6, level: 6, title: 'Cas Clinique : Infarctus', status: 'locked', score: null, position: { x: '35%', y: '80%' } },
  { id: 7, level: 7, title: 'Pharmacologie Cardiovasculaire', status: 'locked', score: null, position: { x: '48%', y: '70%' } },
  { id: 8, level: 8, title: 'Arythmies', status: 'locked', score: null, position: { x: '40%', y: '50%' } },
  { id: 9, level: 9, title: 'Imagerie Cardiaque', status: 'locked', score: null, position: { x: '52%', y: '35%' } },
  { id: 10, level: 10, title: 'Cas Clinique : HTA', status: 'locked', score: null, position: { x: '45%', y: '20%' } },
  // Segment 3
  { id: 11, level: 11, title: 'Cardiopathies Congénitales', status: 'locked', score: null, position: { x: '65%', y: '15%' } },
  { id: 12, level: 12, title: 'Prévention Cardiovasculaire', status: 'locked', score: null, position: { x: '78%', y: '28%' } },
  { id: 13, level: 13, title: 'Urgences Cardiologiques', status: 'locked', score: null, position: { x: '70%', y: '45%' } },
  { id: 14, level: 14, title: 'Synthèse Clinique', status: 'locked', score: null, position: { x: '82%', y: '60%' } },
  { id: 15, level: 15, title: 'Examen Final de Cardiologie', status: 'locked', score: null, position: { x: '95%', y: '75%' } },
];