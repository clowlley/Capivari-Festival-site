import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import type { Artist, ArtistPhoto } from '@/types/artist.types';
import { artistsService } from '@/services/artists.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import styles from './ArtistForm.module.css';

interface Props {
  artist?: Artist | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_PHOTOS = 4;

const ArtistForm: React.FC<Props> = ({ artist, onSuccess, onCancel }) => {
  const isEdit = !!artist;
  const toast = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project_name: '',
    age: '',
    musical_styles: '',
    presskit_url: '',
    career_years: '',
    biography: '',
    status: 'draft' as 'draft' | 'published',
    featured: false,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ArtistPhoto[]>([]);

  useEffect(() => {
    if (artist) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync prop -> form state
      setFormData({
        name: artist.name,
        project_name: artist.project_name || '',
        age: artist.age != null ? String(artist.age) : '',
        musical_styles: artist.musical_styles || '',
        presskit_url: artist.presskit_url || '',
        career_years: artist.career_years != null ? String(artist.career_years) : '',
        biography: artist.biography || '',
        status: artist.status,
        featured: artist.featured,
      });
      setExistingPhotos(artist.photos || []);
    }
  }, [artist]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - existingPhotos.length - newPhotoFiles.length;
    setNewPhotoFiles(prev => [...prev, ...files].slice(0, prev.length + remaining));
    e.target.value = '';
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingPhoto = async (photo: ArtistPhoto) => {
    try {
      await artistsService.deletePhoto(photo.id);
      setExistingPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch {
      toast.error('Erro ao remover foto.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, String(v)));
      if (coverFile) data.append('cover_image_file', coverFile);
      if (profileFile) data.append('profile_image_file', profileFile);
      newPhotoFiles.forEach(f => data.append('photo_files', f));

      if (isEdit && artist?.id) {
        await artistsService.updateArtist(artist.id, data);
        toast.success('Artista atualizado!');
      } else {
        await artistsService.createArtist(data);
        toast.success('Artista cadastrado!');
      }
      onSuccess();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const totalPhotos = existingPhotos.length + newPhotoFiles.length;
  const canAddMore = totalPhotos < MAX_PHOTOS;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label>Nome do Artista *</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className={styles.field}>
          <label>Nome do Projeto / Banda</label>
          <input name="project_name" value={formData.project_name} onChange={handleChange} placeholder="Ex: Banda Capivari" />
        </div>
        <div className={styles.field}>
          <label>Idade</label>
          <input name="age" type="number" min="1" max="120" value={formData.age} onChange={handleChange} placeholder="Ex: 28" />
        </div>
        <div className={styles.field}>
          <label>Tempo de Carreira (anos)</label>
          <input name="career_years" type="number" min="0" value={formData.career_years} onChange={handleChange} placeholder="Ex: 5" />
        </div>
        <div className={styles.field}>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div className={styles.checkField}>
          <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
          <label htmlFor="featured">Destaque</label>
        </div>
      </div>

      <div className={styles.field}>
        <label>Vertentes Musicais <span className={styles.hint}>(separe por vírgulas)</span></label>
        <input name="musical_styles" value={formData.musical_styles} onChange={handleChange} placeholder="Ex: Sertanejo, Pop, MPB" />
        {formData.musical_styles && (
          <div className={styles.tags}>
            {formData.musical_styles.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
              <span key={i} className={styles.tag}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label>Link do Presskit</label>
        <input name="presskit_url" value={formData.presskit_url} onChange={handleChange} placeholder="https://drive.google.com/..." />
      </div>

      <div className={styles.field}>
        <label>Biografia</label>
        <textarea name="biography" value={formData.biography} onChange={handleChange} rows={5} placeholder="Conte a história do artista..." />
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label>Imagem de Capa</label>
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setCoverFile(e.target.files[0])} />
          {coverFile && <p className={styles.fileName}>{coverFile.name}</p>}
          {isEdit && !coverFile && artist?.cover_image && (
            <p className={styles.helpText}>Deixe vazio para manter a atual.</p>
          )}
        </div>
        <div className={styles.field}>
          <label>Imagem de Perfil</label>
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setProfileFile(e.target.files[0])} />
          {profileFile && <p className={styles.fileName}>{profileFile.name}</p>}
          {isEdit && !profileFile && artist?.profile_image && (
            <p className={styles.helpText}>Deixe vazio para manter a atual.</p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label>Fotos <span className={styles.hint}>(máximo {MAX_PHOTOS})</span></label>
        <div className={styles.photosGrid}>
          {existingPhotos.map(p => (
            <div key={p.id} className={styles.photoThumb}>
              <img src={p.image} alt="" />
              <button type="button" className={styles.removePhoto} onClick={() => handleDeleteExistingPhoto(p)}>
                <X size={12} />
              </button>
            </div>
          ))}
          {newPhotoFiles.map((f, i) => (
            <div key={`new-${i}`} className={styles.photoThumb}>
              <img src={URL.createObjectURL(f)} alt="" />
              <button type="button" className={styles.removePhoto} onClick={() => removeNewPhoto(i)}>
                <X size={12} />
              </button>
            </div>
          ))}
          {canAddMore && (
            <button type="button" className={styles.addPhoto} onClick={() => photoInputRef.current?.click()}>
              <Plus size={20} />
              <span>{MAX_PHOTOS - totalPhotos} restante{MAX_PHOTOS - totalPhotos !== 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handlePhotoSelect}
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>{isEdit ? 'Atualizar' : 'Cadastrar'}</Button>
      </div>
    </form>
  );
};

export default ArtistForm;
