// components/simulation/ChatWindow.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { User, Stethoscope, UserRound, FileText, Send, Lightbulb } from 'lucide-react';
import { Message, Patient, Service } from '@/types/simulation/types';

/**
 * Props pour le composant ChatWindow.
 */
interface ChatWindowProps {
  patientData: Patient;
  selectedService: Service;
  messages: Message[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  messageCount: number;
  isGameOver: boolean;
  onReset: () => void;
  onShowPatientInfo: () => void;
}

/**
 * Affiche l'interface complète de la fenêtre de chat.
 * Gère l'affichage des messages, la saisie utilisateur et l'état de la simulation.
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
  patientData, selectedService, messages, inputMessage,
  onInputChange, onSendMessage, messageCount, isGameOver,
  onReset, onShowPatientInfo
}) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fait défiler la vue vers le dernier message à chaque mise à jour.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);
  
  const questionsRemaining = 5 - messageCount;
  const progressBarWidth = (questionsRemaining / 5) * 100;

  return (
    <div className="w-full h-full flex flex-col bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        
      {/* En-tête du chat amélioré */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-slate-50">
        <button onClick={onShowPatientInfo} className="w-full text-left group">
          <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white shadow-md">
                <UserRound className="w-7 h-7" />
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-50 animate-pulse" title="Patient en ligne"></div>
            </div>
            <div>
              <h3 className="text-primary font-bold text-lg group-hover:text-blue-700 transition-colors">{patientData.nom}</h3>
              <p className="text-slate-500 text-sm">Patient du service {selectedService.name}</p>
            </div>
            <FileText className="w-5 h-5 text-slate-400 ml-auto group-hover:text-blue-700 transition-colors" />
          </div>
        </button>
      </div>

      {/* Zone des messages avec avatars */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/50">
        {messages.map((msg, index) => {
          if (msg.sender === 'system') {
            const Icon = msg.icon || Lightbulb; // Icone par défaut si non fournie
            return (
              <div key={index} className="flex items-center justify-center gap-3 text-slate-500 text-xs animate-fade-in">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="bg-slate-200/80 px-3 py-1 rounded-full">{msg.text}</span>
                <span>{msg.time}</span>
              </div>
            );
          }
          
          const isDoctor = msg.sender === 'doctor';
          return (
            <div key={index} className={`flex items-end gap-3 ${isDoctor ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              {!isDoctor && (
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                isDoctor
                  ? 'bg-gradient-to-br from-primary to-blue-700 text-white rounded-br-lg'
                  : 'bg-white text-slate-800 rounded-bl-lg'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-2 text-right ${isDoctor ? 'text-blue-200/70' : 'text-slate-400'}`}>
                  {msg.time}
                </p>
              </div>
              {isDoctor && (
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Stethoscope className="w-4 h-4 text-primary" />
                  </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {isGameOver && (
          <div className="text-center p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <p className="font-semibold">Échec de la simulation !</p>
            <p className="text-sm">Vous avez utilisé toutes vos questions.</p>
            <button onClick={onReset} className="mt-2 text-sm text-blue-600 hover:underline">Recommencer un cas</button>
          </div>
        )}
      </div>

      {/* Zone de saisie avec visualisation des messages restants */}
      <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="mb-2 px-1">
            <p className="text-xs text-slate-500 mb-1">Questions restantes: {questionsRemaining} / 5</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className={`bg-gradient-to-r from-blue-400 to-primary h-1.5 rounded-full transition-all duration-500`} 
                style={{width: `${progressBarWidth}%`}}>
              </div>
            </div>
        </div>
        <div className="flex gap-3 items-center">
          <input type="text" value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder={isGameOver ? "Limite de messages atteinte" : "Posez une question au patient..."}
            disabled={isGameOver}
            className="flex-1 w-full px-4 py-2.5 bg-slate-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 disabled:bg-slate-200 disabled:cursor-not-allowed"
          />
          <button onClick={onSendMessage} disabled={isGameOver || !inputMessage.trim()}
            className="p-3 bg-gradient-to-br from-primary to-blue-700 text-white rounded-full hover:scale-110 active:scale-95 transition-transform duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;