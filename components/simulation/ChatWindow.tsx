// components/simulation/ChatWindow.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { User, Stethoscope, UserRound, FileText, Send, Lightbulb } from 'lucide-react';
import { Message, Patient, Service } from '@/types/simulation/types';

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

const ChatWindow: React.FC<ChatWindowProps> = ({
  patientData,
  selectedService,
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  messageCount,
  isGameOver,
  onReset,
  onShowPatientInfo
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(scrollToBottom, [messages]);

  const questionsRemaining = 5 - messageCount;
  const progressBarWidth = (questionsRemaining / 5) * 100;

  return (
    <div className="w-full h-[600px] flex flex-col bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      
      {/* En-tête moderne et épuré */}
      <div className="flex-shrink-0 p-5 border-b border-gray-100 bg-white">
        <button onClick={onShowPatientInfo} className="w-full text-left group">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src="/images/patient.jpeg" 
                alt={patientData.nom}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#052648]"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-[#052648] font-semibold text-base">{patientData.nom}</h3>
              <p className="text-gray-500 text-sm">Service {selectedService.name}</p>
            </div>
            <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#052648] transition-colors" />
          </div>
        </button>
      </div>

      {/* Zone des messages avec hauteur fixe et scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 min-h-0">
        {messages.map((msg, index) => {
          if (msg.sender === 'system') {
            const Icon = msg.icon || Lightbulb;
            return (
              <div key={index} className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="bg-white px-3 py-1.5 rounded-full border border-gray-200">{msg.text}</span>
                <span className="text-gray-400">{msg.time}</span>
              </div>
            );
          }
          
          const isDoctor = msg.sender === 'doctor';
          return (
            <div key={index} className={`flex items-end gap-2.5 ${isDoctor ? 'justify-end' : 'justify-start'}`}>
              {!isDoctor && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isDoctor
                  ? 'bg-[#052648] text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1.5 ${isDoctor ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
              {isDoctor && (
                <div className="w-8 h-8 rounded-full bg-[#052648] flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {isGameOver && (
          <div className="text-center p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <p className="font-semibold text-sm">Simulation terminée</p>
            <p className="text-xs mt-1">Vous avez utilisé toutes vos questions.</p>
            <button onClick={onReset} className="mt-3 text-sm text-[#052648] hover:underline font-medium">
              Recommencer un cas
            </button>
          </div>
        )}
      </div>

      {/* Zone de saisie épurée */}
      <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">Questions restantes</p>
            <p className="text-xs font-semibold text-[#052648]">{questionsRemaining} / 5</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#052648] h-2 rounded-full transition-all duration-500" 
              style={{width: `${progressBarWidth}%`}}>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <input 
            type="text" 
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isGameOver && inputMessage.trim() && onSendMessage()}
            placeholder={isGameOver ? "Limite atteinte" : "Posez une question au patient..."}
            disabled={isGameOver}
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#052648] focus:bg-white focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />
          <button 
            onClick={onSendMessage} 
            disabled={isGameOver || !inputMessage.trim()}
            className="p-2.5 bg-[#052648] text-white rounded-lg hover:bg-[#063a5f] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#052648]">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatWindow;