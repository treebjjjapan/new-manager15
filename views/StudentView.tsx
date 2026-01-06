
import React, { useState, useRef, useEffect } from 'react';
import { Student, Belt, User, UserRole } from '../types.ts';
import { Plus, Search, Camera, Edit2, Trash2, ChevronRight, UserPlus, Users, X, Check, Instagram } from 'lucide-react';
import { addLog } from '../db.ts';

interface StudentViewProps {
  db: any;
  updateDB: (updater: (db: any) => any) => void;
  currentUser: User;
}

const StudentView: React.FC<StudentViewProps> = ({ db, updateDB, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const students = db.students.filter((s: Student) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const belts = Object.values(Belt);

  const getBeltColorClass = (belt: Belt) => {
    switch (belt) {
      case Belt.WHITE: return 'bg-white';
      case Belt.GRAY: return 'bg-gray-400';
      case Belt.YELLOW: return 'bg-yellow-400';
      case Belt.ORANGE: return 'bg-orange-500';
      case Belt.GREEN: return 'bg-green-500';
      case Belt.BLUE: return 'bg-blue-600';
      case Belt.PURPLE: return 'bg-purple-600';
      case Belt.BROWN: return 'bg-amber-900';
      case Belt.BLACK: return 'bg-slate-900';
      default: return 'bg-white';
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 400, height: 400 },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setEditingStudent(prev => ({ ...prev, photo: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent?.name) return;

    updateDB(prev => {
      const newStudents = [...prev.students];
      if (editingStudent.id) {
        const index = newStudents.findIndex(s => s.id === editingStudent.id);
        const oldBelt = newStudents[index].belt;
        newStudents[index] = { ...newStudents[index], ...editingStudent } as Student;
        if (oldBelt !== editingStudent.belt) {
           newStudents[index].lastBeltUpdate = new Date().toISOString();
           addLog(`Mudança de graduação: ${newStudents[index].name} para ${editingStudent.belt}`, currentUser.id);
        }
      } else {
        const newStudent: Student = {
          id: Math.random().toString(36).substr(2, 9),
          name: editingStudent.name!,
          status: 'active',
          belt: editingStudent.belt || Belt.WHITE,
          stripes: editingStudent.stripes || 0,
          lastBeltUpdate: new Date().toISOString(),
          overdue: false,
          ...editingStudent
        } as Student;
        newStudents.push(newStudent);
        addLog(`Novo aluno cadastrado: ${newStudent.name}`, currentUser.id);
      }
      return { ...prev, students: newStudents };
    });
    setModalOpen(false);
    setEditingStudent(null);
    stopCamera();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingStudent(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Alunos</h2>
          <p className="text-slate-500">Gerencie a lista e graduações dos lutadores.</p>
        </div>
        <button 
          onClick={() => { setEditingStudent({ status: 'active', belt: Belt.WHITE, stripes: 0, startDate: new Date().toISOString().split('T')[0] }); setModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <UserPlus size={20} />
          Cadastrar Aluno
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar aluno por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Faixa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Graus</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 shrink-0">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Users size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.phone || 'Sem telefone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full border border-gray-200 shadow-sm ${getBeltColorClass(student.belt)}`}></div>
                       <span className="text-sm text-slate-700 font-medium">{student.belt}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-2 h-4 rounded-sm ${i < student.stripes ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nenhum aluno encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); stopCamera(); }}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-zoom-in">
            <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-2xl font-bold mb-6">{editingStudent?.id ? 'Editar Aluno' : 'Novo Cadastro'}</h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-40 flex flex-col items-center gap-3 shrink-0">
                    <div className="w-40 h-40 rounded-3xl bg-slate-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
                      {isCameraActive ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      ) : editingStudent?.photo ? (
                        <img src={editingStudent.photo} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="text-gray-300" size={48} />
                      )}
                      
                      {!isCameraActive && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                          <button 
                            type="button"
                            onClick={startCamera}
                            className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Camera size={20} />
                          </button>
                          <label className="p-2 bg-white rounded-full text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                            <Plus size={20} />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      {isCameraActive ? (
                        <div className="flex gap-2 w-full">
                          <button 
                            type="button" 
                            onClick={capturePhoto}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Check size={14} /> CAPTURAR
                          </button>
                          <button 
                            type="button" 
                            onClick={stopCamera}
                            className="p-2 bg-red-100 text-red-600 rounded-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={startCamera}
                          className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Camera size={14} /> TIRAR FOTO
                        </button>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nome Completo</label>
                      <input 
                        type="text" 
                        required
                        value={editingStudent?.name || ''}
                        onChange={(e) => setEditingStudent(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Telefone/WhatsApp</label>
                      <input 
                        type="text" 
                        value={editingStudent?.phone || ''}
                        onChange={(e) => setEditingStudent(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Rede Social (Instagram/FB)</label>
                      <div className="relative">
                         <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                         <input 
                          type="text" 
                          placeholder="@seuusuario"
                          value={editingStudent?.socialMedia || ''}
                          onChange={(e) => setEditingStudent(prev => ({ ...prev, socialMedia: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Data Nascimento</label>
                      <input 
                        type="date" 
                        value={editingStudent?.birthDate || ''}
                        onChange={(e) => setEditingStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Data de Início</label>
                      <input 
                        type="date" 
                        value={editingStudent?.startDate || ''}
                        onChange={(e) => setEditingStudent(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Status</label>
                    <select 
                      value={editingStudent?.status || 'active'}
                      onChange={(e) => setEditingStudent(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Faixa</label>
                    <select 
                      value={editingStudent?.belt || Belt.WHITE}
                      onChange={(e) => setEditingStudent(prev => ({ ...prev, belt: e.target.value as Belt }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {Object.values(Belt).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Graus (0-4)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="4"
                      value={editingStudent?.stripes || 0}
                      onChange={(e) => setEditingStudent(prev => ({ ...prev, stripes: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => { setModalOpen(false); stopCamera(); }}
                    className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    Salvar Aluno
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

export default StudentView;
