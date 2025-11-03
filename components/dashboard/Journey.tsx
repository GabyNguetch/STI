// components/dashboard/Journey.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
// Import des icônes thématiques
import { Check, Lock, Star, Home, Award, Shield, Trophy, Stethoscope, Thermometer, Brain, Wind, Milestone } from 'lucide-react';
import { milestones } from '@/types/dashboard/mockData'; // Assurez-vous d'importer vos données

// --- Section Thèmes et Apparence (inchangée) ---
const levelThemes = {
  0: { color: '#8B5CF6', icon: Home, borderColor: 'border-purple-500', ringColor: 'ring-purple-500/50', bgColor: 'bg-purple-500' },
  1: { color: '#3B82F6', icon: Star, borderColor: 'border-blue-500', ringColor: 'ring-blue-500/50', bgColor: 'bg-blue-500' },
  5: { color: '#10B981', icon: Award, borderColor: 'border-emerald-500', ringColor: 'ring-emerald-500/50', bgColor: 'bg-emerald-500' },
  10: { color: '#F97316', icon: Shield, borderColor: 'border-orange-500', ringColor: 'ring-orange-500/50', bgColor: 'bg-orange-500' },
  15: { color: '#F59E0B', icon: Trophy, borderColor: 'border-amber-500', ringColor: 'ring-amber-500/50', bgColor: 'bg-amber-500' },
};
const getMilestoneAppearance = (level: number) => {
  if (level === 15) return levelThemes[15];
  if (level >= 10) return levelThemes[10];
  if (level >= 5) return levelThemes[5];
  if (level > 0) return levelThemes[1];
  return levelThemes[0];
};

// --- Helper pour choisir l'icône de la borne (inchangée) ---
const getMilestoneIcon = (level: number) => {
  if (level % 5 === 0) return Home;
  const cycle = level % 5;
  switch (cycle) {
    case 1: return Stethoscope;
    case 2: return Thermometer;
    case 3: return Brain;
    case 4: return Wind;
    default: return Star;
  }
};


const Journey: React.FC = () => {
  const [pathPositions, setPathPositions] = useState<Array<{x: string, y: string}>>([]);
  const [pathLength, setPathLength] = useState(0); // NOUVEAU: Pour une barre de progression précise
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePositions = () => {
      if (pathRef.current) {
        const path = pathRef.current;
        const totalLength = path.getTotalLength();
        setPathLength(totalLength); // Stocke la longueur totale du chemin

        const positions = milestones.map((_, index) => {
          const distance = (totalLength / (milestones.length - 1)) * index;
          const point = path.getPointAtLength(distance);
          
          // Le viewBox du SVG est de 1400x700
          return {
            x: `${(point.x / 1400) * 100}%`,
            y: `${(point.y / 700) * 100}%`,
          };
        });
        setPathPositions(positions);
      }
    };
    
    // Un ResizeObserver est plus performant qu'un event listener sur window
    const observer = new ResizeObserver(calculatePositions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Le setTimeout permet de s'assurer que l'image et le DOM sont bien rendus
    const timer = setTimeout(calculatePositions, 50);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    }
  }, []);

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPercentage = (completedCount > 0 ? (completedCount - 1) / (milestones.length - 1) : 0) * 100;

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm w-full">

      {/* Le conteneur principal assure la responsivité grâce à l'aspect-ratio */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border border-slate-200"
      >
        {/* L'image de la carte en fond */}
        <Image
          src="/images/carte.jpg"
          alt="Carte du parcours d'apprentissage"
          layout="fill"
          objectFit="cover"
          priority
          className="z-0"
        />

        {/* Le SVG contient le chemin de fer et se superpose à l'image */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1400 700" // Un viewBox 2:1 qui correspond à l'image
          preserveAspectRatio="xMidYMid meet"
          className="absolute top-0 left-0 z-10"
        >
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" /><stop offset="25%" stopColor="#3B82F6" /><stop offset="50%" stopColor="#10B981" />
              <stop offset="75%" stopColor="#F97316" /><stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* ==================================================================== */}
          {/* NOUVEAU CHEMIN DE FER DESSINÉ POUR SUIVRE LES ROUTES DE LA CARTE      */}
          {/* ==================================================================== */}
          <path
            ref={pathRef}
            id="railway-path"
            d="M 120 540 C 250 480, 270 380, 420 390 C 580 400, 580 300, 710 280 C 850 260, 850 170, 750 130 C 650 90, 580 150, 530 220 C 470 300, 520 80, 680 70 C 850 60, 980 150, 1100 220 C 1220 290, 1270 210, 1330 250"
            fill="none"
          />

          {/* Rendu visuel de la voie ferrée */}
          {/* 1. La base de la voie, claire pour se fondre dans la route blanche */}
          <use href="#railway-path" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="8" strokeLinecap="round" />
          {/* 2. Les "traverses", plus sombres pour l'effet de relief */}
          <use href="#railway-path" stroke="rgba(0, 0, 0, 0.35)" strokeWidth="14" strokeDasharray="2 28" strokeLinecap="round" />
          
          {/* 3. La barre de progression colorée au-dessus */}
          <use
            href="#railway-path"
            stroke="url(#progress-gradient)"
            strokeWidth="7"
            strokeLinecap="round"
            className="transition-all duration-1500 ease-out"
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: pathLength - (pathLength * progressPercentage / 100),
            }}
          />
        </svg>

        {pathPositions.length === 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 text-slate-600 backdrop-blur-sm">
            Chargement du parcours...
          </div>
        )}

        {/* --- Affichage des Étapes (Milestones) --- */}
        {milestones.map((milestone, index) => {
          const position = pathPositions[index];
          if (!position) return null;

          const theme = getMilestoneAppearance(milestone.level);
          const IconComponent = getMilestoneIcon(milestone.level);

          return (
            <div
              key={milestone.id}
              className="group absolute transition-transform duration-300 hover:scale-125 hover:z-30 z-20"
              style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-300 ${
                  milestone.status === 'completed' ? `bg-white ${theme.borderColor}` : ''
                } ${
                  milestone.status === 'current' ? `${theme.bgColor} border-white ring-4 ${theme.ringColor} animate-pulse` : ''
                } ${
                  milestone.status === 'locked' ? 'bg-slate-200 border-slate-300 cursor-not-allowed' : ''
                }`}
              >
                {milestone.status === 'completed' && <Milestone size={22} style={{ color: theme.color }} />}
                {milestone.status === 'current' && <IconComponent size={22} className="text-white" />}
                {milestone.status === 'locked' && <Lock size={20} className="text-slate-400" />}
              </div>

              {/* Le Tooltip (inchangé) */}
              <div className="absolute bottom-full mb-4 w-52 bg-slate-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                <h4 className="font-bold text-base border-b border-slate-600 pb-1.5 mb-1.5" style={{ color: theme.color }}>
                  Niveau {milestone.level}
                </h4>
                <p className="text-sm text-slate-200 mb-2">{milestone.title}</p>
                {milestone.score !== null && (
                  <p className="text-xl font-bold text-center bg-slate-700/50 py-1 rounded-md" style={{ color: milestone.score >= 10 ? '#6EE7B7' : '#F87171' }}>
                    {milestone.score} / 20
                  </p>
                )}
                {milestone.status === 'locked' && (
                  <p className="text-xs text-center text-slate-400">À débloquer</p>
                )}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Journey;