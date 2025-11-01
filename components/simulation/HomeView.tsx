// components/simulation/HomeView.tsx
'use client';
import { Shuffle } from 'lucide-react';
import { services, difficultyLevels } from '@/types/simulation/constant';
import { Service } from '@/types/simulation/types';

interface HomeViewProps {
  difficulty: string;
  onDifficultyChange: (level: string) => void;
  onServiceSelect: (service: Service) => void;
  onRandomCase: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ difficulty, onDifficultyChange, onServiceSelect, onRandomCase }) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-primary text-center">Choisissez un service</h2>
      <p className="text-slate-600 text-center mb-6 text-sm">Sélectionnez une spécialité pour commencer un cas clinique.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {services.map(service => (
          <button key={service.id} onClick={() => onServiceSelect(service)}
            className="group relative aspect-square rounded-xl overflow-hidden text-white font-bold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-cover bg-center backdrop-blur-md scale-110 group-hover:blur-none transition-all duration-300" 
                 style={{backgroundImage: `url(${service.bgImage})`}}></div>
            <div className="absolute inset-0 bg-primary opacity-70 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="relative h-full flex flex-col items-center justify-center p-2 text-center">
              <service.icon className="w-8 h-8 mb-2 transform group-hover:scale-110 transition-transform duration-300"/>
              <span className="text-sm">{service.name}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mb-6">
         <p className="text-center text-sm text-slate-700 font-semibold mb-3">Niveau de difficulté</p>
         <div className="flex justify-center gap-2 flex-wrap">
           {difficultyLevels.map(level => (
             <button key={level} onClick={() => onDifficultyChange(level)}
               className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                 difficulty === level ? `bg-primary text-white shadow-md` : `bg-slate-200 text-slate-700 hover:bg-slate-300`
               }`}
             >{level}</button>
           ))}
         </div>
      </div>
      
      <button onClick={onRandomCase} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-300 flex items-center justify-center gap-2">
        <Shuffle className="w-5 h-5" />
        CAS ALÉATOIRE
      </button>
    </div>
  );
};

export default HomeView;