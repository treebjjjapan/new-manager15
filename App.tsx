
import React, { useState, useEffect } from 'react';
import { User, UserRole, Student, Plan, Attendance, Payment, Schedule, Log, CurrentView } from './types';
import { loadDB, saveDB, addLog } from './db';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import StudentView from './views/StudentView';
import TotemView from './views/TotemView';
import FinanceView from './views/FinanceView';
import ConfigView from './views/ConfigView';
import Sidebar from './components/Sidebar';
import { Menu, X, LayoutDashboard, Users, CreditCard, Calendar, Settings, ShieldAlert, Tablet } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<CurrentView>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [db, setDb] = useState(loadDB());

  // Simple session persistence check
  useEffect(() => {
    const savedUser = localStorage.getItem('OSS_LOGGED_USER');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const updateDB = (updater: (db: any) => any) => {
    const newDb = updater({ ...db });
    setDb(newDb);
    saveDB(newDb);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('OSS_LOGGED_USER', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('OSS_LOGGED_USER');
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Totem view takes over the entire screen and has its own layout
  if (view === 'TOTEM') {
    return <TotemView students={db.students} onExit={() => setView('DASHBOARD')} updateDB={updateDB} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'DASHBOARD':
        return <DashboardView db={db} setView={setView} updateDB={updateDB} />;
      case 'STUDENTS':
        return <StudentView db={db} updateDB={updateDB} currentUser={currentUser} />;
      case 'FINANCE':
        return <FinanceView db={db} updateDB={updateDB} currentUser={currentUser} />;
      case 'CONFIG':
        return <ConfigView db={db} updateDB={updateDB} currentUser={currentUser} />;
      case 'ATTENDANCE':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Presença Diária</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
               <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...db.attendances].reverse().slice(0, 50).map((att) => {
                    const student = db.students.find(s => s.id === att.studentId);
                    return (
                      <tr key={att.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student?.name || 'Aluno Excluído'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(att.date + 'T' + att.time).toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{att.classType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${att.source === 'TOTEM' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {att.source}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {db.attendances.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhuma presença registrada hoje.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return <div className="p-6">View {view} em desenvolvimento...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white shadow-xl">
        <Sidebar currentView={view} setView={setView} user={currentUser} onLogout={handleLogout} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white shadow-sm">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg tracking-tight">OSS JIU-JITSU</span>
          <div className="w-6"></div> {/* Spacer */}
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-64 max-w-[80%] bg-slate-900 text-white flex flex-col animate-slide-in">
            <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <span className="font-bold text-lg">OSS Manager</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <Sidebar currentView={view} setView={(v) => { setView(v); setSidebarOpen(false); }} user={currentUser} onLogout={handleLogout} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
