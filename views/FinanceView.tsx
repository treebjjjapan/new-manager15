
import React, { useState } from 'react';
import { User, Student, Payment, PaymentMethod, UserRole } from '../types.ts';
import { addLog } from '../db.ts';
import { Download, CreditCard, PieChart, TrendingUp, AlertTriangle, Wallet, ArrowUpCircle, Banknote, Landmark } from 'lucide-react';

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
    setPaymentMethod(PaymentMethod.CASH);
    setPaymentNotes('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Wallet className="text-blue-600" size={32} />
            Caixa & Financeiro
          </h2>
          <p className="text-slate-500">Gestão profissional de recebimentos em Ienes (¥).</p>
        </div>
        <button onClick={() => setPaymentModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-200 hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95">
          <ArrowUpCircle size={24} /> ABRIR RECEBIMENTO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Total em Caixa (Mês)</h3>
            <p className="text-5xl font-black text-white italic">¥ {totalReceived.toLocaleString()}</p>
          </div>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {Object.entries(methodTotals).map(([method, total]: any) => (
              <div key={method} className="shrink-0 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-bold uppercase">{method}</p>
                <p className="text-sm font-bold text-white">¥ {total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-red-500 flex flex-col justify-center items-center">
          <h3 className="font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2 text-slate-400"><AlertTriangle size={16} /> Alunos Vencidos</h3>
          <p className="text-5xl font-black">{overdueStudents.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h3 className="font-bold text-slate-900">Histórico Recente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Forma</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...db.payments].reverse().map((payment: Payment) => {
                const student = db.students.find((s: any) => s.id === payment.studentId);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{student?.name || 'Aluno Excluído'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black">¥ {payment.amount.toLocaleString()}</td>
                  </tr>
                );
              })}
              {db.payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Nenhum pagamento registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setPaymentModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-zoom-in">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
                  <Banknote size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Lançar Recebimento</h3>
                  <p className="text-slate-500 text-sm">Preencha os detalhes do pagamento.</p>
                </div>
              </div>

              <form onSubmit={handleReceive} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Aluno Ativo</label>
                  <select 
                    required 
                    value={selectedStudentId} 
                    onChange={(e) => setSelectedStudentId(e.target.value)} 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold appearance-none outline-none focus:border-green-500 transition-all"
                  >
                    <option value="">Selecione o aluno...</option>
                    {db.students.filter((s:any) => s.status === 'active').map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor do Pagamento</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-400 italic">¥</span>
                    <input 
                      type="number" 
                      required 
                      value={paymentAmount || ''} 
                      onChange={(e) => setPaymentAmount(parseInt(e.target.value))} 
                      className="w-full pl-12 pr-5 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-3xl text-blue-600 outline-none focus:border-green-500 transition-all" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Forma de Pagamento</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.CASH ? 'bg-green-50 border-green-600 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <Banknote size={24} />
                      <span className="text-[10px] font-black uppercase">Dinheiro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(PaymentMethod.CREDIT)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.CREDIT || paymentMethod === PaymentMethod.DEBIT ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <CreditCard size={24} />
                      <span className="text-[10px] font-black uppercase">Cartão</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(PaymentMethod.BANK)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.BANK ? 'bg-amber-50 border-amber-600 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <Landmark size={24} />
                      <span className="text-[10px] font-black uppercase">Conta Bancária</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95">
                    CONFIRMAR RECEBIMENTO
                  </button>
                  <button type="button" onClick={() => setPaymentModalOpen(false)} className="w-full py-4 mt-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
