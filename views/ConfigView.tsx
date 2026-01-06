
import React, { useState } from 'react';
import { User, Plan, Schedule, UserRole } from '../types.ts';
import { Settings, Plus, Trash2, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { addLog } from '../db.ts';

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
      </header>

      <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl border border-gray-100">
        <button onClick={() => setActiveTab('plans')} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'plans' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Planos</button>
        <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Horários</button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Usuários</button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        {activeTab === 'plans' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Planos</h3>
              <button onClick={addPlan} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={20} /></button>
            </div>
            <div className="space-y-4">
              {db.plans.map((plan: Plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">{plan.name}</p>
                    <p className="text-blue-600 font-black">¥ {plan.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removePlan(plan.id)} className="p-2 text-red-400"><Trash2 size={18} /></button>
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
