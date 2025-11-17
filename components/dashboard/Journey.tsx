// components/dashboard/Journey.tsx
'use client';

import React, { useMemo } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, Lock, Star, Home, Award, Shield, Trophy, Stethoscope, Thermometer, Brain, Wind, Milestone, HomeIcon } from 'lucide-react';
import type { Milestone as MilestoneType } from '@/types/dashboard/dashboard';
import { useAuth } from '@/contexts/AuthContext'; // Gardé pour une future utilisation

// --- DÉFINITIONS DE STYLE ET D'ICÔNES (INCHANGÉES) ---
const levelThemes = {
    0: { color: '#8B5CF6', icon: Home, borderColor: 'border-purple-500', ringColor: 'ring-purple-500/50', bgColor: 'bg-purple-500' },
    1: { color: '#3B82F6', icon: Star, borderColor: 'border-blue-500', ringColor: 'ring-blue-500/50', bgColor: 'bg-blue-500' },
    5: { color: '#10B981', icon: Award, borderColor: 'border-emerald-500', ringColor: 'ring-emerald-500/50', bgColor: 'bg-emerald-500' },
    10: { color: '#F97316', icon: Shield, borderColor: 'border-orange-500', ringColor: 'ring-orange-500/50', bgColor: 'bg-orange-500' },
    15: { color: '#F59E0B', icon: Trophy, borderColor: 'border-amber-500', ringColor: 'ring-amber-500/50', bgColor: 'bg-amber-500' },
};
const getMilestoneAppearance = (level: number) => {
    if (level >= 15) return levelThemes[15];
    if (level >= 10) return levelThemes[10];
    if (level >= 5) return levelThemes[5];
    if (level > 0) return levelThemes[1];
    return levelThemes[0];
};
const getMilestoneIcon = (level: number) => {
    if (level % 5 === 0 && level > 0) return Award;
    if (level === 0) return Home;
    const cycle = level % 4;
    switch (cycle) {
        case 1: return Stethoscope;
        case 2: return Thermometer;
        case 3: return Brain;
        default: return Star;
    }
};

// AJOUT : Liste des images décoratives
const decorationImages = [
    '/images/deco1.jpeg',
    '/images/deco2.jpeg',
    '/images/deco3.jpeg',
    '/images/deco4.jpeg',
];

// --- PROPS DU COMPOSANT ---
interface JourneyProps {
  allMilestones: MilestoneType[];
  userProgress: any[];
}

