'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
// Données statiques (seulement pour la liste des services, les icônes, etc.)
import { services } from '@/types/simulation/constant';
// Import des composants UI réutilisables
import { Button } from '@/components/ui/Button';
import { CaseCard } from '@/components/ui/CaseCard';
// CORRECTION IMPORT: fetchCases existe maintenant dans ce fichier
import { fetchCases } from '@/services/SimulationService';
import type { UseCase } from '@/types/simulation/types';
// AJOUT : Définition des props pour permettre l'utilisation depuis le Dashboard
interface LibraryProps {
allCases?: UseCase[];
userProgress?: any[]; // On accepte le tableau de progression (peut être typé plus strictement si le type est exporté)
}
/**
Le composant Bibliothèque affiche une grille de cas cliniques.
Il peut fonctionner en mode autonome (fetch ses données) ou recevoir les données via props.
*/
export default function Library({ allCases: propCases, userProgress }: LibraryProps = {}) {
const [selectedService, setSelectedService] = useState<'all' | string>('all');
// États pour la gestion des données
// Si des cas sont passés en props, on les utilise initialement
const [allCases, setAllCases] = useState<UseCase[]>(propCases || []);
// Si des cas sont fournis, on n'est pas en chargement
const [isLoading, setIsLoading] = useState(!propCases);
const [error, setError] = useState<string | null>(null);
// Mise à jour de l'état si les props changent (synchronisation)
useEffect(() => {
if (propCases) {
setAllCases(propCases);
setIsLoading(false);
}
}, [propCases]);
// Effet pour charger les cas au montage SI AUCUNE prop n'a été fournie
useEffect(() => {
// Si les données sont déjà fournies par le parent (Dashboard), on ne recharge pas.
if (propCases) return;
code
Code
let isMounted = true;

const loadCases = async () => {
  try {
    setIsLoading(true);
    // On récupère tous les cas via le service corrigé
    const casesFromDB = await fetchCases(); 
    
    if (isMounted) {
        setAllCases(casesFromDB || []);
    }
  } catch (e) {
    if (isMounted) {
        console.error("Erreur chargement bibliothèque:", e);
        setError("Impossible de charger la bibliothèque de cas.");
    }
  } finally {
    if (isMounted) setIsLoading(false);
  }
};

loadCases();

return () => { isMounted = false; };
}, [propCases]);
// Filtrage des cas
const filteredCases = useMemo(() => {
if (selectedService === 'all') {
return allCases;
}
return allCases.filter(c => c.serviceId === selectedService);
}, [selectedService, allCases]);
// --- RENDU ---
if (isLoading) {
return (
<div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 animate-pulse">
<Loader2 className="w-12 h-12 mb-4 text-[#052648] animate-spin" />
<p>Chargement de la bibliothèque...</p>
</div>
);
}
if (error) {
return (
<div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
<AlertCircle className="w-12 h-12 mb-4" />
<h3 className="text-xl font-bold mb-2">Erreur</h3>
<p>{error}</p>
<Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
Réessayer
</Button>
</div>
);
}
return (
<div className="space-y-12 animate-fade-in">
{/* En-tête de la page */}
<div className="text-center">
<h1 className="text-4xl font-bold text-primary mb-2">Bibliothèque de Cas Cliniques</h1>
<p className="text-lg text-slate-600 max-w-2xl mx-auto">
Parcourez {allCases.length} cas cliniques disponibles et perfectionnez vos compétences diagnostiques.
</p>
</div>
code
Code
{/* Filtres par service */}
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
        className="rounded-full shadow-sm transition-all hover:-translate-y-1"
      >
        <service.icon className="w-4 h-4 mr-2" />
        {service.name}
      </Button>
    ))}
  </div>
  
  {/* Grille des cas cliniques */}
  {filteredCases.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredCases.map(useCase => {
        const service = services.find(s => s.id === useCase.serviceId);
        return (
            <CaseCard 
                key={useCase.id} 
                useCase={useCase} 
                service={service} 
            />
        );
      })}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
       <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
       <p className="font-semibold text-slate-700 text-lg">Aucun cas disponible</p>
       <p className="text-sm text-slate-500 mt-1">
         Aucun cas clinique ne correspond au service "{services.find(s => s.id === selectedService)?.name}" pour le moment.
       </p>
       <Button onClick={() => setSelectedService('all')} variant="link" className="mt-4">
         Voir tous les autres cas
       </Button>
    </div>
  )}
</div>
);
}