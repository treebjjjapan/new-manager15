
import React, { useState } from 'react';
import { User, Plan, Schedule, UserRole } from '../types';
import { Settings, Plus, Trash2, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { addLog } from '../db';

interface ConfigViewProps {
  db: any;
  updateDB: (updater: (db: any) => any) => void;
  currentUser: User;
}

const ConfigView: React.FC<ConfigViewProps> = ({ db, updateDB, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'schedule' | 'users'>('plans');

  const removePlan = (id: string) => {
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Ajuste os parâmetros do sistema.</p>
      </header>

      <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'plans' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <CreditCard size={18} />
          Planos
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Calendar size={18} />
          Horários
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ShieldCheck size={18} />
          Usuários
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {activeTab === 'plans' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Planos de Mensalidade</h3>
              <button onClick={addPlan} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {db.plans.map((plan: Plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="font-bold text-slate-800">{plan.name}</p>
                    <p className="text-sm font-black text-blue-600">¥ {plan.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removePlan(plan.id)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="p-8">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Grade de Horários</h3>
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-4">
               {db.schedules.map((sch: Schedule) => (
                 <div key={sch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                     <p className="font-bold text-slate-800">{sch.day} - {sch.time}</p>
                     <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{sch.classType}</p>
                   </div>
                   <button className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">Controle de Acesso</h3>
             <div className="space-y-4">
               {db.users.map((u: User) => (
                 <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                     <p className="font-bold text-slate-800">{u.name}</p>
                     <p className="text-xs text-slate-500 font-bold">{u.email} • {u.role}</p>
                   </div>
                   {u.id !== 'admin' && (
                     <button className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                   )}
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
