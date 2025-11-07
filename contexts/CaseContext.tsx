// contexts/CaseContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ExpertUseCase } from '@/types/expert/types';
import { pendingCases as initialPendingCases } from '@/types/expert/constant'; // Données initiales

// Définir la structure du contexte
interface CaseContextType {
  cases: ExpertUseCase[];
  approveCase: (caseId: string) => void;
  rejectCase: (caseId: string, feedback: string) => void;
  getCaseById: (caseId: string) => ExpertUseCase | undefined;
}

// Créer le contexte avec une valeur par défaut (pour l'autocomplétion)
const CaseContext = createContext<CaseContextType | undefined>(undefined);

// Créer le fournisseur (Provider) qui contiendra la logique
export const CaseProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = useState<ExpertUseCase[]>(initialPendingCases);

  const getCaseById = (caseId: string): ExpertUseCase | undefined => {
    return cases.find(c => c.id === caseId);
  };

  const approveCase = (caseId: string) => {
    setCases(prevCases => 
      prevCases.map(c => 
        c.id === caseId ? { ...c, status: 'approved' } : c
      )
    );
    console.log(`Case ${caseId} approved.`);
  };

  const rejectCase = (caseId: string, feedback: string) => {
    setCases(prevCases => 
      prevCases.map(c => 
        c.id === caseId ? { ...c, status: 'rejected', feedback } : c
      )
    );
    console.log(`Case ${caseId} rejected with feedback: ${feedback}`);
  };

  return (
    <CaseContext.Provider value={{ cases, approveCase, rejectCase, getCaseById }}>
      {children}
    </CaseContext.Provider>
  );
};

// Créer un hook personnalisé pour utiliser facilement le contexte
export const useCases = (): CaseContextType => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
};