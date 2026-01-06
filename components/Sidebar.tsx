
import React from 'react';
import { CurrentView } from '../App';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar, 
  Settings, 
  LogOut, 
  Tablet,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: CurrentView;
  setView: (view: CurrentView) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Painel', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.RECEPTION, UserRole.PROFESSOR] },
    { id: 'STUDENTS', label: 'Alunos', icon: Users, roles: [UserRole.ADMIN, UserRole.RECEPTION, UserRole.PROFESSOR] },
    { id: 'FINANCE', label: 'Financeiro', icon: CreditCard, roles: [UserRole.ADMIN, UserRole.RECEPTION] },
    { id: 'ATTENDANCE', label: 'Presença', icon: Calendar, roles: [UserRole.ADMIN, UserRole.RECEPTION, UserRole.PROFESSOR] },
    { id: 'CONFIG', label: 'Configuração', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 hidden md:block">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="bg-blue-600 p-1.5 rounded-lg">OSS</span>
          Jiu-Jitsu
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Gestão de Academia</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {allowedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as CurrentView)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}

        <div className="pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={() => setView('TOTEM')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-400 hover:bg-slate-800 transition-all border border-amber-900/30 bg-amber-900/10"
          >
            <Tablet size={20} />
            <span className="font-medium text-sm">Abrir Totem</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 uppercase">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm">Sair do Sistema</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
