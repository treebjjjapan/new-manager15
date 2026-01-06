
import React, { useState } from 'react';
import { User, Student, Payment, PaymentMethod, UserRole } from '../types';
import { addLog } from '../db';
import { Download, CreditCard, PieChart, TrendingUp, AlertTriangle, Wallet, ArrowUpCircle, Banknote } from 'lucide-react';

interface FinanceViewProps {
  db: any;
  updateDB: (updater: (db: any) => any) => void;
  currentUser: User;
}

const FinanceView: React.FC<FinanceViewProps> = ({ db, updateDB, currentUser }) => {
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentNotes, setPaymentNotes] = useState('');

  const totalReceived = db.payments.reduce((acc: number, p: Payment) => acc + p.amount, 0);
  const overdueStudents = db.students.filter((s: Student) => s.status === 'active' && s.overdue);

  const getMethodTotals = () => {
    return db.payments.reduce((acc: any, p: Payment) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});
  };

  const methodTotals = getMethodTotals();

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || paymentAmount <= 0) return;

    const student = db.students.find((s: any) => s.id === selectedStudentId);
    
    updateDB(prev => {
      const newPayment: Payment = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: selectedStudentId,
        date: new Date().toISOString().split('T')[0],
        amount: paymentAmount,
        method: paymentMethod,
        notes: paymentNotes
      };

      const newStudents = prev.students.map((s: any) => 
        s.id === selectedStudentId ? { ...s, overdue: false } : s
      );

      addLog(`Recebimento Caixa: ¥${paymentAmount.toLocaleString()} em ${paymentMethod} (${student?.name})`, currentUser.id);

      return {
        ...prev,
        payments: [...prev.payments, newPayment],
        students: newStudents
      };
    });

    setPaymentModalOpen(false);
    setSelectedStudentId('');
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const generateReport = (type: string) => {
    alert(`Gerando relatório PDF de ${type}... (Simulado no MVP)`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Wallet className="text-blue-600" size={32} />
            Caixa & Financeiro
          </h2>
          <p className="text-slate-500">Gestão profissional de recebimentos em Ienes (¥).</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={() => setPaymentModalOpen(true)}
             className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-200 hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <ArrowUpCircle size={24} />
            ABRIR RECEBIMENTO
          </button>
        </div>
      </div>

      {/* Resumo de Caixa Profissional */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Total em Caixa (Mês)</h3>
            <p className="text-5xl font-black text-white italic">¥ {totalReceived.toLocaleString()}</p>
          </div>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {Object.entries(methodTotals).map(([method, total]: any) => (
              <div key={method} className="shrink-0 bg-slate-800 px-4 py-2 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase">{method}</p>
                <p className="text-sm font-bold text-white">¥ {total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-red-500">
            <AlertTriangle size={20} />
            <h3 className="font-bold text-xs uppercase tracking-widest">Inadimplência</h3>
          </div>
          <p className="text-4xl font-black text-red-600">{overdueStudents.length}</p>
          <p className="text-xs text-slate-500 mt-2">Alunos ativos com pendência</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <Download size={20} />
            <h3 className="font-bold text-xs uppercase tracking-widest">Relatórios</h3>
          </div>
          <div className="space-y-2 mt-4">
            <button onClick={() => generateReport('Fechamento')} className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
              FECHAMENTO MENSAL
            </button>
            <button onClick={() => generateReport('Inadimplentes')} className="w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
              LISTA DE VENCIDOS
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">Fluxo de Caixa Recente</h3>
          <span className="text-xs font-bold text-slate-400 uppercase">Últimos Lançamentos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...db.payments].reverse().map((payment: Payment) => {
                const student = db.students.find((s: any) => s.id === payment.studentId);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{student?.name || 'Aluno Excluído'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase ${
                         payment.method === PaymentMethod.CASH ? 'bg-green-100 text-green-700' :
                         payment.method === PaymentMethod.BANK ? 'bg-blue-100 text-blue-700' :
                         'bg-purple-100 text-purple-700'
                       }`}>
                         {payment.method}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-slate-900">¥ {payment.amount.toLocaleString()}</td>
                  </tr>
                );
              })}
              {db.payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">Nenhum movimento registrado no caixa.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment/Cashier Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setPaymentModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 animate-zoom-in overflow-hidden border border-gray-100">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black italic tracking-tight uppercase">Terminal de Recebimento</h3>
                <p className="text-slate-400 text-sm font-bold">Lançamento de mensalidade em ¥</p>
              </div>
              <Banknote size={40} className="text-green-500" />
            </div>
            
            <form onSubmit={handleReceive} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Selecionar Aluno</label>
                <select 
                  required
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const student = db.students.find((s:any) => s.id === e.target.value);
                    const plan = db.plans.find((p:any) => p.id === student?.planId);
                    if (plan) setPaymentAmount(plan.price);
                  }}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none"
                >
                  <option value="">Selecione o aluno...</option>
                  {db.students.filter((s:any) => s.status === 'active').sort((a:any, b:any) => a.name.localeCompare(b.name)).map((s:any) => (
                    <option key={s.id} value={s.id}>{s.name} {s.overdue ? '🔴 PENDENTE' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Valor (¥)</label>
                  <input 
                    type="number" 
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseInt(e.target.value))}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-2xl text-blue-600 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Data</label>
                  <input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Método de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PaymentMethod).map(m => (
                    <button 
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-3 px-4 rounded-xl border-2 text-xs font-black transition-all ${paymentMethod === m ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                    >
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Observações do Recebimento</label>
                <input 
                  type="text"
                  placeholder="Ex: Pagamento referente a Janeiro"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3">
                  <ArrowUpCircle size={24} />
                  CONFIRMAR E LANÇAR
                </button>
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="w-full py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-colors">
                  CANCELAR OPERAÇÃO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
