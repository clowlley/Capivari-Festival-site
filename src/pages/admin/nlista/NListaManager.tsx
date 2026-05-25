import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Edit3,
  Printer, UserPlus, Filter, Car,
  User, FileText, Phone
} from 'lucide-react';
import { nlistaService } from '@/services/nlista.service';
import type { Registration, ListType, NListaFormState } from '@/types/nlista.types';
import { useToast } from '@/hooks/useToast';
import { formatCpfRg, formatPhone, toTitleCase, onlyDigits } from '@/utils/formatters';
import { validateCpfRg, validatePhone, validateName } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import styles from './NListaManager.module.css';

const NListaManager: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [listTypes, setListTypes] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<NListaFormState>({
    full_name: '',
    cpf_rg: '',
    phone: '',
    list_type_id: '',
    parking: false
  });

  const [newTypeName, setNewType] = useState('');
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [regData, typesData] = await Promise.all([
        nlistaService.getRegistrations(),
        nlistaService.getListTypes()
      ]);
      setRegistrations(regData);
      setListTypes(typesData);
    } catch {
      toast.error('Erro ao carregar dados da lista');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { loadData(); }, []);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ full_name: '', cpf_rg: '', phone: '', list_type_id: '', parking: false });
    setIsModalOpen(true);
  };

  const handleEdit = (reg: Registration) => {
    setEditingId(reg.id);
    setForm({
      full_name: reg.full_name,
      cpf_rg: reg.cpf_rg || '',
      phone: reg.phone || '',
      list_type_id: String(reg.list_type_id),
      parking: reg.parking
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateName(form.full_name)) return toast.error('Nome inválido (mínimo nome e sobrenome)');
    if (form.cpf_rg && !validateCpfRg(form.cpf_rg)) return toast.error('CPF ou RG inválido');
    if (form.phone && !validatePhone(form.phone)) return toast.error('Telefone inválido — use DDD + número (10 ou 11 dígitos)');

    const payload = {
      ...form,
      full_name: toTitleCase(form.full_name),
      cpf_rg: onlyDigits(form.cpf_rg),
      phone: onlyDigits(form.phone),
      list_type_id: Number(form.list_type_id),
    };

    try {
      if (editingId) {
        await nlistaService.updateRegistration(editingId, payload);
        toast.success('Cadastro atualizado');
      } else {
        await nlistaService.createRegistration(payload);
        toast.success('Pessoa adicionada à lista');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Erro ao salvar cadastro');
    }
  };

  const handleTogglePayment = async (reg: Registration) => {
    const nextStatus = reg.payment_status === 'pago' ? 'pendente' : 'pago';
    try {
      await nlistaService.updateRegistration(reg.id, { payment_status: nextStatus });
      toast.success('Status de pagamento alterado');
      loadData();
    } catch {
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta pessoa da lista?')) return;
    try {
      await nlistaService.deleteRegistration(id);
      toast.success('Removido');
      loadData();
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await nlistaService.createListType(newTypeName);
      toast.success('Categoria criada');
      setNewType('');
      loadData();
    } catch {
      toast.error('Erro ao criar categoria');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          reg.cpf_rg?.includes(searchTerm);
    const matchesType = typeFilter === 'all' || String(reg.list_type_id) === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Credenciamento (NLista)</h1>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => setIsTypeModalOpen(true)}>
            <Filter size={18} /> Categorias
          </Button>
          <Button onClick={handleOpenNew}>
            <UserPlus size={18} /> Novo Cadastro
          </Button>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input 
            placeholder="Buscar por nome ou documento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CustomSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[{ value: 'all', label: 'Todas as Listas' }, ...listTypes.map(t => ({ value: String(t.id), label: t.name }))]}
        />
        <button className={styles.btnPrint} onClick={() => window.print()}>
          <Printer size={18} /> Imprimir
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Carregando registros...</div>
        ) : (
          <Table headers={['Nome Completo', 'Documento', 'Telefone', 'Lista', 'Estac.', 'Pagamento', 'Ações']}>
            {filteredRegistrations.map(reg => (
              <TableRow key={reg.id}>
                <TableCell label="Nome Completo"><strong>{reg.full_name}</strong></TableCell>
                <TableCell label="Documento">{reg.cpf_rg ? formatCpfRg(reg.cpf_rg) : '-'}</TableCell>
                <TableCell label="Telefone">{reg.phone ? formatPhone(reg.phone) : '-'}</TableCell>
                <TableCell label="Lista"><span className={styles.typeBadge}>{reg.list_name}</span></TableCell>
                <TableCell label="Estac.">
                  {reg.parking ? <Car size={16} className={styles.textGold} /> : '-'}
                </TableCell>
                <TableCell label="Pagamento">
                  <div className={styles.paymentCell} onClick={() => handleTogglePayment(reg)}>
                    <StatusBadge status={reg.payment_status} />
                  </div>
                </TableCell>
                <TableCell label="Ações">
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(reg)} title="Editar"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(reg.id)} title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Pessoa' : 'Novo Cadastro'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nome Completo</label>
            <div className={styles.inputWrap}>
              <User size={14} />
              <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Nome e sobrenome" />
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>CPF ou RG</label>
              <div className={styles.inputWrap}>
                <FileText size={14} />
                <input
                  value={form.cpf_rg}
                  onChange={e => {
                    const digits = onlyDigits(e.target.value);
                    setForm({ ...form, cpf_rg: formatCpfRg(digits) });
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>Telefone</label>
              <div className={styles.inputWrap}>
                <Phone size={14} />
                <input
                  value={form.phone}
                  onChange={e => {
                    const digits = onlyDigits(e.target.value);
                    setForm({ ...form, phone: formatPhone(digits) });
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Tipo de Lista</label>
              <CustomSelect
                fullWidth
                value={form.list_type_id}
                onChange={val => setForm({ ...form, list_type_id: val })}
                options={[{ value: '', label: 'Selecione...' }, ...listTypes.map(t => ({ value: String(t.id), label: t.name }))]}
              />
            </div>
            <div className={styles.checkboxField}>
              <input type="checkbox" id="parking" checked={form.parking} onChange={e => setForm({...form, parking: e.target.checked})} />
              <label htmlFor="parking"><Car size={14} /> Vaga de Estacionamento</label>
            </div>
          </div>
          <Button type="submit">Confirmar Cadastro</Button>
        </form>
      </Modal>

      <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="Gerenciar Categorias">
        <form onSubmit={handleAddType} className={styles.addTypeForm}>
          <input value={newTypeName} onChange={e => setNewType(e.target.value)} placeholder="Novo tipo (ex: VIP)" required />
          <Button type="submit"><Plus size={16} /></Button>
        </form>
        <div className={styles.typeList}>
          {listTypes.map(t => (
            <div key={t.id} className={styles.typeItem}>
              <span>{t.name}</span>
              <button onClick={() => nlistaService.deleteListType(t.id).then(loadData)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default NListaManager;