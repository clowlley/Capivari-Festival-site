import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit3, CheckCircle2,
  Calendar, User, AlignLeft
} from 'lucide-react';
import { taskService } from '@/services/tasks.service';
import { eventService } from '@/services/events.service';
import type { Task } from '@/types/task.types';
import type { Event } from '@/types/event.types';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { CustomSelect } from '@/components/ui/CustomSelect';
import styles from './OperationalManager.module.css';

const OperationalManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    responsible: '',
    deadline: '',
    priority: 'media',
    status: 'pendente',
    event_id: null,
    notes: ''
  });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, eventsData] = await Promise.all([
        taskService.getTasks(),
        eventService.getAdminEvents()
      ]);
      setTasks(tasksData);
      setEvents(eventsData);
    } catch {
      toast.error('Erro ao carregar dados operacionais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bootstrap on mount
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      responsible: '',
      deadline: '',
      priority: 'media',
      status: 'pendente',
      event_id: null,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      ...task,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await taskService.updateTask(editingTaskId, form);
        toast.success('Tarefa atualizada!');
      } else {
        await taskService.createTask(form);
        toast.success('Tarefa criada!');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Erro ao salvar tarefa');
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      await taskService.updateTask(task.id, { status: newStatus });
      toast.success(`Tarefa marcada como ${newStatus.replace('_', ' ')}`);
      loadData();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.responsible?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Operacional / Tarefas</h1>
        <Button onClick={handleOpenNew}>
          <Plus size={18} /> Nova Tarefa
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos os Status' },
            { value: 'pendente', label: 'Pendente' },
            { value: 'em_andamento', label: 'Em Andamento' },
            { value: 'concluida', label: 'Concluída' },
            { value: 'atrasada', label: 'Atrasada' },
          ]}
        />
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Carregando tarefas...</div>
        ) : (
          <Table headers={['Tarefa', 'Responsável', 'Prazo', 'Prioridade', 'Status', 'Ações']}>
            {filteredTasks.map(task => (
              <TableRow key={task.id}>
                <TableCell label="Tarefa">
                  <div className={styles.taskTitle}>
                    <strong>{task.title}</strong>
                    {task.description && <p className={styles.description}>{task.description}</p>}
                  </div>
                </TableCell>
                <TableCell label="Responsável">
                  <div className={styles.userCell}>
                    <User size={14} />
                    <span>{task.responsible || '-'}</span>
                  </div>
                </TableCell>
                <TableCell label="Prazo">
                  <div className={styles.dateCell}>
                    <Calendar size={14} />
                    <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                </TableCell>
                <TableCell label="Prioridade">
                  <Badge type={task.priority === 'alta' ? 'danger' : task.priority === 'media' ? 'warning' : 'info'}>
                    {task.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell label="Status">
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell label="Ações">
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(task)} title="Editar">
                      <Edit3 size={16} />
                    </button>
                    {task.status !== 'concluida' && (
                      <button onClick={() => handleStatusChange(task, 'concluida')} title="Concluir">
                        <CheckCircle2 size={16} className={styles.textGreen} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Título</label>
            <div className={styles.inputWrap}>
              <AlignLeft size={14} />
              <input required placeholder="Título da tarefa" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Responsável</label>
              <div className={styles.inputWrap}>
                <User size={14} />
                <input placeholder="Nome do responsável" value={form.responsible} onChange={e => setForm({...form, responsible: e.target.value})} />
              </div>
            </div>
            <div className={styles.field}>
              <label>Prazo</label>
              <div className={styles.inputWrap}>
                <Calendar size={14} />
                <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Prioridade</label>
              <CustomSelect
                fullWidth
                value={form.priority || 'media'}
                onChange={val => setForm({...form, priority: val as Task['priority']})}
                options={[
                  { value: 'baixa', label: 'Baixa' },
                  { value: 'media', label: 'Média' },
                  { value: 'alta', label: 'Alta' },
                ]}
              />
            </div>
            <div className={styles.field}>
              <label>Vincular a Evento</label>
              <CustomSelect
                fullWidth
                value={form.event_id ? String(form.event_id) : ''}
                onChange={val => setForm({...form, event_id: val ? parseInt(val) : null})}
                options={[
                  { value: '', label: 'Nenhum evento' },
                  ...events.map(ev => ({ value: String(ev.id), label: ev.title }))
                ]}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Descrição</label>
            <textarea rows={3} placeholder="Detalhes da tarefa..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <Button type="submit">Salvar Tarefa</Button>
        </form>
      </Modal>
    </div>
  );
};

export default OperationalManager;