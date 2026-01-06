
export enum Belt {
  WHITE = 'Branca',
  GRAY = 'Cinza',
  YELLOW = 'Amarela',
  ORANGE = 'Laranja',
  GREEN = 'Verde',
  BLUE = 'Azul',
  PURPLE = 'Roxa',
  BROWN = 'Marrom',
  BLACK = 'Preta'
}

export enum PaymentMethod {
  CASH = 'Dinheiro',
  BANK = 'Banco/PIX',
  CREDIT = 'Cartão de Crédito',
  DEBIT = 'Cartão de Débito',
  OTHER = 'Outro'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTION = 'RECEPTION',
  PROFESSOR = 'PROFESSOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // In JPY (Yen)
}

export interface Student {
  id: string;
  name: string;
  photo?: string; // base64
  phone?: string;
  birthDate?: string;
  startDate?: string; // New: Joining date
  socialMedia?: string; // New: Instagram/Social link
  notes?: string;
  status: 'active' | 'inactive';
  belt: Belt;
  stripes: number; // 0-4
  lastBeltUpdate: string;
  planId?: string;
  overdue: boolean;
}

export interface Payment {
  id: string;
  studentId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  time: string;
  source: 'TOTEM' | 'ADMIN';
  classType: string;
}

export interface Schedule {
  id: string;
  day: string;
  time: string;
  classType: string;
}

export interface Log {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
}
