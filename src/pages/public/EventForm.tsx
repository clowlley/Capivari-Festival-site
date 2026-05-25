import React, { useState, useEffect } from 'react';
import type { Event } from '@/types/event.types';
import { eventService } from '@/services/events.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import styles from './EventForm.module.css';

interface EventFormProps {
  event?: Event | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onCancel }) => {
  const isEdit = !!event;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: '',
    event_type: '',
    status: 'draft',
    featured: false,
    description: '',
    full_content: '',
    starts_at: '',
    ends_at: '',
    location_name: '',
    location_address: '',
    registration_url: '',
    max_attendees: 0,
    price: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (event) {
      // Formatar datas para o input datetime-local (YYYY-MM-DDTHH:mm)
      const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().slice(0, 16);
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync prop -> form state
      setFormData({
        ...event,
        starts_at: formatDate(event.starts_at),
        ends_at: formatDate(event.ends_at),
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append todos os campos ao FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });

      if (selectedFile) {
        data.append('cover_image_file', selectedFile);
      }

      if (isEdit && event?.id) {
        await eventService.updateEvent(event.id, data);
        toast.success('Evento atualizado com sucesso!');
      } else {
        await eventService.createEvent(data);
        toast.success('Evento criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao salvar evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Título do Evento</label>
          <input name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className={styles.field}>
          <label>Categoria</label>
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Ex: Show, Palestra" />
        </div>

        <div className={styles.field}>
          <label>Tipo de Ingresso</label>
          <input name="event_type" value={formData.event_type} onChange={handleChange} placeholder="Ex: Gratuito, Pago" />
        </div>

        <div className={styles.field}>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Início</label>
          <input type="datetime-local" name="starts_at" value={formData.starts_at} onChange={handleChange} required />
        </div>

        <div className={styles.field}>
          <label>Término (Opcional)</label>
          <input type="datetime-local" name="ends_at" value={formData.ends_at} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Local (Nome)</label>
          <input name="location_name" value={formData.location_name} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Endereço</label>
          <input name="location_address" value={formData.location_address} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Preço (R$)</label>
          <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Limite de Vagas</label>
          <input type="number" name="max_attendees" value={formData.max_attendees} onChange={handleChange} />
        </div>
      </div>

      <div className={styles.field}>
        <label>URL de Inscrição</label>
        <input type="url" name="registration_url" value={formData.registration_url} onChange={handleChange} />
      </div>

      <div className={styles.field}>
        <label>Breve Descrição</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required />
      </div>

      <div className={styles.field}>
        <label>Conteúdo Completo</label>
        <textarea name="full_content" value={formData.full_content} onChange={handleChange} rows={6} />
      </div>

      <div className={styles.field}>
        <label>Imagem de Capa</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {isEdit && !selectedFile && event?.cover_image && (
          <p className={styles.helpText}>Mantenha vazio para manter a imagem atual.</p>
        )}
      </div>

      <div className={styles.checkboxField}>
        <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
        <label htmlFor="featured">Destacar este evento na home</label>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {isEdit ? 'Atualizar Evento' : 'Criar Evento'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;