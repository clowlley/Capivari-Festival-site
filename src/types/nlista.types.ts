export interface ListType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Registration {
  id: number;
  full_name: string;
  cpf_rg?: string;
  phone?: string;
  list_type_id: number;
  list_name?: string;
  parking: boolean;
  payment_status: 'pago' | 'pendente';
  created_at?: string;
  updated_at?: string;
}

export interface NListaFormState {
  full_name: string;
  cpf_rg: string;
  phone: string;
  list_type_id: string;
  parking: boolean;
}