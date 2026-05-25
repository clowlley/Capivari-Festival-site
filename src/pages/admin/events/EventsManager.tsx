import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { eventService } from '@/services/events.service';
import type { Event } from '@/types/event.types';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import EventForm from './EventForm';
import styles from './EventsManager.module.css';

const statusClass: Record<string, string> = {
  draft: styles.draft,
  published: styles.published,
  cancelled: styles.cancelled,
  completed: styles.completed,
};

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

const EventsManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAdminEvents();
      setEvents(data);
    } catch {
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { loadData(); }, []);

  const handleNew = () => { setEditing(null); setIsModalOpen(true); };
  const handleEdit = (ev: Event) => { setEditing(ev); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditing(null); };
  const handleSuccess = () => { handleClose(); loadData(); };

  const handleComplete = async (id: number) => {
    if (!confirm('Marcar este evento como concluído?')) return;
    try {
      await eventService.completeEvent(id);
      toast.success('Evento marcado como concluído');
      loadData();
    } catch {
      toast.error('Erro ao concluir evento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este evento?')) return;
    try {
      await eventService.deleteEvent(id);
      toast.success('Evento removido');
      loadData();
    } catch {
      toast.error('Erro ao remover evento');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Eventos</h1>
        <Button onClick={handleNew}><Plus size={16} /> Novo Evento</Button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Início</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td className={styles.tdTitle}>{ev.title}</td>
                  <td>
                    <span className={`${styles.statusTag} ${statusClass[ev.status] ?? ''}`}>
                      {statusLabel[ev.status] ?? ev.status}
                    </span>
                  </td>
                  <td>{new Date(ev.starts_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className={styles.actions}>
                      <button onClick={() => handleEdit(ev)} title="Editar"><Edit3 size={15} /></button>
                      {ev.status !== 'completed' && (
                        <button className={styles.complete} onClick={() => handleComplete(ev.id)} title="Marcar como concluído"><CheckCircle size={15} /></button>
                      )}
                      <button className={styles.danger} onClick={() => handleDelete(ev.id)} title="Excluir"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={4} className={styles.empty}>Nenhum evento cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editing ? 'Editar Evento' : 'Novo Evento'}>
        <EventForm event={editing} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default EventsManager;
