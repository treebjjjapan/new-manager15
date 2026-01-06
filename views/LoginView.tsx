
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@jiujitsu.com');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@jiujitsu.com' && password === 'admin123') {
      onLogin({ id: 'admin', name: 'Mestre Admin', email, role: UserRole.ADMIN });
    } else {
      alert('Credenciais inválidas. Use admin@jiujitsu.com / admin123 para o MVP.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <span className="text-white text-3xl font-black italic">OSS</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Seja Bem-vindo</h2>
          <p className="text-gray-500 mt-2">Acesse o sistema de gestão da academia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200"
          >
            Acessar Sistema
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">Jiu-Jitsu Academy Pro</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
