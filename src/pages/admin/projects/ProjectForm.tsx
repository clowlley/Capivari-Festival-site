import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import type { Project, ProjectPhoto, ProjectVideo, ProjectTrack } from '@/types/project.types';
import { projectService } from '@/services/projects.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import UploadOverlay from '@/components/ui/UploadOverlay';
import styles from './ProjectForm.module.css';

interface ProjectFormProps {
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_PHOTOS = 10;
const MAX_VIDEOS = 10;
const MAX_TRACKS = 20;

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSuccess, onCancel }) => {
  const isEdit = !!project;
  const toast = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const trackInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    full_content: '',
    video_url: '',
    category: '',
    status: 'draft',
    featured: false,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ProjectPhoto[]>([]);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState<ProjectVideo[]>([]);
  const [newTrackFiles, setNewTrackFiles] = useState<File[]>([]);
  const [existingTracks, setExistingTracks] = useState<ProjectTrack[]>([]);

  useEffect(() => {
    if (project) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync prop -> form state
      setFormData({
        title: project.title,
        description: project.description,
        full_content: project.full_content || '',
        video_url: project.video_url || '',
        category: project.category || '',
        status: project.status,
        featured: project.featured,
      });
      setExistingPhotos(project.photos || []);
      setExistingVideos(project.videos || []);
      setExistingTracks(project.tracks || []);
    }
  }, [project]);

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
  const removeNewPhoto = (index: number) => setNewPhotoFiles(prev => prev.filter((_, i) => i !== index));
  const handleDeleteExistingPhoto = async (photo: ProjectPhoto) => {
    try {
      await projectService.deletePhoto(photo.id);
      setExistingPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch {
      toast.error('Erro ao remover foto.');
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_VIDEOS - existingVideos.length - newVideoFiles.length;
    setNewVideoFiles(prev => [...prev, ...files].slice(0, prev.length + remaining));
    e.target.value = '';
  };
  const removeNewVideo = (index: number) => setNewVideoFiles(prev => prev.filter((_, i) => i !== index));
  const handleDeleteExistingVideo = async (video: ProjectVideo) => {
    if (!confirm('Remover este vídeo?')) return;
    try {
      await projectService.deleteVideo(video.id);
      setExistingVideos(prev => prev.filter(v => v.id !== video.id));
    } catch {
      toast.error('Erro ao remover vídeo.');
    }
  };

  const handleTrackSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_TRACKS - existingTracks.length - newTrackFiles.length;
    setNewTrackFiles(prev => [...prev, ...files].slice(0, prev.length + remaining));
    e.target.value = '';
  };
  const removeNewTrack = (index: number) => setNewTrackFiles(prev => prev.filter((_, i) => i !== index));
  const handleDeleteExistingTrack = async (track: ProjectTrack) => {
    if (!confirm('Remover esta música?')) return;
    try {
      await projectService.deleteTrack(track.id);
      setExistingTracks(prev => prev.filter(t => t.id !== track.id));
    } catch {
      toast.error('Erro ao remover música.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadPct(0);
    setProcessing(false);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) data.append(key, value.toString());
      });
      if (coverFile) data.append('cover_image_file', coverFile);
      newPhotoFiles.forEach(f => data.append('photo_files', f));
      newVideoFiles.forEach(f => data.append('video_files', f));
      newTrackFiles.forEach(f => data.append('track_files', f));

      const onProgress = (pct: number) => {
        setUploadPct(pct);
        if (pct >= 100) setProcessing(true);
      };

      if (isEdit && project?.id) {
        await projectService.updateProject(project.id, data, onProgress);
        toast.success('Projeto atualizado com sucesso!');
      } else {
        await projectService.createProject(data, onProgress);
        toast.success('Projeto criado com sucesso!');
      }
      onSuccess();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao salvar projeto.');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const totalPhotos = existingPhotos.length + newPhotoFiles.length;
  const canAddMorePhotos = totalPhotos < MAX_PHOTOS;
  const totalVideos = existingVideos.length + newVideoFiles.length;
  const canAddMoreVideos = totalVideos < MAX_VIDEOS;
  const totalTracks = existingTracks.length + newTrackFiles.length;
  const canAddMoreTracks = totalTracks < MAX_TRACKS;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <UploadOverlay visible={loading} pct={uploadPct} processing={processing} />
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Título do Projeto</label>
          <input name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className={styles.field}>
          <label>Categoria</label>
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Ex: Social, Infraestrutura" />
        </div>
        <div className={styles.field}>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div className={styles.checkboxField}>
          <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
          <label htmlFor="featured">Destaque na página inicial</label>
        </div>
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
        <label>URL do Vídeo <span className={styles.hint}>(YouTube, Vimeo ou link direto)</span></label>
        <input name="video_url" value={formData.video_url || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
      </div>

      <div className={styles.field}>
        <label>Imagem de Capa</label>
        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setCoverFile(e.target.files[0])} />
        {coverFile && <p className={styles.helpText}>{coverFile.name}</p>}
        {isEdit && !coverFile && project?.cover_image && (
          <p className={styles.helpText}>Deixe vazio para manter a imagem atual.</p>
        )}
      </div>

      {/* ── Fotos ── */}
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
          {canAddMorePhotos && (
            <button type="button" className={styles.addPhoto} onClick={() => photoInputRef.current?.click()}>
              <Plus size={20} />
              <span>{MAX_PHOTOS - totalPhotos} restante{MAX_PHOTOS - totalPhotos !== 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
      </div>

      {/* ── Vídeos ── */}
      <div className={styles.field}>
        <label>Vídeos <span className={styles.hint}>(máximo {MAX_VIDEOS} — MP4, MOV, WebM)</span></label>
        <div className={styles.photosGrid}>
          {existingVideos.map(v => (
            <div key={v.id} className={styles.photoThumb}>
              <video src={v.video_url} muted preload="metadata" />
              <button type="button" className={styles.removePhoto} onClick={() => handleDeleteExistingVideo(v)}>
                <X size={12} />
              </button>
            </div>
          ))}
          {newVideoFiles.map((f, i) => (
            <div key={`newv-${i}`} className={styles.photoThumb}>
              <video src={URL.createObjectURL(f)} muted preload="metadata" />
              <button type="button" className={styles.removePhoto} onClick={() => removeNewVideo(i)}>
                <X size={12} />
              </button>
            </div>
          ))}
          {canAddMoreVideos && (
            <button type="button" className={styles.addPhoto} onClick={() => videoInputRef.current?.click()}>
              <Plus size={20} />
              <span>{MAX_VIDEOS - totalVideos} restante{MAX_VIDEOS - totalVideos !== 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
        <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" multiple style={{ display: 'none' }} onChange={handleVideoSelect} />
      </div>

      {/* ── Músicas / Set ── */}
      <div className={styles.field}>
        <label>Músicas / Set <span className={styles.hint}>(máximo {MAX_TRACKS} — MP3, WAV, M4A, OGG)</span></label>
        <div className={styles.trackList}>
          {existingTracks.map(t => (
            <div key={t.id} className={styles.trackItem}>
              <audio src={t.audio_url} controls preload="metadata" />
              <div className={styles.trackInfo}>
                <span className={styles.trackTitle}>{t.title || 'Sem título'}</span>
              </div>
              <button type="button" className={styles.trackRemove} onClick={() => handleDeleteExistingTrack(t)}>
                <X size={14} />
              </button>
            </div>
          ))}
          {newTrackFiles.map((f, i) => (
            <div key={`newt-${i}`} className={styles.trackItem}>
              <audio src={URL.createObjectURL(f)} controls preload="metadata" />
              <div className={styles.trackInfo}>
                <span className={styles.trackTitle}>{f.name.replace(/\.[^.]+$/, '')}</span>
                <span className={styles.trackNew}>NOVA</span>
              </div>
              <button type="button" className={styles.trackRemove} onClick={() => removeNewTrack(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
          {canAddMoreTracks && (
            <button type="button" className={styles.trackAdd} onClick={() => trackInputRef.current?.click()}>
              <Plus size={16} /> Adicionar música ({MAX_TRACKS - totalTracks} restante{MAX_TRACKS - totalTracks !== 1 ? 's' : ''})
            </button>
          )}
        </div>
        <input ref={trackInputRef} type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/ogg,audio/aac" multiple style={{ display: 'none' }} onChange={handleTrackSelect} />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>{isEdit ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>
  );
};

export default ProjectForm;
