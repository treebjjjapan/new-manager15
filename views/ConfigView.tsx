
import React, { useState } from 'react';
import { User, Plan, Schedule, UserRole } from '../types.ts';
import { Settings, Plus, Trash2, Calendar, CreditCard, ShieldCheck, Edit3, Clock, Trash } from 'lucide-react';
import { addLog } from '../db.ts';

interface ConfigViewProps {
  db: any;
  updateDB: (updater: (db: any) => any) => void;
  currentUser: User;
}

const ConfigView: React.FC<ConfigViewProps> = ({ db, updateDB, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'schedule' | 'users'>('plans');

  // Plan Management
  const removePlan = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    updateDB(prev => ({ ...prev, plans: prev.plans.filter((p: any) => p.id !== id) }));
    addLog(`Plano removido pelo administrador`, currentUser.id);
  };

  const addPlan = () => {
    const name = prompt('Nome do Plano:');
    const price = prompt('Valor em Yen (¥):');
    if (name && price) {
      updateDB(prev => ({
        ...prev,
        plans: [...prev.plans, { id: Math.random().toString(36).substr(2, 9), name, price: parseInt(price) }]
      }));
      addLog(`Novo plano criado: ${name}`, currentUser.id);
    }
  };

  const editPlan = (plan: Plan) => {
    const name = prompt('Novo nome do Plano:', plan.name);
    const price = prompt('Novo valor em Yen (¥):', plan.price.toString());
    if (name && price) {
      updateDB(prev => ({
        ...prev,
        plans: prev.plans.map((p: any) => p.id === plan.id ? { ...p, name, price: parseInt(price) } : p)
      }));
      addLog(`Plano atualizado: ${name}`, currentUser.id);
    }
  };

  // Schedule Management
  const addSchedule = () => {
    const day = prompt('Dia da Semana (ex: Segunda-feira):');
    const time = prompt('Horário (ex: 19:30):');
    const type = prompt('Tipo de Aula (ex: Gi, No-Gi, Kids):');
    
    if (day && time && type) {
      updateDB(prev => ({
        ...prev,
        schedules: [...(prev.schedules || []), { id: Math.random().toString(36).substr(2, 9), day, time, classType: type }]
      }));
      addLog(`Novo horário adicionado: ${day} ${time}`, currentUser.id);
    }
  };

  const removeSchedule = (id: string) => {
    if (!confirm('Excluir este horário?')) return;
    updateDB(prev => ({ ...prev, schedules: prev.schedules.filter((s: any) => s.id !== id) }));
    addLog(`Horário removido pelo administrador`, currentUser.id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-2xl">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Configurações do Sistema</h2>
            <p className="text-slate-500 text-sm">Gerencie planos, horários e acessos.</p>
          </div>
        </div>
      </header>

      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        <button 
          onClick={() => setActiveTab('plans')} 
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'plans' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <CreditCard size={18} /> Planos
        </button>
        <button 
          onClick={() => setActiveTab('schedule')} 
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Calendar size={18} /> Horários
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ShieldCheck size={18} /> Usuários
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm min-h-[400px]">
        {activeTab === 'plans' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Planos de Mensalidade</h3>
                <p className="text-sm text-slate-400">Defina os valores cobrados dos alunos.</p>
              </div>
              <button 
                onClick={addPlan} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                <Plus size={18} /> NOVO PLANO
              </button>
            </div>
            
            <div className="grid gap-4">
              {db.plans.map((plan: Plan) => (
                <div key={plan.id} className="group flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-lg">{plan.name}</p>
                      <p className="text-blue-600 font-black text-xl">¥ {plan.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => editPlan(plan)} 
                      className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Editar Plano"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => removePlan(plan.id)} 
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir Plano"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {db.plans.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-medium">Nenhum plano configurado.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Grade de Horários</h3>
                <p className="text-sm text-slate-400">Horários das aulas regulares.</p>
              </div>
              <button 
                onClick={addSchedule} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                <Plus size={18} /> ADICIONAR AULA
              </button>
            </div>

            <div className="space-y-3">
              {(db.schedules || []).map((schedule: Schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-6">
                    <div className="px-4 py-2 bg-white rounded-xl text-blue-600 font-black shadow-sm border border-slate-100">
                      {schedule.time}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{schedule.day}</p>
                      <p className="text-sm text-slate-500 uppercase font-black tracking-widest">{schedule.classType}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeSchedule(schedule.id)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
              {(!db.schedules || db.schedules.length === 0) && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-medium">Nenhum horário de aula definido.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Usuários do Sistema</h3>
            <div className="space-y-4">
              {db.users.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigView;
