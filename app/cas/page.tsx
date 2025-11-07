// app/cas/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

// Importez vos données et types
import { services, useCases } from '@/types/simulation/constant';
import { UseCase, Service } from '@/types/simulation/types';

// Navbar et Footer pour une page complète
import Navbar from '../components/layout/Navbar'; // Assurez-vous que le chemin est correct
import Footer from '../components/layout/Footer'; // Assurez-vous que le chemin est correct

/**
 * Une carte représentant un seul cas clinique dans la bibliothèque.
 */
const CaseCard = ({ useCase, service }: { useCase: UseCase, service?: Service }) => {
  // Définir une couleur de badge en fonction de la difficulté
  const difficultyColors: Record<string, string> = {
    'Profane': 'bg-gray-200 text-gray-800',
    'Débutant': 'bg-green-100 text-green-800',
    'Intermédiaire': 'bg-blue-100 text-blue-800',
    'Confirmé': 'bg-yellow-100 text-yellow-800',
    'Expert': 'bg-red-100 text-red-800',
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="p-6 flex-grow">
        {/* En-tête de la carte */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {service && (
              <div className="w-10 h-10 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center">
                <service.icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-primary">{service?.name || 'Service'}</h3>
              <p className="text-xs text-slate-500">{useCase.patient.nom}, {useCase.patient.age} ans</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColors[useCase.difficulty] || 'bg-gray-100'}`}>
            {useCase.difficulty}
          </span>
        </div>
        
        {/* Contenu principal */}
        <div className="space-y-2">
          <p className="text-sm text-slate-500">Motif de consultation :</p>
          <p className="font-semibold text-slate-700 leading-relaxed">
            "{useCase.patient.motif}"
          </p>
        </div>
      </div>

      {/* Pied de carte avec l'appel à l'action */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/50 rounded-b-xl">
        <Link href="/simulation" className="group flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors">
          Lancer le cas
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};


/**
 * La page principale affichant la bibliothèque de tous les cas cliniques.
 */
export default function CasLibraryPage() {
  const [selectedService, setSelectedService] = useState<'all' | string>('all');

  const filteredCases = useMemo(() => {
    if (selectedService === 'all') {
      return useCases;
    }
    return useCases.filter(c => c.serviceId === selectedService);
  }, [selectedService]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Intégrez votre Navbar et Footer si ce sont des composants séparés */}
      {/* <Navbar /> */}
      
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* En-tête de la page */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-700 rounded-2xl shadow-lg mb-4">
               <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-2">Bibliothèque de Cas Cliniques</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Parcourez, filtrez et sélectionnez un cas pour parfaire vos compétences diagnostiques.
            </p>
          </div>
          
          {/* Filtres par service */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedService('all')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                selectedService === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Tous les cas
            </button>
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-2 ${
                  selectedService === service.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <service.icon className="w-4 h-4" />
                {service.name}
              </button>
            ))}
          </div>
          
          {/* Grille des cas cliniques */}
          {filteredCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map(useCase => {
                const service = services.find(s => s.id === useCase.serviceId);
                return <CaseCard key={useCase.id} useCase={useCase} service={service} />;
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm border">
               <p className="font-semibold text-primary">Aucun cas clinique trouvé</p>
               <p className="text-sm text-slate-500 mt-1">Aucun cas ne correspond au service sélectionné.</p>
            </div>
          )}
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}