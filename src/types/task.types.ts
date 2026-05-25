export interface Task {
  id: number;
  event_id?: number | null;
  title: string;
  description?: string;
  responsible?: string;
  deadline?: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  priority: 'baixa' | 'media' | 'alta';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}