// --- LE COMPOSANT JOURNEY CORRIGÉ ---
const Journey: React.FC<JourneyProps> = ({ allMilestones, userProgress }) => {
    const router = useRouter();

    // On calcule la progression et on met à jour les statuts des jalons
    const { completedCount, milestonesWithStatus } = useMemo(() => {
        const count = userProgress.filter(p => p.status === 'completed' && (p.score || 0) >= 50).length;
        const updatedMilestones = allMilestones.map(milestone => ({
            ...milestone,
            status: milestone.level < count ? 'completed' : (milestone.level === count ? 'current' : 'locked'),
        }));
        return { completedCount: count, milestonesWithStatus: updatedMilestones };
    }, [userProgress, allMilestones]);
    
    // --- NOUVEAU : Génération dynamique des positions en zigzag ---
    const positions = useMemo(() => {
        const generatedPositions: { top: string, left: string }[] = [];
        const itemsPerRow = 5; // Nombre de jalons par "ligne"
        const rowHeight = 25; // Hauteur de chaque rangée en %
        const horizontalSpacing = 15; // Espacement horizontal entre les points en %
        const topY = 85; // Position Y de départ pour la première rangée (en bas)

        for (let i = 0; i < allMilestones.length; i++) {
            const rowIndex = Math.floor(i / itemsPerRow); // 0 pour la première rangée, 1 pour la deuxième...
            const indexInRow = i % itemsPerRow;

            let x: number;
            // La rangée 0 (la première) va de gauche à droite
            // La rangée 1 (la deuxième) va de droite à gauche, etc.
            if (rowIndex % 2 === 0) { // Gauche à droite
                x = 10 + (indexInRow * horizontalSpacing);
            } else { // Droite à gauche
                x = 10 + ((itemsPerRow - 1 - indexInRow) * horizontalSpacing);
            }

            const y = topY - (rowIndex * rowHeight);

            // Alternance pour l'effet zigzag vertical
            const zigzagOffset = (indexInRow % 2 === 0) ? 0 : -15; 
            
            generatedPositions.push({
                left: `${x}%`,
                top: `${y + zigzagOffset}%`
            });
        }
        return generatedPositions;

    }, [allMilestones.length]);

// --- Génération dynamique des positions des IMAGES dans les creux (Version Améliorée) ---
    const imagePositions = useMemo(() => {
        const positions: { top: string, left: string }[] = [];
        const itemsPerRow = 5; // Doit correspondre à la config des jalons
        
        // --- AJUSTEMENTS ICI ---
        const rowHeight = 30; // Un peu plus d'espacement vertical entre les rangées d'images
        const horizontalSpacing = 22; // Espacement horizontal plus grand pour les images
        const topY = 90; // Point de départ Y légèrement ajusté

        // On ne génère que quelques images pour ne pas surcharger, par exemple une toutes les deux étapes
        for (let i = 0; i < allMilestones.length - 1; i += 2) { // NOTE: i += 2
            const rowIndex = Math.floor(i / itemsPerRow);
            const indexInRow = i % itemsPerRow;
            let x;

            if (rowIndex % 2 === 0) { // Ligne va vers la droite
                x = 5 + (indexInRow * horizontalSpacing);
            } else { // Ligne va vers la gauche
                x = 15 + ((itemsPerRow - 1 - indexInRow) * horizontalSpacing);
            }

            const y = topY - (rowIndex * rowHeight);
            
            // On peut rendre l'offset du zigzag plus prononcé pour les images
            const zigzagOffset = (indexInRow % 2 === 0) ? -20 : 5; 
            
            positions.push({
                left: `${x}%`,
                top: `${y + zigzagOffset}%`
            });
        }
        return positions;
    }, [allMilestones.length]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm w-full animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Votre Parcours de Progression</h3>
            
            <div className="relative bg-transparent w-full aspect-[2/1] rounded-lg overflow-hidden border border-slate-200 p-4 md:p-8">
                
                {/* Formes décoratives flottantes (inchangées) */}
                <div className="absolute top-[10%] left-[20%] w-24 h-24 bg-blue-200 rounded-full opacity-30 filter blur-xl animate-pulse" />
                <div className="absolute top-[50%] left-[50%] w-32 h-32 bg-purple-200 rounded-full opacity-30 filter blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-[15%] right-[25%] w-20 h-20 bg-emerald-200 rounded-full opacity-30 filter blur-xl animate-pulse" style={{ animationDelay: '4s' }} />

                <svg className="absolute inset-0 z-0 w-full h-full" width="100%" height="100%">
                    <defs>
                        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                    </defs>

                    
                    
                    {milestonesWithStatus.map((_, index) => {
                        if (index === 0) return null; // Pas de ligne avant le premier point
                        const prevPos = positions[index - 1];
                        const currentPos = positions[index];

                        // --- AJOUT D'UNE SÉCURITÉ ---
                        // Ne rien dessiner si une des positions est manquante
                        if (!prevPos || !currentPos) return null;

                        const isPathCompleted = index < completedCount;

                        return (
                            <line 
                                key={`line-${index}`}
                                x1={prevPos.left} y1={prevPos.top} 
                                x2={currentPos.left} y2={currentPos.top}
                                stroke={isPathCompleted ? "url(#path-gradient)" : "#cbd5e1"}
                                strokeWidth="3"
                                strokeDasharray={isPathCompleted ? "0" : "5 5"}
                                className="transition-all duration-1000"
                            />
                        );
                    })}
                </svg>
                    
                {milestonesWithStatus.map((milestone, index) => {
                    const pos = positions[index];
                    
                    // --- AJOUT D'UNE SÉCURITÉ ---
                    // Ne pas afficher le jalon si sa position n'est pas définie
                    if (!pos) return null;

                    const theme = getMilestoneAppearance(milestone.level);
                    const Icon = milestone.status === 'completed' ? Check : milestone.status === 'current' ? (getMilestoneIcon(milestone.level) || Star) : Lock;
                    return (
                        <div key={milestone.id}
                            className="group absolute transition-all duration-500 ease-out z-10 hover:!scale-125 hover:z-20"
                            style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)', scale: milestone.status === 'current' ? '1.1' : '1' }}>
                            
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-300 ${
                                milestone.status === 'completed' ? `bg-white ${theme.borderColor}` : ''
                                } ${milestone.status === 'current' ? `${theme.bgColor} border-white ring-4 ${theme.ringColor} animate-pulse` : ''
                                } ${milestone.status === 'locked' ? 'bg-slate-200 border-slate-300 cursor-not-allowed' : ''
                            }`}>
                                {milestone.status === 'completed' && <Check size={22} style={{ color: theme.color }} />}
                                {milestone.status === 'current' && <HomeIcon size={24} className="text-white" />}
                                {milestone.status === 'locked' && <Lock size={20} className="text-slate-400" />}
                            </div>

                             <div className="absolute bottom-full mb-3 w-52 bg-slate-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                <h4 className="font-bold text-base border-b border-slate-600 pb-1.5 mb-1.5" style={{ color: theme.color }}>
                                    Niveau {milestone.level + 1}
                                </h4>
                                <p className="text-sm text-slate-200">{milestone.title}</p>
                                {milestone.status === 'locked' && <p className="text-xs text-center text-slate-400 mt-2">Terminez le niveau précédent</p>}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800"></div>
                             </div>
                        </div>
                    );
                })}

                {/* --- AJOUT : Affichage des images décoratives --- */}
                {imagePositions.map((pos, index) => (
                    <div 
                        key={`img-${index}`}
                        className="absolute transition-transform duration-500 ease-out group-hover:scale-105"
                        style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                    >
                       <NextImage
                           src={decorationImages[index % decorationImages.length]}
                           alt={`Decoration ${index + 1}`}
                           width={80}
                           height={80}
                           className=""
                           style={{ transform: `rotate(${(index * 35) % 360}deg)` }}
                       />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Journey;