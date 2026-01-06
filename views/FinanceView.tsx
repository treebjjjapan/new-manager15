
import React, { useState } from 'react';
import { User, Student, Payment, PaymentMethod, UserRole } from '../types.ts';
import { addLog } from '../db.ts';
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
              <div key={method} className="shrink-0 bg-slate-800 px-4 py-2 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase">{method}</p>
                <p className="text-sm font-bold text-white">¥ {total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-red-500">
          <h3 className="font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={16} /> Inadimplência</h3>
          <p className="text-4xl font-black">{overdueStudents.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...db.payments].reverse().map((payment: Payment) => {
              const student = db.students.find((s: any) => s.id === payment.studentId);
              return (
                <tr key={payment.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{student?.name || 'Aluno Excluído'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black">¥ {payment.amount.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setPaymentModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 p-8">
            <h3 className="text-2xl font-black mb-6">Recebimento</h3>
            <form onSubmit={handleReceive} className="space-y-4">
              <select required value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold appearance-none">
                <option value="">Selecione o aluno...</option>
                {db.students.filter((s:any) => s.status === 'active').map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="number" required value={paymentAmount} onChange={(e) => setPaymentAmount(parseInt(e.target.value))} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-2xl text-blue-600" placeholder="Valor ¥" />
              <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700">CONFIRMAR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
