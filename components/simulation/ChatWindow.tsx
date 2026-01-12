// components/simulation/ChatWindow.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { User, Stethoscope, FileText, Send, Lightbulb, MoreHorizontal, AlertTriangle, CheckCircle2, MessageCircleQuestion } from 'lucide-react';
import { Message, Patient, Service } from '@/types/simulation/types';

interface ChatWindowProps {
  patientData: Patient;
  selectedService: Service;
  messages: Message[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  messageCount: number;
  MAX_QUESTIONS: number;
  isGameOver: boolean;
  onReset: () => void;
  onShowPatientInfo: () => void;
  isTyping?: boolean;
}

// --- SOUS-COMPOSANT : Feedback Visuel du Tuteur (Le Badge Vert/Jaune) ---
const MessageFeedback = ({ status, reason }: { status?: string, reason?: string }) => {
    // On n'affiche rien si pas de statut ou statut neutre
    if (!status || status === 'neutral') return null;
    
    // Détermine si c'est positif ou "warning"
    const isGood = status === 'good';
    
    return (
        <div className={`mt-2 text-xs p-2 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300 ${
            isGood 
            ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
            : 'bg-amber-100 text-amber-800 border-l-4 border-amber-500'
        }`}>
            {isGood ? (
                <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0"/> 
            ) : ( 
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0"/>
            )}
            <span className="leading-snug">
                {reason || (isGood ? "Question pertinente." : "Attention, peu pertinent.")}
            </span>
        </div>
    );
};

// --- COMPOSANT PRINCIPAL ---
const ChatWindow: React.FC<ChatWindowProps> = ({
  patientData,
  selectedService,
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  messageCount,
  MAX_QUESTIONS = 10,
  isGameOver,
  onReset,
  onShowPatientInfo,
  isTyping,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const progressBarWidth = Math.min((messageCount / MAX_QUESTIONS) * 100, 100);

  return (
    <div className="w-full h-[600px] flex flex-col bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden relative">
      
      {/* 1. EN-TÊTE : Infos Patient + Progression */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-white z-10 flex justify-between items-center">
        <button onClick={onShowPatientInfo} className="flex items-center gap-4 group transition-opacity hover:opacity-80">
            <div className="relative">
              <img 
                src="/images/patient.jpeg" 
                alt={patientData.nom}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#052648]"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Patient&background=random' }}
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="text-left">
              <h3 className="text-[#052648] font-bold text-sm md:text-base">{patientData.nom}</h3>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                 <FileText size={10}/> {selectedService.name}
              </p>
            </div>
        </button>

        <div className="flex flex-col items-end w-1/3">
            <div className="text-xs font-semibold text-slate-500 mb-1">
                Questions: <span className={messageCount >= MAX_QUESTIONS ? "text-red-500" : "text-[#052648]"}>{messageCount}</span> / {MAX_QUESTIONS}
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ease-out ${
                        messageCount >= MAX_QUESTIONS ? 'bg-red-500' : 'bg-[#052648]'
                    }`}
                    style={{ width: `${progressBarWidth}%` }}
                />
            </div>
        </div>
      </div>

      {/* 2. ZONE DE MESSAGES SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-gray-300">
        
        {messages.map((msg, index) => {
          // --- TYPE 1: MESSAGE SYSTÈME / ALERTE ---
          if (msg.sender === 'system') {
            const isBad = msg.quality === 'bad';
            return (
              <div key={index} className="flex justify-center my-2 opacity-80 hover:opacity-100 transition-opacity">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border shadow-sm ${
                      isBad 
                      ? 'bg-red-50 text-red-600 border-red-100' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                      {msg.isAction ? <FileText size={12}/> : (isBad ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />)} 
                      {msg.text}
                  </span>
              </div>
            );
          }

          // --- TYPE 2: INDICE DU TUTEUR ---
          if (msg.sender === 'tutor') {
              return (
                  <div key={index} className="flex justify-center my-4 animate-bounce-in">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl max-w-sm flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="bg-amber-100 p-2 rounded-full h-fit flex-shrink-0 text-amber-600">
                              <Lightbulb size={20} strokeWidth={2.5}/>
                          </div>
                          <div>
                              <p className="text-amber-800 text-xs font-bold mb-1 uppercase tracking-wide">Conseil du Tuteur</p>
                              <p className="text-amber-900 text-sm italic leading-relaxed">"{msg.text}"</p>
                          </div>
                      </div>
                  </div>
              );
          }
          
          const isDoctor = msg.sender === 'doctor';

          // --- TYPE 3: ECHANGE DOCTEUR / PATIENT ---
          return (
            <div key={index} className={`flex w-full ${isDoctor ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                <div className={`flex items-end gap-2.5 max-w-[85%] ${isDoctor ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isDoctor ? 'bg-[#052648] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        {isDoctor ? <Stethoscope size={16} /> : <User size={16} />}
                    </div>

                    <div className="flex flex-col gap-1 min-w-[120px]">
                        {/* Bulle de message */}
                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            isDoctor
                            ? 'bg-[#052648] text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>

                        {/* --- INJECTION DU FEEDBACK TUTEUR (Sous le message Docteur) --- */}
                        {isDoctor && msg.feedback && (
                            <MessageFeedback status={msg.quality} reason={msg.feedback} />
                        )}

                        {/* Horodatage */}
                        <span className={`text-[10px] opacity-60 ${isDoctor ? 'text-right' : 'text-left'}`}>
                            {msg.time}
                        </span>
                    </div>
                </div>
            </div>
          );
        })}

        {/* --- INDICATEUR DE FRAPPE (PATIENT) --- */}
        {isTyping && (
            <div className="flex w-full justify-start animate-in fade-in duration-300">
               <div className="flex items-end gap-2.5 max-w-[85%]">
                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <User size={16} className="text-gray-500" />
                   </div>
                   <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                   </div>
               </div>
            </div>
        )}
        
        {/* Ancre pour scroll automatique */}
        <div ref={messagesEndRef} />

        {/* Message de fin si GameOver */}
        {isGameOver && (
          <div className="mx-auto max-w-sm mt-8 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-center animate-pulse">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="font-bold text-sm">Consultation Terminée</p>
            <p className="text-xs mt-1">Veuillez formuler votre diagnostic final.</p>
            <button onClick={onReset} className="mt-3 text-xs bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* 3. ZONE DE SAISIE */}
      <div className="p-4 bg-white border-t border-gray-100 z-10">
        
        {/* Petit rappel pour la phase tutorée */}
        {messageCount < 5 && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-blue-600 animate-fade-in bg-blue-50 w-fit px-2 py-1 rounded-md">
                <MessageCircleQuestion size={12} /> 
                Mode Tutoré actif : Vos questions sont analysées par l'IA.
            </div>
        )}

        <div className="flex gap-3 items-center">
          <input 
            type="text" 
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isGameOver && !isTyping && inputMessage.trim() && onSendMessage()}
            placeholder={isGameOver ? "La consultation est terminée." : "Posez une question au patient..."}
            disabled={isGameOver || isTyping}
            className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#052648] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm text-slate-800 placeholder:text-slate-400"
            autoFocus
          />
          <button 
            onClick={onSendMessage} 
            disabled={isGameOver || !inputMessage.trim() || isTyping}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg ${
                isGameOver || !inputMessage.trim() || isTyping
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#052648] text-white hover:bg-[#0a4d8f] active:scale-95 hover:shadow-xl'
            }`}>
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-[10px] text-center text-slate-400 mt-2">
            Les réponses du patient sont générées par IA. Vérifiez toujours la cohérence médicale.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;