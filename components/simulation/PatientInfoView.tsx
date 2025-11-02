// components/simulation/PatientInfoView.tsx
'use client';
import { Patient, Service } from '@/types/simulation/types';

interface PatientInfoViewProps {
  patientData: Patient;
  selectedService: Service;
  onStartConsultation: () => void;
}

const PatientInfoView: React.FC<PatientInfoViewProps> = ({ patientData, selectedService, onStartConsultation }) => {
  return (
     <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-xl w-full">
       <div className="flex items-center gap-4 mb-4">
         <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
            <selectedService.icon className="w-6 h-6 text-white"/>
         </div>
         <div>
           <h2 className="text-2xl font-bold text-primary">{selectedService.name}</h2>
           <p className="text-slate-500">Dossier patient</p>
         </div>
       </div>
       <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-lg">
          <p><strong className="text-primary">Identité:</strong> {patientData.nom}, {patientData.age} ans</p>
          <p><strong className="text-primary">Motif:</strong> {patientData.motif}</p>
          <p><strong className="text-primary">Antécédents:</strong> {patientData.antecedents}</p>
       </div>
        <button onClick={onStartConsultation}
          className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-300">
          Commencer la consultation
        </button>
     </div>
  );
}

export default PatientInfoView;