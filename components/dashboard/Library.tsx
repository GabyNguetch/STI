'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';

// Données et types
import { services, useCases } from '@/types/simulation/constant';

// Import des composants UI réutilisables
import { Button } from '@/components/ui/Button';
import { CaseCard } from '@/components/ui/CaseCard';

/**
 * Le composant Bibliothèque affiche une grille de cas cliniques
 * avec des options de filtrage par service.
 */
export default function Library() {
  const [selectedService, setSelectedService] = useState<'all' | string>('all');

  const filteredCases = useMemo(() => {
    if (selectedService === 'all') {
      return useCases;
    }
    return useCases.filter(c => c.serviceId === selectedService);
  }, [selectedService]);

  return (
    <div className="space-y-12">
      {/* En-tête de la page */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl shadow-lg mb-4">
           <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">Bibliothèque de Cas Cliniques</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Parcourez, filtrez et sélectionnez un cas pour parfaire vos compétences diagnostiques.
        </p>
      </div>
      
      {/* Filtres par service avec le composant Button */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => setSelectedService('all')}
          variant={selectedService === 'all' ? 'default' : 'outline'}
          className="rounded-full shadow-sm"
        >
          Tous les cas
        </Button>
        {services.map(service => (
          <Button
            key={service.id}
            onClick={() => setSelectedService(service.id)}
            variant={selectedService === service.id ? 'default' : 'outline'}
            className="rounded-full shadow-sm"
          >
            <service.icon className="w-4 h-4 mr-2" />
            {service.name}
          </Button>
        ))}
      </div>
      
      {/* Grille des cas cliniques avec le composant CaseCard importé */}
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
  );
}