import React, { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Type, Tag, Layers, ToggleLeft, Calendar, AlignLeft, Image, MapPin, Link, Users, DollarSign, Star } from 'lucide-react';
import type { Event } from '@/types/event.types';
import { eventService } from '@/services/events.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import styles from './EventForm.module.css';

const MAX_TAGS = 5;

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
    title: '', category: '', event_type: '', status: 'draft', featured: false,
    description: '', full_content: '', starts_at: '', ends_at: '',
    location_name: '', location_address: '', registration_url: '', max_attendees: 0, price: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (event) {
      const fmt = (d?: string) => d ? new Date(d).toISOString().slice(0, 16) : '';
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync prop -> form state
      setFormData({ ...event, starts_at: fmt(event.starts_at), ends_at: fmt(event.ends_at) });
      setTags(event.category ? event.category.split(',').map(t => t.trim()).filter(Boolean) : []);
    }
  }, [event]);

  const addTag = (raw: string) => {
    const val = raw.trim();
    if (!val || tags.length >= MAX_TAGS || tags.includes(val)) return;
    const next = [...tags, val];
    setTags(next);
    setFormData(prev => ({ ...prev, category: next.join(', ') }));
    setTagInput('');
  };

  const removeTag = (i: number) => {
    const next = tags.filter((_, idx) => idx !== i);
    setTags(next);
    setFormData(prev => ({ ...prev, category: next.join(', ') }));
  };

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      removeTag(tags.length - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) data.append(key, value.toString());
      });
      if (selectedFile) data.append('cover_image_file', selectedFile);

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
          <div className={styles.inputWrap}>
            <Type size={14} />
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Nome do evento" required />
          </div>
        </div>
        <div className={styles.field}>
          <label>Categorias <span className={styles.tagHint}>({tags.length}/{MAX_TAGS} — Enter ou vírgula)</span></label>
          <div className={styles.tagBox} onClick={() => document.getElementById('tagInput')?.focus()}>
            <Tag size={13} className={styles.tagBoxIcon} />
            {tags.map((t, i) => (
              <span key={i} className={styles.tagPill}>
                {t}
                <button type="button" className={styles.tagRemove} onClick={() => removeTag(i)}>×</button>
              </span>
            ))}
            {tags.length < MAX_TAGS && (
              <input
                id="tagInput"
                className={styles.tagInput}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={() => addTag(tagInput)}
                placeholder={tags.length === 0 ? 'Música, Rave...' : ''}
              />
            )}
          </div>
        </div>
        <div className={styles.field}>
          <label>Tipo</label>
          <div className={styles.inputWrap}>
            <Layers size={14} />
            <select name="event_type" value={formData.event_type} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="show">Show</option>
              <option value="festival">Festival</option>
              <option value="workshop">Workshop</option>
              <option value="exposicao">Exposição</option>
              <option value="feira">Feira</option>
              <option value="esporte">Esporte</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>
        <div className={styles.field}>
          <label>Status</label>
          <div className={styles.inputWrap}>
            <ToggleLeft size={14} />
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
        </div>
        <div className={styles.field}>
          <label>Início</label>
          <div className={styles.inputWrap}>
            <Calendar size={14} />
            <input type="datetime-local" name="starts_at" value={formData.starts_at} onChange={handleChange} required />
          </div>
        </div>
        <div className={styles.field}>
          <label>Término</label>
          <div className={styles.inputWrap}>
            <Calendar size={14} />
            <input type="datetime-local" name="ends_at" value={formData.ends_at} onChange={handleChange} />
          </div>
        </div>
        <div className={styles.field}>
          <label>Local</label>
          <div className={styles.inputWrap}>
            <MapPin size={14} />
            <input name="location_name" value={formData.location_name} onChange={handleChange} placeholder="Nome do local" />
          </div>
        </div>
        <div className={styles.field}>
          <label>Endereço</label>
          <div className={styles.inputWrap}>
            <MapPin size={14} />
            <input name="location_address" value={formData.location_address} onChange={handleChange} placeholder="Endereço completo" />
          </div>
        </div>
        <div className={styles.field}>
          <label>Link de Inscrição</label>
          <div className={styles.inputWrap}>
            <Link size={14} />
            <input name="registration_url" value={formData.registration_url} onChange={handleChange} placeholder="https://..." />
          </div>
        </div>
        <div className={styles.field}>
          <label>Máx. Participantes</label>
          <div className={styles.inputWrap}>
            <Users size={14} />
            <input type="number" name="max_attendees" value={formData.max_attendees ?? ''} onChange={handleChange} placeholder="0" min={0} />
          </div>
        </div>
        <div className={styles.field}>
          <label>Preço (R$)</label>
          <div className={styles.inputWrap}>
            <DollarSign size={14} />
            <input type="number" name="price" value={formData.price ?? ''} onChange={handleChange} placeholder="0,00" min={0} step="0.01" />
          </div>
        </div>
      </div>
      <div className={styles.field}>
        <label>Descrição</label>
        <div className={styles.inputWrap}>
          <AlignLeft size={14} style={{ top: 10, alignSelf: 'flex-start', position: 'absolute' }} />
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Breve descrição do evento..." required style={{ paddingLeft: 34 }} />
        </div>
      </div>
      <div className={styles.field}>
        <label>Imagem de Capa</label>
        <div className={styles.inputWrap}>
          <Image size={14} />
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ paddingLeft: 34 }} />
        </div>
      </div>
      <div className={styles.featuredRow}>
        <label className={styles.featuredLabel}>
          <input
            type="checkbox"
            name="featured"
            checked={!!formData.featured}
            onChange={handleChange}
            className={styles.featuredCheck}
          />
          <Star size={14} />
          Destacar evento
        </label>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>{isEdit ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>
  );
};

export default EventForm;
