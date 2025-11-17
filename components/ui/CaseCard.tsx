'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import type { UseCase, Service } from '@/types/simulation/types';
import { startCaseForUser } from '@/services/caseService'; // <-- Importer la fonction
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext'; // <-- AJOUT : Importer le hook d'authentification


interface CaseCardProps {
  useCase: UseCase;
  service?: Service;
}

// ✨ AMÉLIORATION : Palette de couleurs plus riche pour les badges de difficulté
const difficultyStyles: Record<string, { bg: string, text: string, border: string }> = {
  'Profane': { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-300/50' },
  'Débutant': { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-300/50' },
  'Intermédiaire': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-300/50' },
  'Confirmé': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-300/50' },
  'Expert': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-300/50' },
};

export function CaseCard({ useCase, service }: CaseCardProps) {
  const styles = difficultyStyles[useCase.difficulty] || difficultyStyles['Profane'];
  const { user } = useAuth();
  const router = useRouter(); // <-- Initialiser le routeur
  const handleStartCase = async () => {
    // AJOUT : Vérification pour s'assurer que l'utilisateur est bien connecté
    if (!user) {
        toast.error("Veuillez vous connecter pour lancer un cas.");
        router.push('/connexion');
        return;
    }

    const toastId = toast.loading("Lancement de la simulation...");
    try {
      // MODIFIÉ : On passe maintenant l'ID de l'utilisateur au service
      await startCaseForUser(useCase.id, user.id);
      
      router.push(`/simulation?caseId=${useCase.id}`);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error("Impossible de lancer le cas. Réessayez.", { id: toastId });
      console.error(error);
    }
  };
  return (
    <>
      {/* ✨ AMÉLIORATION : Balise <style> pour les animations personnalisées sans config tailwind */}
      <style jsx>{`
        @keyframes shine {
          from {
            transform: translateX(-100%) skewX(-20deg);
          }
          to {
            transform: translateX(200%) skewX(-20deg);
          }
        }

        .group-hover\\/button .animate-shine-on-hover {
          animation: shine 1.2s ease-out;
        }
      `}</style>
      
      {/* 
        ✨ AMÉLIORATION : 
        - `group` pour contrôler les animations sur les enfants
        - Effet d'élévation plus prononcé `hover:-translate-y-2`
      */}
      <div className="group relative transition-transform duration-300 ease-out hover:-translate-y-2">
        <Card className="h-full flex flex-col overflow-hidden bg-white/60 backdrop-blur-xl border-slate-200 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
          

          <CardContent className="p-6 flex-grow">
            {/* En-tête de la carte */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {service && (
                  // ✨ AMÉLIORATION : Icône 3D avec effet de "glow" au survol
                  <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-[#052648] to-[#0a4d8f] flex-shrink-0 flex items-center justify-center border-b-4 border-[#031a31] shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-cyan-400/30 group-hover:shadow-2xl">
                    <service.icon className="w-6 h-6 text-white transition-transform duration-300 group-hover:-rotate-12" />
                    <div className="absolute inset-0 bg-cyan-400 rounded-lg blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-[#052648]">{service?.name || 'Service'}</h3>
                  <p className="text-sm text-slate-500">{useCase.patient.nom}, {useCase.patient.age} ans</p>
                </div>
              </div>

              {/* ✨ AMÉLIORATION : Badge de difficulté "glassmorphism" */}
              <div className={`
                text-xs font-semibold px-3 py-1.5 rounded-md backdrop-blur-sm shadow-md border 
                transition-transform duration-300 group-hover:scale-110
                ${styles.bg} ${styles.text} ${styles.border}
              `}>
                {useCase.difficulty}
              </div>
            </div>
            
            {/* ✨ AMÉLIORATION : Section "Motif" avec hiérarchie visuelle claire */}
            <div className="relative mt-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1 pl-2">Motif de consultation :</p>
              <p className="font-semibold text-slate-800 leading-relaxed pl-2">
                {useCase.patient.motif}
              </p>
            </div>
          </CardContent>

          {/* ✨ AMÉLIORATION : CTA avec dégradé, animation et effet de brillance */}
          <CardFooter className="p-4 mt-auto">
                    {/* MODIFIÉ : <Link> est remplacé par <button> */}
                    <button 
                        onClick={handleStartCase}
                        className="relative group/button w-full h-12 flex items-center justify-center gap-2 text-base font-bold text-white rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-[#052648] to-[#0a4d8f] transition-all duration-300 ease-out hover:from-[#0a4d8f] hover:to-[#052648] hover:shadow-xl active:scale-95 transform"
                    >
                        <span className="z-10">Lancer le cas</span>
                        <ArrowRight className="z-10 w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                    </button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}