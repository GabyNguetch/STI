// components/dashboard/Journey.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import NextImage from 'next/image';
import { Check, Lock, Star, Home, Award, Shield, Trophy, Stethoscope, Thermometer, Brain, HomeIcon } from 'lucide-react';
import type { Milestone as MilestoneType } from '@/types/dashboard/dashboard';

// --- DÉFINITIONS DE STYLE ET D'ICÔNES ---
const levelThemes = {
    0: { color: '#8B5CF6', icon: Home, borderColor: 'border-purple-500', ringColor: 'ring-purple-500/50', bgColor: 'bg-purple-500', glow: 'shadow-purple-500/50' },
    1: { color: '#3B82F6', icon: Star, borderColor: 'border-blue-500', ringColor: 'ring-blue-500/50', bgColor: 'bg-blue-500', glow: 'shadow-blue-500/50' },
    5: { color: '#10B981', icon: Award, borderColor: 'border-emerald-500', ringColor: 'ring-emerald-500/50', bgColor: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
    10: { color: '#F97316', icon: Shield, borderColor: 'border-orange-500', ringColor: 'ring-orange-500/50', bgColor: 'bg-orange-500', glow: 'shadow-orange-500/50' },
    15: { color: '#F59E0B', icon: Trophy, borderColor: 'border-amber-500', ringColor: 'ring-amber-500/50', bgColor: 'bg-amber-500', glow: 'shadow-amber-500/50' },
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

const decorationImages = [
    '/images/deco1.jpeg',
    '/images/deco2.jpeg',
    '/images/deco3.jpeg',
    '/images/deco4.jpeg',
];

interface JourneyProps {
  allMilestones: MilestoneType[];
  userProgress: any[];
}

const Journey: React.FC<JourneyProps> = ({ allMilestones, userProgress }) => {
    // État pour hydrater le rendu client (évite les erreurs de différence server/client sur les aléatoires)
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const { completedCount, milestonesWithStatus } = useMemo(() => {
        const count = userProgress.filter(p => p.status === 'completed' && (p.score || 0) >= 50).length;
        const updatedMilestones = allMilestones.map(milestone => ({
            ...milestone,
            status: milestone.level < count ? 'completed' : (milestone.level === count ? 'current' : 'locked'),
        }));
        return { completedCount: count, milestonesWithStatus: updatedMilestones };
    }, [userProgress, allMilestones]);
    
    // --- Calcul des positions des POINTS (ZigZag) ---
    const positions = useMemo(() => {
        const generatedPositions: { top: string, left: string }[] = [];
        const itemsPerRow = 5;
        const rowHeight = 25; 
        const horizontalSpacing = 16; 
        const topY = 82; 

        for (let i = 0; i < allMilestones.length; i++) {
            const rowIndex = Math.floor(i / itemsPerRow);
            const indexInRow = i % itemsPerRow;
            let x;
            
            // Zigzag : Une rangée vers la droite, l'autre vers la gauche
            if (rowIndex % 2 === 0) { 
                x = 10 + (indexInRow * horizontalSpacing);
            } else { 
                x = 10 + ((itemsPerRow - 1 - indexInRow) * horizontalSpacing);
            }

            const y = topY - (rowIndex * rowHeight);
            
            // Léger décalage vertical alterné pour casser la rigidité de la grille
            const zigzagOffset = (indexInRow % 2 === 0) ? 0 : -8; 

            generatedPositions.push({
                left: `${x}%`,
                top: `${y + zigzagOffset}%`
            });
        }
        return generatedPositions;
    }, [allMilestones.length]);

    // --- Calcul des positions des IMAGES (Entre les points) ---
    const decorationData = useMemo(() => {
        const decorations = [];
        const itemsPerRow = 5;
        
        // Placement dans les creux, espacé plus largement
        for (let i = 0; i < allMilestones.length - 2; i += 2) { 
            const rowIndex = Math.floor(i / itemsPerRow);
            const indexInRow = i % itemsPerRow;
            
            // Calcul position (similaire au zigzag mais décalé pour être entre les noeuds)
            let x;
            if (rowIndex % 2 === 0) {
                 // On décale légèrement pour que l'image ne soit pas sur la ligne
                x = 18 + (indexInRow * 16); 
            } else {
                x = 18 + ((itemsPerRow - 1 - indexInRow) * 16);
            }

            // Décalage vertical spécifique pour être en "fond"
            const y = 82 - (rowIndex * 25) - 15; 
            
            // Propriétés aléatoires pour l'animation (shine, blink, glow)
            // Utilisation d'un pseudo-aléatoire basé sur l'index pour rester cohérent lors du rendu
            const animationDelay = (i * 0.5) % 3; // Décalage pour qu'elles ne clignotent pas ensemble
            const animationType = i % 3; // 0: pulse slow, 1: brightness, 2: float

            decorations.push({
                left: `${x}%`,
                top: `${y}%`,
                imgIndex: i % decorationImages.length,
                animationDelay,
                animationType
            });
        }
        return decorations;
    }, [allMilestones.length]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm w-full animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Votre Parcours</h3>
            
            {/* Conteneur principal du chemin */}
            <div className="relative bg-slate-50/50 w-full min-h-[500px] md:aspect-[2/1] rounded-xl overflow-hidden border border-slate-100 p-4 shadow-inner">
                
                {/* 1. ARRIÈRE-PLAN: Blobs flous (Z-Index 0) */}
                <div className="absolute top-[10%] left-[20%] w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-pulse delay-75 pointer-events-none" />
                <div className="absolute bottom-[20%] right-[10%] w-40 h-40 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />
                
                {/* 2. ARRIÈRE-PLAN: SVG Connecteurs (Lignes) (Z-Index 1) */}
                <svg className="absolute inset-0 z-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                        {/* Filtre pour effet néon sur la ligne */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {milestonesWithStatus.map((_, index) => {
                        if (index === 0) return null;
                        const prevPos = positions[index - 1];
                        const currentPos = positions[index];
                        if (!prevPos || !currentPos) return null;

                        const isPathCompleted = index < completedCount;

                        return (
                            <line 
                                key={`line-${index}`}
                                x1={prevPos.left} y1={prevPos.top} 
                                x2={currentPos.left} y2={currentPos.top}
                                stroke={isPathCompleted ? "url(#path-gradient)" : "#e2e8f0"}
                                strokeWidth={isPathCompleted ? "4" : "3"}
                                strokeDasharray={isPathCompleted ? "0" : "8 8"}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-in-out"
                                style={isPathCompleted ? { filter: 'url(#glow)' } : {}}
                            />
                        );
                    })}
                </svg>

                {/* 3. DÉCORATION: Images qui brillent (Z-Index 2 - Au dessus des lignes mais sous les points) */}
                {mounted && decorationData.map((deco, index) => (
                    <div 
                        key={`deco-${index}`}
                        className="absolute w-20 h-20 pointer-events-none flex items-center justify-center z-0"
                        style={{ 
                            top: deco.top, 
                            left: deco.left, 
                            transform: 'translate(-50%, -50%)', // Centrage précis
                        }}
                    >
                         {/* Wrapper pour l'animation (Brightness / Shine / Pulse) */}
                         <div 
                            className="relative w-full h-full rounded-full overflow-hidden transition-all duration-1000 ease-in-out"
                            style={{
                                animation: deco.animationType === 0 
                                    ? `pulse-glow 4s infinite ${deco.animationDelay}s ease-in-out` // Pulse lente
                                    : deco.animationType === 1 
                                        ? `flash-bright 6s infinite ${deco.animationDelay}s`  // Flash éclatant
                                        : `float-mini 5s infinite ${deco.animationDelay}s ease-in-out` // Flottement
                            }}
                         >
                            {/* Halo lumineux derrière l'image */}
                            <div className="absolute inset-0 bg-white/40 blur-lg mix-blend-overlay"></div>

                            <NextImage
                                src={decorationImages[deco.imgIndex]}
                                alt="Décoration parcours"
                                width={60}
                                height={60}
                                className="object-contain opacity-90 mix-blend-multiply filter contrast-125"
                                // Suppression de la rotation
                            />
                         </div>
                         
                         {/* Petite étoile scintillante ajoutée sur le côté de l'image */}
                         <div 
                             className="absolute top-0 right-0 w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.8)] animate-ping" 
                             style={{ animationDuration: '3s', animationDelay: `${deco.animationDelay}s` }}
                         />
                    </div>
                ))}
                    
                {/* 4. PREMIER PLAN: Jalons interactifs (Z-Index 10) */}
                {milestonesWithStatus.map((milestone, index) => {
                    const pos = positions[index];
                    if (!pos) return null;

                    const theme = getMilestoneAppearance(milestone.level);
                    // Déterminer l'icône et le style
                    let Icon = Lock;
                    let iconClass = "text-slate-400";
                    let glowEffect = "";

                    if (milestone.status === 'completed') {
                        Icon = Check;
                        iconClass = `text-[${theme.color}]`;
                    } else if (milestone.status === 'current') {
                        Icon = getMilestoneIcon(milestone.level) || Star;
                        iconClass = "text-white";
                        glowEffect = theme.glow;
                    } else {
                        // Icone normale mais verrouillée
                        Icon = getMilestoneIcon(milestone.level);
                    }

                    return (
                        <div key={milestone.id}
                            className="group absolute transition-all duration-500 z-10"
                            style={{ 
                                top: pos.top, 
                                left: pos.left, 
                                transform: milestone.status === 'current' 
                                    ? 'translate(-50%, -50%) scale(1.15)' 
                                    : 'translate(-50%, -50%) scale(1)' 
                            }}>
                            
                            {/* Effet "Onde" pour le niveau actuel */}
                            {milestone.status === 'current' && (
                                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${theme.bgColor}`}></span>
                            )}

                            {/* Le Cercle (Bouton) */}
                            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 ${glowEffect} ${
                                milestone.status === 'completed' 
                                    ? `bg-white ${theme.borderColor} cursor-pointer hover:border-slate-800` 
                                    : milestone.status === 'current' 
                                        ? `${theme.bgColor} border-white ring-2 ${theme.ringColor}` 
                                        : 'bg-slate-100 border-slate-300 opacity-80 cursor-not-allowed'
                                } hover:scale-105`}>
                                
                                <Icon size={milestone.status === 'current' ? 24 : 20} className={iconClass} style={milestone.status === 'completed' ? {color: theme.color} : {}} />
                            </div>

                             {/* Tooltip / Info-bulle */}
                             <div className="absolute bottom-full mb-3 w-48 bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0 z-50 border border-slate-700">
                                <h4 className="font-bold text-sm border-b border-slate-700 pb-1 mb-1" style={{ color: theme.color }}>
                                    Niveau {milestone.level + 1}
                                </h4>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed">{milestone.title}</p>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-3 h-3 bg-slate-900 rotate-45 border-b border-r border-slate-700"></div>
                             </div>
                        </div>
                    );
                })}
            </div>

            {/* Styles globaux pour les animations personnalisées */}
            <style jsx global>{`
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); filter: brightness(100%); }
                    50% { opacity: 0.9; transform: scale(1.05); filter: brightness(120%); }
                }
                @keyframes flash-bright {
                    0%, 100% { filter: brightness(100%) drop-shadow(0 0 0px rgba(255,255,255,0)); }
                    10%, 15% { filter: brightness(150%) drop-shadow(0 0 10px rgba(255,255,255,0.8)); }
                    20% { filter: brightness(100%); }
                }
                @keyframes float-mini {
                    0%, 100% { transform: translateY(0); opacity: 0.6; }
                    50% { transform: translateY(-5px); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default Journey;