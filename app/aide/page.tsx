'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, Play, LayoutDashboard, Settings, UserPlus, LogIn, 
  HelpCircle, Activity, Download, FileText, ChevronRight,
  ShieldCheck, Terminal, Stethoscope, Microscope, 
  BrainCircuit, Database, LineChart, Syringe, ClipboardCheck,
  MousePointer2, KeyRound, Lightbulb, GraduationCap,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- DATA : LE CONTENU DU GUIDE ---

type Category = 'tous' | 'start' | 'simulation' | 'dashboard' | 'expert';

interface HelpStep {
  icon: React.ElementType;
  text: string;
}

interface GuideItem {
  id: string;
  category: Category;
  title: string;
  icon: React.ElementType;
  description: string;
  steps: HelpStep[];
}

const HELP_DATA: GuideItem[] = [
  // --- DÉMARRAGE ---
  {
    id: '1',
    category: 'start',
    title: 'Création de compte',
    icon: UserPlus,
    description: "Rejoignez l'élite médicale en créant votre profil apprenant sécurisé.",
    steps: [
      { icon: MousePointer2, text: "Cliquez sur 'Commencer' en haut à droite." },
      { icon: FileText, text: "Remplissez le formulaire avec votre email universitaire." },
      { icon: KeyRound, text: "Un **Matricule Unique** (ex: DOC-88) sera généré." },
      { icon: ShieldCheck, text: "Notez-le précieusement, c'est votre identifiant de connexion." }
    ]
  },
  {
    id: '2',
    category: 'start',
    title: 'Connexion Sécurisée',
    icon: LogIn,
    description: "Accédez à votre tableau de bord personnel.",
    steps: [
      { icon: LogIn, text: "Allez sur la page 'Connexion'." },
      { icon: UserPlus, text: "Entrez votre Matricule et votre Email." },
      { icon: Lightbulb, text: "Astuce : Cochez 'Se souvenir de moi' pour gagner du temps." },
      { icon: Activity, text: "Vous serez redirigé vers votre Dashboard." }
    ]
  },

  // --- SIMULATION ---
  {
    id: '3',
    category: 'simulation',
    title: 'Lancer un Cas Clinique',
    icon: Play,
    description: "Plongez dans un scénario réaliste.",
    steps: [
      { icon: Search, text: "Depuis le Dashboard, allez sur 'M'exercer'." },
      { icon: BrainCircuit, text: "Choisissez une spécialité (ex: Cardiologie)." },
      { icon: Play, text: "Sélectionnez un cas ou 'Cas Aléatoire'." },
      { icon: ClipboardCheck, text: "Lisez le motif d'admission avant de commencer." }
    ]
  },
  {
    id: '4',
    category: 'simulation',
    title: 'Dialogue avec le Patient (IA)',
    icon: Stethoscope,
    description: "Menez l'interrogatoire médical.",
    steps: [
      { icon: Terminal, text: "Utilisez la zone de chat pour poser vos questions." },
      { icon: Activity, text: "Surveillez la jauge 'Stress' du patient." },
      { icon: AlertTriangle, text: "Attention : vous avez un nombre limité de questions." },
      { icon: ClipboardCheck, text: "L'IA analyse la pertinence de votre anamnèse." }
    ]
  },
  {
    id: '5',
    category: 'simulation',
    title: 'Examens & Traitements',
    icon: Syringe,
    description: "Diagnostiquez et soignez.",
    steps: [
      { icon: Microscope, text: "Ouvrez le volet latéral 'Examens'." },
      { icon: FileText, text: "Prescrivez une biologie ou une imagerie." },
      { icon: Database, text: "Consultez les résultats générés instantanément." },
      { icon: CheckCircle2, text: "Validez le diagnostic final pour voir votre note." }
    ]
  },

  // --- DASHBOARD & EXPERT ---
  {
    id: '6',
    category: 'dashboard',
    title: 'Analyser mes Performances',
    icon: LineChart,
    description: "Comprendre vos forces et faiblesses.",
    steps: [
      { icon: LayoutDashboard, text: "Le Dashboard affiche votre courbe de progression." },
      { icon: BrainCircuit, text: "Consultez le 'Profil Cognitif' pour voir vos biais." },
      { icon: GraduationCap, text: "Reprenez les cas échoués dans l'onglet 'À revoir'." }
    ]
  }
];

