
import React, { useState, useRef, useEffect } from 'react';
import { Student, Belt, User, UserRole } from '../types.ts';
import { Plus, Search, Camera, Edit2, Trash2, ChevronRight, UserPlus, Users, X, Check, Instagram, RefreshCw, AlertCircle } from 'lucide-react';
import { addLog } from '../db.ts';

interface StudentViewProps {
  db: any;
  updateDB: (updater: (db: any) => any) => void;
  currentUser: User;
}

type CameraMode = 'off' | 'loading' | 'active' | 'error';

const StudentView: React.FC<StudentViewProps> = ({ db, updateDB, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('off');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const students = db.students.filter((s: Student) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraMode('off');
  };

  const startCamera = async () => {
    setCameraMode('loading');
    setCameraError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Câmera não suportada neste navegador ou conexão não segura (HTTPS).");
      }

      // Parar qualquer stream anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = stream;

      // Importante: Aguardar o próximo tick para garantir que o elemento videoRef.current foi renderizado pelo React
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            // Safari exige playsInline, muted e autoPlay para funcionar sem interação extra
            await videoRef.current.play();
            setCameraMode('active');
          } catch (playErr) {
            console.error("Erro ao dar play no vídeo:", playErr);
            setCameraError("Erro ao iniciar o fluxo de vídeo.");
            setCameraMode('error');
          }
        } else {
          setCameraError("Falha interna: Elemento de vídeo não encontrado.");
          setCameraMode('error');
        }
      }, 100);

    } catch (err: any) {
      console.error("Erro ao acessar câmera:", err);
      setCameraMode('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Acesso negado. Por favor, permita o uso da câmera nas configurações do navegador.");
      } else {
        setCameraError(err.message || "Não foi possível acessar a câmera.");
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraMode === 'active') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        if (videoWidth === 0 || videoHeight === 0) return;

        const size = Math.min(videoWidth, videoHeight);
        canvas.width = 600;
        canvas.height = 600;
        
        const sourceX = (videoWidth - size) / 2;
        const sourceY = (videoHeight - size) / 2;

        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1); // Espelhar para ficar natural
        
        context.drawImage(
          video, 
          sourceX, sourceY, size, size, 
          0, 0, canvas.width, canvas.height
        );
        
        context.restore();
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
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
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Alunos</h2>
          <p className="text-slate-500">Gerencie a lista e graduações dos lutadores.</p>
        </div>
        <button 
          onClick={() => { setEditingStudent({ status: 'active', belt: Belt.WHITE, stripes: 0, startDate: new Date().toISOString().split('T')[0] }); setModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{editingStudent?.id ? 'Editar Aluno' : 'Novo Cadastro'}</h3>
                <button onClick={() => { setModalOpen(false); stopCamera(); }} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-64 flex flex-col items-center gap-4 shrink-0">
                    <div className="w-64 h-64 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
                      
                      {/* Câmera e Vídeo Renderizados se necessário */}
                      {(cameraMode === 'active' || cameraMode === 'loading') && (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          muted 
                          playsInline 
                          className={`w-full h-full object-cover scale-x-[-1] ${cameraMode === 'active' ? 'block' : 'hidden'}`}
                        />
                      )}

                      {/* Estados de Carregamento e Erro */}
                      {cameraMode === 'loading' && (
                        <div className="flex flex-col items-center gap-3 text-blue-600">
                          <RefreshCw className="animate-spin" size={40} />
                          <span className="text-xs font-bold uppercase tracking-widest">Iniciando...</span>
                        </div>
                      )}

                      {cameraMode === 'error' && (
                        <div className="p-4 text-center">
                          <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
                          <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">{cameraError}</p>
                          <button 
                            type="button" 
                            onClick={startCamera}
                            className="mt-3 text-blue-600 text-xs font-bold hover:underline"
                          >
                            Tentar Novamente
                          </button>
                        </div>
                      )}

                      {/* Foto capturada ou Placeholder */}
                      {cameraMode === 'off' && (
                        <>
                          {editingStudent?.photo ? (
                            <img src={editingStudent.photo} className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="text-slate-300" size={64} />
                          )}
                          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                            <button 
                              type="button"
                              onClick={startCamera}
                              className="p-3 bg-white rounded-2xl text-blue-600 shadow-xl hover:scale-110 transition-transform"
                              title="Ligar Câmera"
                            >
                              <Camera size={24} />
                            </button>
                            <label className="p-3 bg-white rounded-2xl text-slate-600 shadow-xl hover:scale-110 transition-transform cursor-pointer" title="Upload de Arquivo">
                              <Plus size={24} />
                              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full">
                      {cameraMode === 'active' ? (
                        <div className="flex gap-2 w-full">
                          <button 
                            type="button" 
                            onClick={capturePhoto}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
                          >
                            <Check size={20} /> CAPTURAR FOTO
                          </button>
                          <button 
                            type="button" 
                            onClick={stopCamera}
                            className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={startCamera}
                          disabled={cameraMode === 'loading'}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                          {cameraMode === 'loading' ? <RefreshCw className="animate-spin" size={16} /> : <Camera size={16} />}
                          ABRIR CÂMERA
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">WhatsApp / Telefone</label>
                      <input 
                        type="text" 
                        value={editingStudent?.phone || ''}
                        onChange={(e) => setEditingStudent(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Instagram (@usuario)</label>
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    >
                      <option value="active">ATIVO</option>
                      <option value="inactive">INATIVO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Faixa</label>
                    <select 
                      value={editingStudent?.belt || Belt.WHITE}
                      onChange={(e) => setEditingStudent(prev => ({ ...prev, belt: e.target.value as Belt }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-white pb-4">
                  <button 
                    type="button"
                    onClick={() => { setModalOpen(false); stopCamera(); }}
                    className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    SALVAR FICHA
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
