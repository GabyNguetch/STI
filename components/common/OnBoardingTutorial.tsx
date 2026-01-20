// /src/components/common/OnboardingTutorial.tsx
import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, Trophy, Brain } from 'lucide-react'; // Example d'icônes

// --- Liste des étapes ---
const tutorialSteps = [
    {
        title: "Bienvenue dans votre simulation médicale",
        content: "Nous utilisons l'intelligence artificielle pour recréer des interactions patients réalistes.",
        icon: Brain,
        color: "text-purple-600"
    },
    {
        title: "Discutez naturellement",
        content: "Vous pouvez poser vos questions en langage naturel au patient, ou réaliser des examens via le panneau latéral.",
        icon: Lightbulb,
        color: "text-yellow-500"
    },
    {
        title: "Recevez des feedback précis",
        content: "Après chaque diagnostic, un expert virtuel évaluera votre raisonnement, votre démarche et vos conclusions.",
        icon: CheckCircle2,
        color: "text-green-600"
    },
     {
        title: "Suivez vos progrès",
        content: "Accédez au tableau de bord pour voir vos statistiques et les domaines à améliorer.",
        icon: Trophy,
        color: "text-blue-600"
    }
];

export default function OnboardingTutorial({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(s => s + 1);
        } else {
            onClose(); // Fin du tutoriel
        }
    };
    
    const StepIcon = tutorialSteps[step].icon;
    const isLast = step === tutorialSteps.length - 1;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 relative flex flex-col items-center text-center">
                
                {/* Icône principale */}
                <div className={`p-6 rounded-full bg-slate-50 mb-6 border-4 border-white shadow-md animate-bounce-slow`}>
                     <StepIcon size={64} className={tutorialSteps[step].color} strokeWidth={1.5} />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-4 transition-all ease-in-out duration-300">
                   {tutorialSteps[step].title}
                </h2>

                <p className="text-gray-600 leading-relaxed mb-8 h-20 transition-opacity duration-300">
                   {tutorialSteps[step].content}
                </p>

                {/* Points de navigation */}
                <div className="flex gap-2 mb-8">
                    {tutorialSteps.map((_, idx) => (
                        <div 
                           key={idx} 
                           className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === step ? 'bg-slate-800 w-6' : 'bg-slate-300'}`} 
                        />
                    ))}
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.98]"
                >
                   {isLast ? "C'est parti !" : "Suivant"}
                </button>
            </div>
        </div>
    );
}