import React, { useState, useEffect } from 'react';
import type { Project } from '@/types/project.types';
import { projectService } from '@/services/projects.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import styles from './ProjectForm.module.css';

interface ProjectFormProps {
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSuccess, onCancel }) => {
  const isEdit = !!project;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    full_content: '',
    video_url: '',
    category: '',
    status: 'draft',
    featured: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

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
    }
  }, [project]);

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

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });

      if (selectedFile) {
        data.append('cover_image_file', selectedFile);
      }
      if (selectedVideoFile) {
        data.append('video_file', selectedVideoFile);
      }

      if (isEdit && project?.id) {
        await projectService.updateProject(project.id, data);
        toast.success('Projeto atualizado com sucesso!');
      } else {
        await projectService.createProject(data);
        toast.success('Projeto criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao salvar projeto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
        <label>URL do Vídeo <span style={{ fontWeight: 400, color: '#6b7280' }}>(YouTube, Vimeo ou link direto)</span></label>
        <input name="video_url" value={formData.video_url || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
      </div>
      <div className={styles.field}>
        <label>Vídeo Local <span style={{ fontWeight: 400, color: '#6b7280' }}>(mp4, webm — tem prioridade sobre a URL)</span></label>
        <input type="file" accept="video/*" onChange={handleVideoFileChange} />
        {isEdit && !selectedVideoFile && project?.video_url && !project.video_url.startsWith('http') && (
          <p className={styles.helpText}>Mantenha vazio para manter o vídeo atual.</p>
        )}
      </div>
      <div className={styles.field}>
        <label>Imagem de Capa</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {isEdit && !selectedFile && project?.cover_image && (
          <p className={styles.helpText}>Mantenha vazio para manter a imagem atual.</p>
        )}
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>{isEdit ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>
  );
};

export default ProjectForm;