// --- COMPOSANT : HEADER HERO ---
const HeroSection = ({ search, setSearch }: { search: string, setSearch: (v: string) => void }) => {
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-b-[50px] shadow-2xl mb-12 group">
        
        {/* 1. IMAGE DE FOND + BLUR */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ 
                backgroundImage: "url('/images/hero-medical-bg.jpg')", 
                filter: "blur(4px)" // Flou artistique natif
            }} 
        />

        {/* 2. FILTRE BLEU FONCÉ (GRADIENT) */}
        <div className="absolute inset-0 bg-[#052648]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#052648] via-transparent to-[#052648]/50"></div>

        {/* 3. PATTERN POINTILLÉ (Overlay Gauche) */}
        <div 
            className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{
                backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
                backgroundPosition: 'left center'
            }}
        />

        {/* CONTENU */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center z-10">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider mb-6"
            >
                <HelpCircle size={16} className="text-white" /> Centre d'Assistance
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8 max-w-3xl leading-tight"
            >
                Maîtrisez la plateforme <br/> <span className="border-b-4 border-white/20">The Good Doctor</span>
            </motion.h1>

            {/* BARRE DE RECHERCHE */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-full max-w-xl"
            >
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#052648]/60 w-5 h-5" />
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher une fonctionnalité (ex: Examen, Note...)" 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/95 text-[#052648] font-medium text-lg placeholder-[#052648]/40 outline-none focus:ring-4 focus:ring-white/30 shadow-xl transition-all"
                />
            </motion.div>
        </div>
    </div>
  );
};

import { CheckCircle2 } from 'lucide-react'; // Manquait dans les imports initiaux

// --- PAGE PRINCIPALE ---
export default function HelpPage() {
  const [activeCat, setActiveCat] = useState<Category>('tous');
  const [searchQuery, setSearchQuery] = useState('');

  // Logique Filtrage
  const filteredGuides = useMemo(() => {
    return HELP_DATA.filter(item => {
      const matchText = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = activeCat === 'tous' || item.category === activeCat;
      return matchText && matchCat;
    });
  }, [searchQuery, activeCat]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* 1. HERO HEADER */}
      <HeroSection search={searchQuery} setSearch={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6">
        
        {/* 2. BOUTON PDF (Téléchargement Global) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            
            {/* Filtres Onglets */}
            <div className="flex flex-wrap justify-center gap-2">
                {[
                    { id: 'tous', label: 'Tout' },
                    { id: 'start', label: 'Démarrage' },
                    { id: 'simulation', label: 'Simulations' },
                    { id: 'dashboard', label: 'Dashboard' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveCat(tab.id as Category)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                            activeCat === tab.id 
                            ? 'bg-[#052648] text-white border-[#052648] shadow-lg' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#052648] hover:text-[#052648]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Bouton Guide PDF */}
            <a 
                href="/docs/guide_utilisateur_v1.pdf" 
                download
                className="group flex items-center gap-3 bg-white border-2 border-[#052648]/10 px-6 py-3 rounded-xl hover:bg-[#052648] hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95 cursor-pointer"
            >
                <div className="bg-[#052648]/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Download size={20} className="text-[#052648] group-hover:text-white"/>
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Document</p>
                    <p className="text-sm font-bold leading-none">Télécharger le Guide PDF</p>
                </div>
            </a>
        </div>

        {/* 3. GRILLE DE CONTENU (Cartes Directes) */}
        {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredGuides.map((item, index) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#052648]/20 transition-all duration-300 overflow-hidden flex flex-col group h-full"
                    >
                        {/* Header Card */}
                        <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <div className="w-14 h-14 bg-[#052648] text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <item.icon size={28} />
                            </div>
                            <h3 className="text-xl font-extrabold text-[#052648] mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                        </div>

                        {/* Steps List */}
                        <div className="p-6 pt-4 flex-1">
                            <ul className="space-y-4">
                                {item.steps.map((step, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="mt-0.5 p-1.5 rounded-lg bg-[#052648]/5 text-[#052648] shrink-0">
                                            <step.icon size={14} strokeWidth={3} />
                                        </div>
                                        <p className="text-sm text-slate-700 leading-snug">
                                            {step.text.split('**').map((part, j) => 
                                                j % 2 === 1 ? <strong key={j} className="text-[#052648] font-bold">{part}</strong> : part
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 opacity-50">
                <Search size={48} className="mx-auto mb-4" />
                <p>Aucun résultat ne correspond à votre recherche.</p>
            </div>
        )}

      </main>
    </div>
  );
}