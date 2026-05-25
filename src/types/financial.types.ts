export interface FinancialEntry {
  id: number;
  event_id?: number | null;
  name: string;
  description?: string;
  category: string;
  type: 'entrada' | 'saida';
  amount: number | string;
  payment_status: 'pago' | 'pendente' | 'atrasado';
  date: string;
  responsible?: string;
  priority: 'baixa' | 'media' | 'alta';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}