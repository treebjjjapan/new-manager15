
import React, { useState, useEffect } from 'react';
import { Student, Attendance } from '../types.ts';
import { Search, Grid, List, CheckCircle2, User, ChevronLeft, Tablet, Lock } from 'lucide-react';
import { addLog } from '../db.ts';

interface TotemViewProps {
  students: Student[];
  onExit: () => void;
  updateDB: (updater: (db: any) => any) => void;
}

const TotemView: React.FC<TotemViewProps> = ({ students, onExit, updateDB }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'name' | 'photo'>('name');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [exitCounter, setExitCounter] = useState(0);

  const activeStudents = students.filter(s => 
    s.status === 'active' && 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCheckIn = (student: Student) => {
    const now = new Date();
    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: student.id,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      source: 'TOTEM',
      classType: 'Treino'
    };

    updateDB(prev => ({
      ...prev,
      attendances: [...prev.attendances, newAttendance]
    }));

    addLog(`Check-in realizado pelo Totem: ${student.name}`);
    setSuccessMessage(`Check-in realizado: ${student.name}`);
    setSearchTerm('');
  };

  const handleExitRequest = () => {
    setExitCounter(prev => prev + 1);
    if (exitCounter >= 4) {
      const pin = prompt('Digite o PIN de administrador para sair:');
      if (pin === '1234') onExit();
      else {
        alert('PIN Inválido.');
        setExitCounter(0);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden select-none animate-fade-in">
      <header className="p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight">OSS JIU-JITSU</h1>
          <p className="text-slate-400 text-lg md:text-xl mt-2">Bem-vindo ao Treino! Registre sua presença.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('name')} className={`flex-1 md:flex-none px-10 py-5 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 ${activeTab === 'name' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-slate-800 text-slate-400'}`}>
            <List size={28} /> POR NOME
          </button>
          <button onClick={() => setActiveTab('photo')} className={`flex-1 md:flex-none px-10 py-5 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 ${activeTab === 'photo' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-slate-800 text-slate-400'}`}>
            <Grid size={28} /> POR FOTO
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="mb-10 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={32} />
          <input type="text" placeholder="COMECE A DIGITAR SEU NOME..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-20 pr-8 py-8 bg-slate-800 border-2 border-slate-700 rounded-[2rem] text-3xl font-bold text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-900/20 transition-all placeholder:text-slate-600" />
        </div>

        {activeTab === 'name' ? (
          <div className="space-y-4">
            {activeStudents.slice(0, 15).map(student => (
              <button key={student.id} onClick={() => handleCheckIn(student)} className="w-full p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-3xl flex items-center justify-between group transition-all active:scale-[0.98]">
                <div className="flex items-center gap-8 text-left">
                  <div className="w-20 h-20 rounded-2xl bg-slate-700 overflow-hidden shrink-0 border-2 border-slate-600">
                    {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={32} /></div>}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{student.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">{student.belt}</span>
                      {student.overdue && <span className="text-red-500 font-black text-xs uppercase animate-pulse">Mensalidade Vencida</span>}
                    </div>
                  </div>
                </div>
                <ChevronLeft className="text-slate-600 group-hover:text-blue-500 rotate-180 transition-colors" size={40} />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {activeStudents.map(student => (
              <button key={student.id} onClick={() => handleCheckIn(student)} className="flex flex-col items-center gap-4 bg-slate-800/40 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 active:scale-95 transition-all group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-slate-700 overflow-hidden border-4 border-slate-800 shadow-2xl group-hover:shadow-blue-900/30">
                  {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={48} /></div>}
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white line-clamp-2 leading-tight">{student.name.split(' ')[0]}</p>
                  {student.overdue && <p className="text-[10px] text-red-500 font-black mt-1">VENCIDO</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {activeStudents.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-20">
            <Tablet size={100} className="text-slate-700 mb-6" />
            <h3 className="text-3xl font-bold text-slate-500">Nenhum aluno encontrado</h3>
          </div>
        )}
      </main>

      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
          <div className="bg-green-600 text-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 animate-zoom-in border-4 border-white/20">
            <CheckCircle2 size={120} />
            <p className="text-5xl font-black text-center">{successMessage}</p>
          </div>
        </div>
      )}

      <button onClick={handleExitRequest} className="fixed bottom-6 right-6 w-16 h-16 bg-slate-800/20 hover:bg-slate-800 flex items-center justify-center rounded-2xl transition-all group">
        <Lock className="text-slate-900 group-hover:text-slate-500" size={24} />
      </button>
    </div>
  );
};

export default TotemView;
