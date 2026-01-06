
import React from 'react';
import { CurrentView } from '../types';
import { Users, CreditCard, Tablet, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface DashboardViewProps {
  db: any;
  setView: (view: CurrentView) => void;
  updateDB: (updater: (db: any) => any) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ db, setView, updateDB }) => {
  const activeStudents = db.students.filter((s: any) => s.status === 'active');
  const overdueStudents = db.students.filter((s: any) => s.status === 'active' && s.overdue);
  const todaysAttendance = db.attendances.filter((a: any) => a.date === new Date().toISOString().split('T')[0]);

  const stats = [
    { label: 'Alunos Ativos', value: activeStudents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Inadimplentes', value: overdueStudents.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Presenças Hoje', value: todaysAttendance.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Receita Mensal', value: `¥${db.payments.reduce((acc: number, p: any) => acc + p.amount, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo ao centro de comando da academia.</p>
        </div>
        <div className="flex items-center gap-3">
           <button
            onClick={() => setView('TOTEM')}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all"
          >
            <Tablet size={20} />
            Modo Totem
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-blue-600" />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setView('STUDENTS')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 text-left transition-all"
            >
              <p className="font-bold text-slate-800">Novo Aluno</p>
              <p className="text-xs text-slate-500">Cadastrar ficha completa</p>
            </button>
            <button 
              onClick={() => setView('FINANCE')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 text-left transition-all"
            >
              <p className="font-bold text-slate-800">Receber Mensalidade</p>
              <p className="text-xs text-slate-500">Lançar pagamento em ¥</p>
            </button>
            <button 
              onClick={() => setView('ATTENDANCE')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 text-left transition-all"
            >
              <p className="font-bold text-slate-800">Ver Treinos</p>
              <p className="text-xs text-slate-500">Check-ins realizados hoje</p>
            </button>
            <button 
               onClick={() => setView('CONFIG')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 text-left transition-all"
            >
              <p className="font-bold text-slate-800">Configurações</p>
              <p className="text-xs text-slate-500">Planos e graduações</p>
            </button>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-6">Logs de Atividade</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {[...db.logs].reverse().slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{log.action}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString('pt-BR')} • por {db.users.find((u: any) => u.id === log.userId)?.name || 'Sistema'}
                  </p>
                </div>
              </div>
            ))}
            {db.logs.length === 0 && (
              <p className="text-center text-gray-400 py-10">Nenhuma atividade recente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
