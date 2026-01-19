'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DiagnosticProps {
    onComplete: () => void;
    isLoading: boolean; // <--- NOUVELLE PROP OBLIGATOIRE
}

const QUESTIONS = [
    {
        question: "Un patient de 25 ans présente une dyspnée expiratoire sifflante. Quel est le diagnostic le plus probable ?",
        options: ["Pneumonie", "Crise d'asthme", "Embolie Pulmonaire", "Pneumothorax"],
        correct: 1
    },
    {
        question: "Quel examen demandez-vous en priorité face à une douleur thoracique constrictive irradiant dans le bras gauche ?",
        options: ["Radio Thorax", "D-Dimères", "ECG", "Scanner"],
        correct: 2
    },
    {
        question: "Laquelle de ces valeurs de tension artérielle indique une urgence hypertensive ?",
        options: ["140/90", "160/100", "130/80", "220/120"],
        correct: 3
    }
];

export default function DiagnosticTest({ onComplete }: DiagnosticProps) {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);
    const [isChecking, setIsChecking] = useState(false); // Pour montrer feedback vert/rouge temporaire

    const handleAnswer = (idx: number) => {
        if(isChecking) return;
        setSelected(idx);
        setIsChecking(true);

        const isCorrect = idx === QUESTIONS[currentQ].correct;
        if (isCorrect) setScore(s => s + 1);

        // Petit délai pour montrer la bonne réponse
        setTimeout(() => {
            if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(q => q + 1);
                setSelected(null);
                setIsChecking(false);
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

    if (showResult) {
        return (
            <div className="text-center animate-in zoom-in-95">
                <div className="w-24 h-24 mx-auto bg-[#052648] text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                    <span className="text-4xl font-bold">{score}/{QUESTIONS.length}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#052648] mb-2">Évaluation Terminée !</h3>
                <p className="text-slate-600 mb-8">
                    {score === 3 ? "Excellent ! On vous mettra directement sur des cas Confirmés." : 
                     score === 2 ? "Pas mal ! Niveau Intermédiaire débloqué." : 
                     "Reprenons les bases ensemble. Niveau Débutant activé."}
                </p>
                <Button onClick={onComplete} className="w-full py-6 text-lg bg-[#052648] hover:bg-blue-900 shadow-lg">
                    Créer mon compte
                </Button>
            </div>
        );
    }

    const q = QUESTIONS[currentQ];

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300 w-full">
            <div className="flex justify-between items-center mb-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Diagnostic Rapide</span>
                <span>Question {currentQ + 1} / {QUESTIONS.length}</span>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
                {q.question}
            </h3>

            <div className="space-y-3">
                {q.options.map((opt, idx) => {
                    // Logique de couleur pour le feedback
                    let btnClass = "border-slate-200 hover:border-[#052648] hover:bg-slate-50";
                    if (isChecking) {
                        if (idx === q.correct) btnClass = "bg-green-500 text-white border-green-500";
                        else if (idx === selected) btnClass = "bg-red-500 text-white border-red-500";
                        else btnClass = "opacity-50 border-slate-100";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={isChecking}
                            className={`w-full p-4 border-2 rounded-xl text-left font-medium transition-all duration-200 flex items-center justify-between ${btnClass}`}
                        >
                            {opt}
                            {isChecking && idx === q.correct && <CheckCircle size={20}/>}
                            {isChecking && idx === selected && idx !== q.correct && <XCircle size={20}/>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}