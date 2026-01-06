
import { Student, Payment, Attendance, Plan, Log, Schedule, User, UserRole } from './types.ts';

const STORAGE_KEY = 'OSS_JIU_JITSU_DB';

interface DB {
  students: Student[];
  payments: Payment[];
  attendances: Attendance[];
  plans: Plan[];
  logs: Log[];
  schedules: Schedule[];
  users: User[];
}

const DEFAULT_DB: DB = {
  students: [],
  payments: [],
  attendances: [],
  plans: [
    { id: '1', name: 'Mensal', price: 10000 },
    { id: '2', name: 'Semestral', price: 55000 },
  ],
  logs: [],
  schedules: [
    { id: '1', day: 'Segunda', time: '19:00', classType: 'Gi' },
    { id: '2', day: 'Terça', time: '18:00', classType: 'No-Gi' },
  ],
  users: [
    { id: 'admin', name: 'Administrador', email: 'admin@jiujitsu.com', role: UserRole.ADMIN }
  ],
};

export const loadDB = (): DB => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : DEFAULT_DB;
};

export const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const addLog = (action: string, userId: string = 'admin') => {
  const db = loadDB();
  const log: Log = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    userId,
    action,
  };
  db.logs.push(log);
  saveDB(db);
};
