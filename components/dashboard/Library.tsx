// components/dashboard/Library.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Play, Clock, Sparkles, Brain, 
  Stethoscope, Activity, FileText, ArrowRight,
  Filter, Calendar, Hash,
  Heart,
  Wind,
  Baby,
  Bone,
  Eye,
  Bug,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

// Services & Types
import { getAllClinicalCases } from '@/services/expertService';
import { BackendClinicalCaseSimple } from '@/types/backend';
import { Skeleton } from '@/components/ui/Skeleton';

// Catégories statiques pour le filtre
const CATEGORIES = ["Tous", "Cardiologie", "Pneumologie", "Infectiologie", "Urgences", "Pédiatrie", "Traumatologie", "Neurologie"];

export default function Library({ user }: { user?: any }) {
  const router = useRouter();
  
  // États
  const [exercises, setExercises] = useState<BackendClinicalCaseSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("Tous");

  // Initialisation
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const data = await getAllClinicalCases(); 
        setExercises(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger la bibliothèque de cas.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- LOGIQUE FILTRAGE ---
  const filteredList = useMemo(() => {
    return exercises.filter(ex => {
       const searchMatch = 
          // On filtre sur le Code ou la Categorie uniquement pour ne pas spoiler
          (ex.code_fultang || '').toLowerCase().includes(search.toLowerCase()) || 
          (ex.pathologie_principale?.categorie || '').toLowerCase().includes(search.toLowerCase());
       
       const catMatch = filterDomain === "Tous" || (ex.pathologie_principale?.categorie || "Autre").includes(filterDomain);
       return searchMatch && catMatch;
    });
  }, [exercises, search, filterDomain]);

  // Récupération du cas mis en avant (Le premier de la liste filtrée, ou le premier global)
  const featuredCase = exercises.length > 0 ? exercises[0] : null;

  // --- LANCEMENT SIMULATION ---
  const handleLaunchCase = async (caseId: number) => {
    // Si l'utilisateur n'est pas passé via props, on suppose qu'il est connecté ou on vérifie via localStorage dans le contexte plus haut.
    // Cette vérification dépend de votre architecture, ici c'est safe.
      const t = toast.loading("Ouverture du dossier patient...");
      try {
          router.push(`/simulation?caseId=${caseId}`);
          toast.dismiss(t);
      } catch(e) {
          toast.error("Erreur technique lors du lancement", { id: t });
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
       
       {/* 1. HERO SECTION (Recommandation) avec Pattern Pointillé */}
       {loading ? (
         <Skeleton className="h-64 w-full rounded-3xl" />
       ) : featuredCase && (
         <div className="relative rounded-3xl bg-[#052648] text-white shadow-xl overflow-hidden group border border-[#0a4d8f]">
            
            {/* Pattern Pointillé (CSS Background) */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#052648] via-[#052648]/90 to-transparent z-0"></div>

            <div className="relative z-10 p-8 md:p-12 max-w-3xl flex flex-col items-start justify-center h-full">
               
               <div className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-blue-200 border border-white/20 text-xs font-bold uppercase tracking-wider">
                   <Sparkles size={14} className="text-yellow-400"/> Recommandation du jour
               </div>

               <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight tracking-tight">
                   Cas clinique : <span className="text-blue-300">{featuredCase.pathologie_principale?.categorie || "Médecine Générale"}</span>
               </h2>
               
               <div className="flex items-center gap-6 mb-8 text-slate-300 font-mono text-sm">
                  <span className="flex items-center gap-2">
                     <Hash size={16} /> Code: <span className="text-white">{featuredCase.code_fultang}</span>
                  </span>
                  <span className="flex items-center gap-2">
                      <Activity size={16}/> Difficulté: <span className="text-white">Niveau {featuredCase.niveau_difficulte}</span>
                  </span>
               </div>

               <button 
                  onClick={() => handleLaunchCase(featuredCase.id)}
                  className="group bg-white text-[#052648] px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-white/20 flex items-center gap-3 transform hover:-translate-y-0.5 active:scale-95"
               >
                  <Play size={20} fill="currentColor"/> Commencer ce cas
               </button>
            </div>
            
            {/* Illustration abstraite droite */}
            <div className="absolute right-[-50px] bottom-[-50px] text-white opacity-5 rotate-12 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-1000 hidden md:block">
               <Stethoscope size={400} strokeWidth={1.5} />
            </div>
         </div>
       )}

       {/* 2. BARRE D'OUTILS (Filtres) */}
       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sticky top-0 bg-[#F3F6F8]/90 backdrop-blur-md z-20 py-4 -mx-4 px-4 border-b border-slate-200/50 md:rounded-b-2xl">
           <div>
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <Brain className="text-[#052648]"/> Dossiers Disponibles
               </h3>
               <p className="text-sm text-slate-500 mt-0.5">{filteredList.length} situations d'entraînement prêtes.</p>
           </div>

           <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
               {/* Recherche */}
               <div className="relative group w-full sm:w-72">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4"/>
                   <input 
                      type="text" 
                      placeholder="Code ou Service (ex: cardio...)" 
                      value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#052648]/10 focus:border-[#052648] shadow-sm transition-all"
                   />
               </div>
               
               {/* Filtre Categorie */}
               <div className="relative w-full sm:w-48">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                 <select 
                   value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#052648]/10 focus:border-[#052648] shadow-sm cursor-pointer appearance-none hover:bg-slate-50 transition-colors"
                 >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
           </div>
       </div>

       {/* 3. GRILLE DES CAS (5 colonnes) */}
       {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1,2,3,4,5,6,7,8,9,10].map(i => <Skeleton key={i} className="h-64 rounded-2xl bg-white/60"/>)}
           </div>
       ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 auto-rows-[1fr]">
              {filteredList.map((c, index) => (
                  <CaseCardSimple key={c.id} data={c} onLaunch={() => handleLaunchCase(c.id)} index={index} />
              ))}
              
              {filteredList.length === 0 && (
                  <div className="col-span-full py-24 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-slate-400"/>
                      </div>
                      <h3 className="text-slate-600 font-semibold text-lg">Aucun cas trouvé</h3>
                      <p className="text-slate-400 text-sm mt-1">Essayez de modifier vos filtres.</p>
                  </div>
              )}
           </div>
       )}

    </div>
  );
}


// --------------------------------------------------------
// SOUS-COMPOSANT : Carte Minimaliste & Fluide
// --------------------------------------------------------
function CaseCardSimple({ data, onLaunch, index }: { data: BackendClinicalCaseSimple, onLaunch: () => void, index: number }) {
    
    // 1. Configuration Niveau & Couleurs
    const getLevelConfig = (lvl: number) => {
        if(lvl <= 10) return { label: "Débutant", color: "bg-emerald-500", text: "text-emerald-700", bgLight: "bg-emerald-50", border: "border-emerald-100" };
        if(lvl <= 20) return { label: "Intermédiaire", color: "bg-blue-500", text: "text-blue-700", bgLight: "bg-blue-50", border: "border-blue-100" };
        return { label: "Avancé", color: "bg-amber-500", text: "text-amber-700", bgLight: "bg-amber-50", border: "border-amber-100" };
    }

    // 2. Détermination de l'icône de Service
    const getServiceIcon = (cat: string) => {
        const c = cat.toLowerCase();
        if(c.includes('cardio')) return Heart;
        if(c.includes('pneumo')) return Wind;
        if(c.includes('neuro')) return Brain;
        if(c.includes('pediatrie') || c.includes('pédiatrie')) return Baby;
        if(c.includes('ortho') || c.includes('trauma')) return Bone;
        if(c.includes('ophtalmo')) return Eye;
        if(c.includes('infectio') || c.includes('virale')) return Bug;
        if(c.includes('urgence')) return Zap;
        return Activity; // Icône par défaut
    };

    const levelInfo = getLevelConfig(data.niveau_difficulte);
    const category = data.pathologie_principale?.categorie || "Général";
    const CategoryIcon = getServiceIcon(category);

    return (
        <div 
           onClick={onLaunch}
           className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
           style={{ animationDelay: `${index * 75}ms` }} 
        >
            {/* Indicateur visuel coloré (Top Bar) */}
            <div className={`absolute top-0 inset-x-0 h-1 ${levelInfo.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out`}></div>

            {/* HEADER : Icone + Service */}
            <div className="flex items-start justify-between mb-3">
                <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center 
                    bg-slate-50 text-slate-400 group-hover:bg-[#052648] group-hover:text-white 
                    transition-all duration-300 shadow-sm
                `}>
                   <CategoryIcon size={20} className="transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Niveau de Difficulté */}
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${levelInfo.bgLight} ${levelInfo.text} ${levelInfo.border}`}>
                    {levelInfo.label} ({data.niveau_difficulte})
                </span>
            </div>
            
            {/* BODY : Identifiant FullTang */}
            <div className="flex-1 flex flex-col justify-center mb-2">
                 <h4 className="text-xl font-extrabold text-[#052648] font-mono tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                    {data.code_fultang}
                </h4>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">
                    Service: {category}
                </p>
            </div>
            
            {/* SEPARATEUR DISCRET */}
            <div className="h-px w-full bg-slate-50 my-3 group-hover:bg-blue-50 transition-colors"></div>

            {/* FOOTER : Date & CTA */}
            <div className="flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-500 transition-colors">
                     <Calendar size={12}/>
                     <span>{new Date(data.created_at).toLocaleDateString()}</span>
                 </div>
                 
                 <div className="flex items-center gap-1 text-xs font-bold text-transparent group-hover:text-blue-600 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
                     <span>Ouvrir</span>
                     <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </div>
            </div>
        </div>
    );
}





